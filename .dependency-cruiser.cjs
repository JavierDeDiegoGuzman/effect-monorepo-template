/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "shared-does-not-import-apps",
      severity: "error",
      from: { path: "^packages/shared" },
      to: { path: "^apps/(server|webapp)" },
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
      name: "server-handlers-do-not-import-repositories",
      severity: "error",
      from: {
        path: "^apps/server/src/modules/[^/]+/handlers\\.ts$",
      },
      to: {
        path: "^apps/server/src/modules/[^/]+/.+repository(\\.|$)",
      },
    },
    {
      name: "server-services-do-not-import-http",
      severity: "error",
      from: {
        path: "^apps/server/src/modules/[^/]+/service(\\.live|\\.mock)?\\.ts$",
      },
      to: { path: "^apps/server/src/http" },
    },
    {
      name: "server-repositories-do-not-import-http",
      severity: "error",
      from: {
        path: "^apps/server/src/modules/[^/]+/.+repository(\\.|$)",
      },
      to: { path: "^apps/server/src/http" },
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
