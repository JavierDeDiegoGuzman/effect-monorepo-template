#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import ts from "typescript"

const roots = ["apps", "packages", "scripts"].filter((root) => existsSync(root))
const ignoredDirectories = new Set([
  ".git",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
])

function* walk(directory) {
  for (const entry of readdirSync(directory)) {
    if (ignoredDirectories.has(entry)) continue

    const path = join(directory, entry)
    const stat = statSync(path)

    if (stat.isDirectory()) {
      yield* walk(path)
      continue
    }

    if (/\.(?:cts|mts|tsx?|jsx?)$/.test(entry)) {
      yield path
    }
  }
}

function scriptKindFor(path) {
  if (path.endsWith(".tsx")) return ts.ScriptKind.TSX
  if (path.endsWith(".jsx")) return ts.ScriptKind.JSX
  if (path.endsWith(".js") || path.endsWith(".mjs")) return ts.ScriptKind.JS
  return ts.ScriptKind.TS
}

const violations = []

for (const root of roots) {
  for (const path of walk(root)) {
    const sourceText = readFileSync(path, "utf8")
    const sourceFile = ts.createSourceFile(
      path,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
      scriptKindFor(path),
    )

    const visit = (node) => {
      if (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node)) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(
          node.getStart(sourceFile),
        )
        violations.push({
          path,
          line: line + 1,
          column: character + 1,
          text: node.getText(sourceFile).replace(/\s+/g, " ").slice(0, 120),
        })
      }

      ts.forEachChild(node, visit)
    }

    visit(sourceFile)
  }
}

if (violations.length > 0) {
  console.error(
    "Type assertions are forbidden. Remove `as` / angle-bracket assertions:",
  )
  for (const violation of violations) {
    console.error(
      `- ${relative(process.cwd(), violation.path)}:${violation.line}:${violation.column} ${violation.text}`,
    )
  }
  process.exit(1)
}
