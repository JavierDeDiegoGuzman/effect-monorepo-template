#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs"
import { relative, sep } from "node:path"

const repoRoot = process.cwd()
const webappSrc = "apps/webapp/src"
const screenDir = `${webappSrc}/components/screens`
const routeEntrypoints = [`${webappSrc}/router.tsx`, `${webappSrc}/routes`]
const syncHooksDir = `${webappSrc}/hooks/sync`
const sourceExtensions = new Set([".ts", ".tsx"])
const intrinsicTagPattern = /<[a-z][A-Za-z0-9-]*(?=[\s>/])/g
const directEffectPatterns = [
  {
    name: "direct React effect import",
    pattern:
      /import\s*\{[^}]*\buse(?:Layout)?Effect\b[^}]*\}\s*from\s*["']react["']/g,
  },
  {
    name: "direct React effect call",
    pattern: /\b(?:React\.)?use(?:Layout)?Effect\s*\(/g,
  },
]

function exists(path) {
  try {
    statSync(path)
    return true
  } catch {
    return false
  }
}

function isFile(path) {
  return exists(path) && statSync(path).isFile()
}

function isDirectory(path) {
  return exists(path) && statSync(path).isDirectory()
}

function extensionOf(path) {
  const match = /\.[^.]+$/.exec(path)
  return match?.[0] ?? ""
}

function walk(path) {
  if (!exists(path)) return []
  if (isFile(path)) return sourceExtensions.has(extensionOf(path)) ? [path] : []

  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = `${path}/${entry.name}`
    if (entry.isDirectory()) return walk(child)
    return sourceExtensions.has(extensionOf(child)) ? [child] : []
  })
}

function lineNumberForIndex(text, index) {
  let line = 1
  for (let i = 0; i < index; i += 1) {
    if (text.charCodeAt(i) === 10) line += 1
  }
  return line
}

function lineAt(text, lineNumber) {
  return text.split(/\r?\n/)[lineNumber - 1] ?? ""
}

function hasAllowCommentNearby(lines, lineNumber, ruleName) {
  const start = Math.max(0, lineNumber - 3)
  const end = lineNumber

  for (let i = start; i < end; i += 1) {
    if (lines[i]?.includes(`architecture-allow: ${ruleName}`)) return true
  }

  return false
}

function relativePath(path) {
  return relative(repoRoot, path).split(sep).join("/")
}

const violations = []

const screenAndRouteFiles = [
  ...walk(screenDir),
  ...routeEntrypoints.flatMap((path) => walk(path)),
]

for (const file of screenAndRouteFiles) {
  const text = readFileSync(file, "utf8")
  const lines = text.split(/\r?\n/)
  for (const match of text.matchAll(intrinsicTagPattern)) {
    const line = lineNumberForIndex(text, match.index ?? 0)
    if (hasAllowCommentNearby(lines, line, "intrinsic-jsx")) continue

    violations.push({
      file,
      line,
      rule: "intrinsic-jsx",
      message:
        "Screens and routes should compose named pattern/domain components instead of owning intrinsic JSX.",
      source: lineAt(text, line).trim(),
    })
  }
}

for (const file of walk(webappSrc)) {
  if (isDirectory(syncHooksDir) && file.startsWith(`${syncHooksDir}/`)) continue

  const text = readFileSync(file, "utf8")
  for (const { name, pattern } of directEffectPatterns) {
    for (const match of text.matchAll(pattern)) {
      const line = lineNumberForIndex(text, match.index ?? 0)
      violations.push({
        file,
        line,
        rule: "direct-effect-usage",
        message: `${name} is restricted outside src/hooks/sync. Use a project synchronization hook instead.`,
        source: lineAt(text, line).trim(),
      })
    }
  }
}

if (violations.length > 0) {
  console.error("Webapp architecture check failed:\n")
  for (const violation of violations) {
    console.error(
      `${relativePath(violation.file)}:${violation.line} [${violation.rule}] ${violation.message}`,
    )
    if (violation.source.length > 0) console.error(`  ${violation.source}`)
  }
  process.exitCode = 1
} else {
  console.log("Webapp architecture check passed.")
}
