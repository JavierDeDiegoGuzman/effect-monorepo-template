import { spawn } from "node:child_process"

const processes = [
  spawn("pnpm", ["--filter", "@app/server", "dev"], {
    stdio: "inherit",
    shell: true,
  }),
  spawn("pnpm", ["--filter", "@app/webapp", "dev"], {
    stdio: "inherit",
    shell: true,
  }),
]

let finished = false

const shutdown = (code) => {
  if (finished) return
  finished = true

  for (const child of processes) {
    if (!child.killed) {
      child.kill("SIGTERM")
    }
  }

  setTimeout(() => {
    for (const child of processes) {
      if (!child.killed) {
        child.kill("SIGKILL")
      }
    }
    process.exit(code)
  }, 250)
}

for (const child of processes) {
  child.on("exit", (code, signal) => {
    if (signal) {
      shutdown(1)
      return
    }

    shutdown(code ?? 1)
  })

  child.on("error", () => shutdown(1))
}

process.on("SIGINT", () => shutdown(130))
process.on("SIGTERM", () => shutdown(143))
