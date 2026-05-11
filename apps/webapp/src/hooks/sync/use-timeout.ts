import * as React from "react"

export function useTimeout(callback: () => void, delay: number | null) {
  const callbackRef = React.useRef(callback)
  callbackRef.current = callback

  React.useEffect(() => {
    if (delay === null) {
      return undefined
    }

    const timeout = window.setTimeout(() => callbackRef.current(), delay)
    return () => window.clearTimeout(timeout)
  }, [delay])
}
