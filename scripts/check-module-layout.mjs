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
    requireIndex: true,
    enforceIndexImports: true,
  },
  {
    root: "packages/backend-domain/src/modules",
    allowed: new Set([
      "service.ts",
      "service.live.ts",
      "service.mock.ts",
      "repository.ts",
      "repository.memory.ts",
      "index.ts",
      "internal",
    ]),
    allowTest: true,
    requireIndex: true,
    enforceIndexImports: true,
    allowEntry: (entryName) =>
      /^[a-z0-9-]+\.service(\.live|\.mock)?\.ts$/.test(entryName) ||
      /^[a-z0-9-]+\.repository(\.memory)?\.ts$/.test(entryName),
  },
  {
    root: "packages/backend-infra/src/modules",
    allowed: new Set(["index.ts", "internal"]),
    allowTest: true,
    requireIndex: true,
    enforceIndexImports: true,
    allowEntry: (entryName) =>
      /^([a-z0-9-]+\.)?repository\.(sql|postgres)\.ts$/.test(entryName) ||
      /^[a-z0-9-]+\.service\.live\.ts$/.test(entryName),
  },
  {
    root: "apps/server/src/modules",
    allowed: new Set([
      "handlers.ts",
      "session-cookie.ts",
      "index.ts",
      "internal",
    ]),
    allowTest: true,
    requireIndex: false,
    enforceIndexImports: false,
  },
  {
    root: "apps/webapp/src/modules",
    allowed: new Set(["atoms.ts", "components", "index.ts", "internal"]),
    requireIndex: true,
    enforceIndexImports: true,
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

  for (const rootConfig of moduleRoots) {
    if (rootConfig.enforceIndexImports !== true) continue

    const absoluteRoot = normalizedAbsolute(rootConfig.root)
    if (!absoluteFile.startsWith(`${absoluteRoot}/`)) continue

    const rest = absoluteFile.slice(absoluteRoot.length + 1).split("/")
    return {
      root: rootConfig.root,
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

function isTestOrStoryFile(repoPath) {
  return (
    /\.(test|spec|stories)\.tsx?$/.test(repoPath) ||
    repoPath.includes("/src/test/")
  )
}

function isRepositoryFile(repoPath) {
  return /(^|\/)modules\/[^/]+\/.+repository(\.|$)/.test(repoPath)
}

function isSqlRepositoryFile(repoPath) {
  return /(^|\/)modules\/[^/]+\/.+repository\.(sql|postgres)\.ts$/.test(
    repoPath,
  )
}

function isDomainServiceFile(repoPath) {
  return (
    repoPath.startsWith("packages/backend-domain/src/modules/") &&
    /(^|\/)modules\/[^/]+\/.+service(\.live|\.mock)?\.ts$/.test(repoPath)
  )
}

for (const path of forbiddenPaths) {
  if (exists(path))
    addViolation(path, "Forbidden legacy architecture path exists.")
}

for (const {
  root,
  allowed,
  allowTest,
  requireIndex,
  allowEntry,
} of moduleRoots) {
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
    if (requireIndex === true && !exists(indexPath))
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
        allowTest === true && /^.+\.(test|spec)\.tsx?$/.test(entry.name)
      if (
        !allowed.has(entry.name) &&
        !isAllowedTest &&
        !(allowEntry?.(entry.name) ?? false)
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
  ...walk("packages/backend-domain/src"),
  ...walk("packages/backend-infra/src"),
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
    isSqlRepositoryFile(repoPath) &&
    !repoPath.startsWith("packages/backend-infra/src/modules/")
  ) {
    addViolation(
      repoPath,
      "SQL repository implementations must live in packages/backend-infra.",
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
    isRepositoryFile(repoPath) &&
    /lastInsertRowid|Random\.nextUUID/.test(text)
  ) {
    addViolation(
      repoPath,
      "Repositories must receive IDs from services and must not generate or read generated IDs.",
    )
  }

  if (
    isSqlRepositoryFile(repoPath) &&
    repoPath.startsWith("packages/backend-infra/src/modules/") &&
    !text.includes("sqlRepositoryHelpers")
  ) {
    addViolation(
      repoPath,
      "SQL/Postgres repository adapters must use shared sqlRepositoryHelpers for error/readback mapping.",
    )
  }

  for (const match of text.matchAll(importPattern)) {
    const specifier = match[1]

    if (
      !isTestOrStoryFile(repoPath) &&
      (specifier.includes("/test/") ||
        /^\.\.?\/?(?:\.\.\/)*test\//.test(specifier))
    ) {
      addViolation(
        repoPath,
        `Production source must not import test helpers or fixtures: ${specifier}`,
      )
    }

    if (
      repoPath.startsWith("packages/shared/src/") &&
      (/^@app\/(backend-domain|backend-infra)\b/.test(specifier) ||
        specifier.startsWith("@app/server") ||
        specifier.includes("apps/server") ||
        specifier.includes("apps/webapp"))
    ) {
      addViolation(
        repoPath,
        `Shared code must not import backend packages or apps: ${specifier}`,
      )
    }

    if (repoPath.startsWith("packages/backend-domain/src/")) {
      if (
        /^@app\/backend-infra\b/.test(specifier) ||
        specifier.startsWith("@app/server") ||
        specifier.includes("apps/server")
      ) {
        addViolation(
          repoPath,
          `Backend domain must not import infra or server code: ${specifier}`,
        )
      }

      if (
        /^(@effect\/sql|@effect\/platform-node|@effect\/platform\/.+Http|effect\/unstable\/(sql|http)|jose$|node:|(?:assert|buffer|child_process|crypto|events|fs|http|https|net|os|path|stream|timers|tls|url|util|worker_threads)$)/.test(
          specifier,
        )
      ) {
        addViolation(
          repoPath,
          `Backend domain must not import SQL, platform HTTP, jose, or Node runtime modules: ${specifier}`,
        )
      }
    }

    if (
      repoPath.startsWith("packages/backend-infra/src/") &&
      (specifier.startsWith("@app/server") || specifier.includes("apps/server"))
    ) {
      addViolation(
        repoPath,
        `Backend infra must not import server code: ${specifier}`,
      )
    }

    if (
      (repoPath.startsWith("apps/server/src/modules/") &&
        /handlers\.ts$/.test(repoPath)) ||
      repoPath.startsWith("apps/server/src/http/middleware/")
    ) {
      if (
        /repository(?:\.|$)/.test(specifier) ||
        /^@app\/backend-(domain|infra)\/modules\/[^/]+\/.*repository/.test(
          specifier,
        )
      ) {
        addViolation(
          repoPath,
          `Server transport must depend on backend-domain services, not repositories: ${specifier}`,
        )
      }
    }

    if (
      isDomainServiceFile(repoPath) &&
      /^(@effect\/sql|effect\/unstable\/(sql|http))/.test(specifier)
    ) {
      addViolation(
        repoPath,
        `Domain services must not import SQL or HTTP concerns: ${specifier}`,
      )
    }

    if (
      isRepositoryFile(repoPath) &&
      (specifier.includes("/http/") ||
        specifier.startsWith("effect/unstable/http"))
    ) {
      addViolation(
        repoPath,
        `Repository files must not import HTTP transport concerns: ${specifier}`,
      )
    }

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
      const context = moduleContextFor(file)
      if (context === null) continue

      const target = resolve(dirname(file), specifier).split(sep).join("/")
      if (!target.startsWith(`${context.absoluteRoot}/`)) continue

      const rest = target.slice(context.absoluteRoot.length + 1).split("/")
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
