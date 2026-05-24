import * as React from "react"

export function useEventListener<K extends keyof WindowEventMap>(
  target: Window,
  type: K,
  listener: (event: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions,
) {
  const listenerRef = React.useRef(listener)
  listenerRef.current = listener

  React.useEffect(() => {
    const handler = (event: WindowEventMap[K]) => listenerRef.current(event)
    target.addEventListener(type, handler, options)

    return () => {
      target.removeEventListener(type, handler, options)
    }
  }, [target, type, options])
}

export function useWindowEvent<K extends keyof WindowEventMap>(
  type: K,
  listener: (event: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions,
) {
  useEventListener(window, type, listener, options)
}
