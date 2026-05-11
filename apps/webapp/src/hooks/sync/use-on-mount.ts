import * as React from "react"

export function useOnMount(callback: () => void) {
  const callbackRef = React.useRef(callback)
  callbackRef.current = callback

  React.useEffect(() => {
    callbackRef.current()
  }, [])
}
