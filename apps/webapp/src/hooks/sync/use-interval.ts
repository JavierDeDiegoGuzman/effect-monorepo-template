import * as React from "react"

export function useInterval(callback: () => void, delay: number | null) {
  const callbackRef = React.useRef(callback)
  callbackRef.current = callback

  React.useEffect(() => {
    if (delay === null) {
      return undefined
    }

    const interval = window.setInterval(() => callbackRef.current(), delay)
    return () => window.clearInterval(interval)
  }, [delay])
}
