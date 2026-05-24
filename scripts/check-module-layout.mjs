#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, extname, relative, resolve, sep } from "node:path"

const repoRoot = process.cwd()
const sourceExtensions = new Set([".ts", ".tsx"])
const violations = []

const forbiddenPaths = [
  "apps/webapp/src/features",
  "packages/shared/src/domain",
  "packages/shared/src/api/groups",
  "packages/shared/src/api/middleware",
  "apps/server/src/services",
  "apps/server/src/repositories",
  "apps/server/src/http/handlers",
  "apps/server/src/infra",
]

const moduleRoots = [
  {
    root: "packages/shared/src/modules",
    allowed: new Set([
      "schema.ts",
      "contract.ts",
      "errors.ts",
      "api.ts",
      "middleware.ts",
      "index.ts",
      "internal",
    ]),
  },
  {
    root: "apps/server/src/modules",
    allowed: new Set([
      "handlers.ts",
      "service.ts",
      "service.live.ts",
      "service.mock.ts",
      "repository.ts",
      "repository.sql.ts",
      "repository.postgres.ts",
      "repository.memory.ts",
      "index.ts",
      "internal",
    ]),
    allowTest: true,
  },
  {
    root: "apps/webapp/src/modules",
    allowed: new Set(["atoms.ts", "components", "index.ts", "internal"]),
  },
]

function exists(path) {
  return existsSync(path)
}

function isDirectory(path) {
  return exists(path) && statSync(path).isDirectory()
}

function toRepoPath(path) {
  return relative(repoRoot, path).split(sep).join("/")
}

function normalizedAbsolute(path) {
  return resolve(repoRoot, path).split(sep).join("/")
}

function moduleContextFor(file) {
  const absoluteFile = normalizedAbsolute(file)

  for (const { root } of moduleRoots) {
    const absoluteRoot = normalizedAbsolute(root)
    if (!absoluteFile.startsWith(`${absoluteRoot}/`)) continue

    const rest = absoluteFile.slice(absoluteRoot.length + 1).split("/")
    return {
      root,
      absoluteRoot,
      moduleName: rest[0],
    }
  }

  return null
}

function walk(path) {
  if (!exists(path)) return []
  const stat = statSync(path)
  if (stat.isFile()) return sourceExtensions.has(extname(path)) ? [path] : []
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = `${path}/${entry.name}`
    return entry.isDirectory() ? walk(child) : walk(child)
  })
}

function addViolation(file, message) {
  violations.push({ file, message })
}

for (const path of forbiddenPaths) {
  if (exists(path))
    addViolation(path, "Forbidden legacy architecture path exists.")
}

for (const { root, allowed, allowTest } of moduleRoots) {
  if (!isDirectory(root)) continue

  for (const moduleEntry of readdirSync(root, { withFileTypes: true })) {
    if (!moduleEntry.isDirectory()) {
      addViolation(
        `${root}/${moduleEntry.name}`,
        "Module roots may only contain module directories.",
      )
      continue
    }

    const moduleDir = `${root}/${moduleEntry.name}`
    const indexPath = `${moduleDir}/index.ts`
    if (!exists(indexPath))
      addViolation(moduleDir, "Module is missing index.ts public API.")

    for (const entry of readdirSync(moduleDir, { withFileTypes: true })) {
      const entryPath = `${moduleDir}/${entry.name}`
      if (entry.name === "README.md") {
        addViolation(
          entryPath,
          "Module-local README.md files are not allowed; document architecture in docs/*.",
        )
        continue
      }

      const isAllowedTest =
        allowTest === true && /^.+\.test\.ts$/.test(entry.name)
      const isAllowedSubService =
        root === "apps/server/src/modules" &&
        /^[a-z0-9-]+\.service(\.live|\.mock)?\.ts$/.test(entry.name)
      const isAllowedSubRepository =
        root === "apps/server/src/modules" &&
        /^[a-z0-9-]+\.repository(\.memory|\.sql|\.postgres)?\.ts$/.test(
          entry.name,
        )
      const isAllowedCookieAdapter =
        root === "apps/server/src/modules" &&
        /^[a-z0-9-]+-cookie\.ts$/.test(entry.name)
      if (
        !allowed.has(entry.name) &&
        !isAllowedTest &&
        !isAllowedSubService &&
        !isAllowedSubRepository &&
        !isAllowedCookieAdapter
      ) {
        addViolation(entryPath, `Entry is not allowed in ${root} modules.`)
      }
    }
  }
}

const importPattern =
  /(?:import|export)\s+(?:type\s+)?(?:[^"']*?from\s+)?["']([^"']+)["']/g
const allSourceFiles = [
  ...walk("packages/shared/src"),
  ...walk("apps/server/src"),
  ...walk("apps/webapp/src"),
]

for (const file of allSourceFiles) {
  const repoPath = toRepoPath(file)
  const text = readFileSync(file, "utf8")

  if (/repository\.(json|drizzle\.postgres)\.ts$/.test(repoPath)) {
    addViolation(
      repoPath,
      "Legacy JSON/Drizzle repository adapters are not allowed.",
    )
  }

  if (
    repoPath.startsWith("packages/shared/src/modules/") &&
    text.includes("NumberFromString")
  ) {
    addViolation(
      repoPath,
      "Shared module route params must use branded ID schemas, not NumberFromString.",
    )
  }

  if (
    repoPath.startsWith("packages/shared/src/modules/") &&
    /\b(id|userId):\s*Schema\.Number\b/.test(text)
  ) {
    addViolation(
      repoPath,
      "Public module IDs must use branded UUID schemas, not Schema.Number.",
    )
  }

  if (
    repoPath.startsWith("apps/server/src/modules/") &&
    /repository\.(sql|postgres|memory)\.ts$/.test(repoPath) &&
    /lastInsertRowid|Random\.nextUUID/.test(text)
  ) {
    addViolation(
      repoPath,
      "Repositories must receive IDs from services and must not generate or read generated IDs.",
    )
  }

  for (const match of text.matchAll(importPattern)) {
    const specifier = match[1]

    if (/modules\/[A-Za-z0-9_-]+\/internal\//.test(specifier)) {
      addViolation(
        repoPath,
        `Import from another module's internal/ is not allowed: ${specifier}`,
      )
    }

    if (specifier.startsWith("@/modules/")) {
      const rest = specifier.slice("@/modules/".length).split("/")
      if (rest.length > 1) {
        addViolation(
          repoPath,
          `External webapp module imports must target the module index: ${specifier}`,
        )
      }
    }

    for (const prefix of [
      "../modules/",
      "../../modules/",
      "../../../modules/",
    ]) {
      if (!specifier.startsWith(prefix)) continue
      const rest = specifier.slice(prefix.length).split("/")
      if (rest.length > 1) {
        addViolation(
          repoPath,
          `External module imports must target the module index: ${specifier}`,
        )
      }
    }

    if (specifier.startsWith(".")) {
      const context = moduleContextFor(file)
      if (context === null) continue

      const target = resolve(dirname(file), specifier).split(sep).join("/")
      if (!target.startsWith(`${context.absoluteRoot}/`)) continue

      const rest = target.slice(context.absoluteRoot.length + 1).split("/")
      const targetModule = rest[0]
      if (targetModule === context.moduleName) continue

      if (rest.length > 1) {
        addViolation(
          repoPath,
          `Cross-module relative imports must target the module index: ${specifier}`,
        )
      }
    }
  }
}

if (violations.length > 0) {
  console.error("Module layout check failed:\n")
  for (const violation of violations) {
    console.error(`${violation.file}: ${violation.message}`)
  }
  process.exitCode = 1
} else {
  console.log("Module layout check passed.")
}
