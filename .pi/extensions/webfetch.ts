// Esta extensión añade una tool webfetch para consultar URLs externas desde pi.
// Implementa límites de tamaño/timeout y devuelve HTML, texto o markdown simplificado.

import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import {
  DEFAULT_MAX_BYTES,
  DEFAULT_MAX_LINES,
  formatSize,
  truncateHead,
} from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";

const MAX_RESPONSE_SIZE = 5 * 1024 * 1024;
const DEFAULT_TIMEOUT_SECONDS = 30;
const MAX_TIMEOUT_SECONDS = 120;

export default function webfetchExtension(pi: ExtensionAPI) {
  pi.registerTool({
    name: "webfetch",
    label: "Web Fetch",
    description:
      "Fetch content from an HTTP/HTTPS URL and return it as markdown, text, or HTML. Limits response size to 5MB and truncates large outputs.",
    promptSnippet: "Fetch a URL over HTTP/HTTPS and return markdown, text, or HTML.",
    promptGuidelines: [
      "Use webfetch when the user explicitly needs information from a URL or external webpage.",
      "Prefer format='text' or format='markdown' unless raw HTML is specifically needed.",
      "Do not use webfetch for local files or non-http(s) URLs.",
    ],
    parameters: Type.Object({
      url: Type.String({ description: "The URL to fetch." }),
      format: Type.Optional(
        Type.Union([
          Type.Literal("text"),
          Type.Literal("markdown"),
          Type.Literal("html"),
        ]),
      ),
      timeout: Type.Optional(Type.Number({ description: "Timeout in seconds (max 120)." })),
    }),
    async execute(_toolCallId, params, signal) {
      const inputUrl = normalizeUrl(params.url);
      const timeoutMs = clampTimeoutMs(params.timeout);
      const format = params.format ?? "markdown";

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(new Error("Request timed out")), timeoutMs);
      const abort = () => controller.abort(new Error("Request aborted"));
      signal?.addEventListener("abort", abort, { once: true });

      try {
        const response = await fetch(inputUrl, {
          method: "GET",
          headers: {
            "User-Agent": "pi-webfetch-extension/1.0",
            Accept: buildAcceptHeader(format),
            "Accept-Language": "en-US,en;q=0.9",
          },
          redirect: "follow",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status} ${response.statusText}`.trim());
        }

        const contentLength = response.headers.get("content-length");
        if (contentLength && Number(contentLength) > MAX_RESPONSE_SIZE) {
          throw new Error(`Response too large (${formatSize(Number(contentLength))}, max ${formatSize(MAX_RESPONSE_SIZE)})`);
        }

        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength > MAX_RESPONSE_SIZE) {
          throw new Error(`Response too large (${formatSize(arrayBuffer.byteLength)}, max ${formatSize(MAX_RESPONSE_SIZE)})`);
        }

        const contentType = response.headers.get("content-type") ?? "application/octet-stream";
        const mime = contentType.split(";")[0]?.trim().toLowerCase() ?? "application/octet-stream";
        const raw = new TextDecoder().decode(arrayBuffer);
        const rendered = renderContent(raw, mime, format);
        const title = `${response.url} (${contentType})`;
        const truncated = await truncateWithTempFile(rendered, mime);

        return {
          content: [{ type: "text", text: `${title}\n\n${truncated.content}` }],
          details: {
            url: response.url,
            status: response.status,
            contentType,
            format,
            bytes: arrayBuffer.byteLength,
            truncated: truncated.truncated,
            fullOutputPath: truncated.fullOutputPath,
          },
        };
      } catch (error) {
        if (controller.signal.aborted && !(error instanceof Error && error.message)) {
          throw new Error("Request aborted");
        }
        throw error instanceof Error ? error : new Error(String(error));
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener("abort", abort);
      }
    },
  });
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) throw new Error("URL is required");
  if (trimmed.startsWith("http://")) return `https://${trimmed.slice("http://".length)}`;
  if (!trimmed.startsWith("https://") && !trimmed.startsWith("http://")) {
    throw new Error("URL must start with http:// or https://");
  }
  return trimmed;
}

function clampTimeoutMs(timeoutSeconds?: number): number {
  const seconds = timeoutSeconds ?? DEFAULT_TIMEOUT_SECONDS;
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new Error("Timeout must be a positive number");
  }
  return Math.min(seconds, MAX_TIMEOUT_SECONDS) * 1000;
}

function buildAcceptHeader(format: "text" | "markdown" | "html"): string {
  switch (format) {
    case "markdown":
      return "text/markdown;q=1.0, text/x-markdown;q=0.9, text/plain;q=0.8, text/html;q=0.7, */*;q=0.1";
    case "text":
      return "text/plain;q=1.0, text/markdown;q=0.9, text/html;q=0.8, */*;q=0.1";
    case "html":
      return "text/html;q=1.0, application/xhtml+xml;q=0.9, text/plain;q=0.8, */*;q=0.1";
  }
}

function renderContent(raw: string, mime: string, format: "text" | "markdown" | "html"): string {
  if (isBinaryLike(mime)) {
    return `Fetched binary content (${mime}). Raw body omitted.`;
  }

  if (format === "html") return raw;
  if (!mime.includes("html")) return raw;

  if (format === "text") return htmlToText(raw);
  return htmlToMarkdown(raw);
}

function isBinaryLike(mime: string): boolean {
  return !(
    mime.startsWith("text/") ||
    mime.includes("json") ||
    mime.includes("xml") ||
    mime.includes("javascript") ||
    mime.includes("svg")
  );
}

function htmlToMarkdown(html: string): string {
  const text = htmlToText(html);
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .join("\n\n");
}

function htmlToText(html: string): string {
  let out = html;
  out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ");
  out = out.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");
  out = out.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ");
  out = out.replace(/<br\s*\/?>/gi, "\n");
  out = out.replace(/<\/(p|div|section|article|main|aside|header|footer|li|ul|ol|h[1-6]|tr|table|blockquote)>/gi, "\n");
  out = out.replace(/<li\b[^>]*>/gi, "- ");
  out = out.replace(/<[^>]+>/g, " ");
  out = decodeEntities(out);
  out = out.replace(/\r/g, "");
  out = out.replace(/[ \t]+\n/g, "\n");
  out = out.replace(/\n[ \t]+/g, "\n");
  out = out.replace(/\n{3,}/g, "\n\n");
  out = out.replace(/[ \t]{2,}/g, " ");
  return out.trim();
}

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#(\d+);/g, (_match, code) => {
      const parsed = Number(code);
      return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : _match;
    })
    .replace(/&#x([0-9a-f]+);/gi, (_match, hex) => {
      const parsed = Number.parseInt(hex, 16);
      return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : _match;
    });
}

async function truncateWithTempFile(content: string, mime: string) {
  const truncation = truncateHead(content, {
    maxBytes: DEFAULT_MAX_BYTES,
    maxLines: DEFAULT_MAX_LINES,
  });

  if (!truncation.truncated) {
    return { content: truncation.content, truncated: false as const, fullOutputPath: undefined as string | undefined };
  }

  const dir = await mkdtemp(join(tmpdir(), "pi-webfetch-"));
  const ext = mime.includes("html") ? ".html" : ".txt";
  const fullOutputPath = join(dir, `response${ext}`);
  await writeFile(fullOutputPath, content, "utf8");

  const note = `\n\n[Output truncated: ${truncation.outputLines} of ${truncation.totalLines} lines (${formatSize(truncation.outputBytes)} of ${formatSize(truncation.totalBytes)}). Full output saved to: ${fullOutputPath}]`;
  return {
    content: truncation.content + note,
    truncated: true as const,
    fullOutputPath,
  };
}
