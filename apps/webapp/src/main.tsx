import { RegistryProvider } from "@effect/atom-react"
import * as React from "react"
import { Suspense } from "react"
import { createRoot } from "react-dom/client"
import { ErrorBoundary } from "react-error-boundary"
import "./styles/globals.css"
import { TodoApp } from "./components/TodoApp"

function Root() {
  return (
    <RegistryProvider>
      <ErrorBoundary fallback={<div style={fallbackStyle}>Could not load todos.</div>}>
        <Suspense fallback={<div style={fallbackStyle}>Loading todos...</div>}>
          <TodoApp />
        </Suspense>
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
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
}

const container = document.getElementById("root")

if (container === null) {
  throw new Error("Missing root element")
}

createRoot(container).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
