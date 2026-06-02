/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "shared-does-not-import-backend-or-apps",
      severity: "error",
      from: { path: "^packages/shared" },
      to: { path: "^(packages/(backend-domain|backend-infra)|apps/)" },
    },
    {
      name: "backend-domain-does-not-import-infra-or-server",
      severity: "error",
      from: { path: "^packages/backend-domain" },
      to: { path: "^(packages/backend-infra|apps/server)" },
    },
    {
      name: "backend-domain-does-not-import-runtime-sql-or-http",
      severity: "error",
      from: { path: "^packages/backend-domain" },
      to: {
        path: "^(@effect/sql|@effect/platform-node|@effect/platform/.+Http|effect/unstable/(sql|http)|jose$|node:|(?:assert|buffer|child_process|crypto|events|fs|http|https|net|os|path|stream|timers|tls|url|util|worker_threads)$|apps/server/src/http|apps/server/src/modules/[^/]+/handlers\\.ts$)",
      },
    },
    {
      name: "backend-infra-does-not-import-server",
      severity: "error",
      from: { path: "^packages/backend-infra" },
      to: { path: "^apps/server" },
    },
    {
      name: "webapp-ui-is-primitive-only",
      severity: "error",
      from: { path: "^apps/webapp/src/components/ui" },
      to: {
        path: "^apps/webapp/src/(api|modules|components/screens|router|routes)",
      },
    },
    {
      name: "webapp-patterns-do-not-import-state-or-routes",
      severity: "error",
      from: { path: "^apps/webapp/src/components/patterns" },
      to: {
        path: "^apps/webapp/src/(api|modules|components/screens|router|routes)",
      },
    },
    {
      name: "webapp-modules-do-not-import-screens-or-router",
      severity: "error",
      from: { path: "^apps/webapp/src/modules" },
      to: { path: "^apps/webapp/src/(components/screens|router|routes)" },
    },
    {
      name: "webapp-screens-do-not-call-api-directly",
      severity: "error",
      from: { path: "^apps/webapp/src/components/screens" },
      to: { path: "^apps/webapp/src/api" },
    },
    {
      name: "server-transport-does-not-import-repositories",
      severity: "error",
      from: {
        path: "^apps/server/src/(modules/[^/]+/handlers\\.ts|http/middleware/[^/]+\\.ts)$",
      },
      to: {
        path: "^(packages/(backend-domain|backend-infra)/src/modules/[^/]+/.+repository(\\.|$)|apps/server/src/modules/[^/]+/.+repository(\\.|$))",
      },
    },
    {
      name: "server-domain-services-do-not-import-sql-or-http",
      severity: "error",
      from: {
        path: "^(packages/backend-domain/src/modules/[^/]+/.+service(\\.live|\\.mock)?\\.ts|apps/server/src/modules/[^/]+/.+service(\\.live|\\.mock)?\\.ts)$",
      },
      to: {
        path: "^(effect/unstable/(sql|http)|@effect/sql|apps/server/src/http)",
      },
    },
    {
      name: "repositories-do-not-import-http",
      severity: "error",
      from: {
        path: "^(packages/(backend-domain|backend-infra)/src/modules/[^/]+/.+repository(\\.|$)|apps/server/src/modules/[^/]+/.+repository(\\.|$))",
      },
      to: { path: "^(effect/unstable/http|apps/server/src/http)" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
    },
    tsPreCompilationDeps: true,
    reporterOptions: {
      dot: { collapsePattern: "node_modules/[^/]+" },
    },
  },
}
