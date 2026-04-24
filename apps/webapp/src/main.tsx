import { RegistryProvider } from "@effect/atom-react"
import * as React from "react"
import { createRoot } from "react-dom/client"
import { ErrorBoundary } from "react-error-boundary"
import { Router } from "wouter"
import { useHashLocation } from "wouter/use-hash-location"
import "./styles/globals.css"
import { AppRouter } from "./components/AppRouter"

function Root() {
  return (
    <RegistryProvider>
      <ErrorBoundary
        fallback={<div style={fallbackStyle}>Could not load the app.</div>}
      >
        <Router hook={useHashLocation}>
          <AppRouter />
        </Router>
      </ErrorBoundary>
    </RegistryProvider>
  )
}

const fallbackStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  background: "#020617",
  color: "#e2e8f0",
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
}

const container = document.getElementById("root")

if (container === null) {
  throw new Error("Missing root element")
}

createRoot(container).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
