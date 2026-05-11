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
        path: "^apps/webapp/src/(atoms|api|components/(screens|domain)|routes)",
      },
    },
    {
      name: "webapp-patterns-do-not-import-state-or-routes",
      severity: "error",
      from: { path: "^apps/webapp/src/components/patterns" },
      to: { path: "^apps/webapp/src/(atoms|api|components/screens|routes)" },
    },
    {
      name: "webapp-domain-is-props-first",
      severity: "error",
      from: { path: "^apps/webapp/src/components/domain" },
      to: { path: "^apps/webapp/src/(atoms|api|components/screens|routes)" },
    },
    {
      name: "webapp-screens-do-not-call-api-directly",
      severity: "error",
      from: { path: "^apps/webapp/src/components/screens" },
      to: { path: "^apps/webapp/src/api" },
    },
    {
      name: "webapp-routes-stay-thin",
      severity: "error",
      from: { path: "^apps/webapp/src/routes" },
      to: {
        path: "^apps/webapp/src/(atoms|api|components/(domain|patterns/ui|ui))",
      },
    },
    {
      name: "webapp-atoms-do-not-import-components",
      severity: "error",
      from: { path: "^apps/webapp/src/atoms" },
      to: { path: "^apps/webapp/src/components" },
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
