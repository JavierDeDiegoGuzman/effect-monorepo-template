import * as React from "react"

export function useOnUnmount(callback: () => void) {
  const callbackRef = React.useRef(callback)
  callbackRef.current = callback

  React.useEffect(() => {
    return () => {
      callbackRef.current()
    }
  }, [])
}
