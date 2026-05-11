import * as React from "react"

type Options<T> = {
  readonly serialize?: (value: T) => string
  readonly deserialize?: (value: string) => T
}

export function useLocalStorageState<T>(
  key: string,
  initialValue: T | (() => T),
  options: Options<T> = {},
) {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse as (value: string) => T,
  } = options

  const [value, setValue] = React.useState<T>(() => {
    const fallback =
      typeof initialValue === "function"
        ? (initialValue as () => T)()
        : initialValue

    const stored = window.localStorage.getItem(key)
    if (stored === null) {
      return fallback
    }

    try {
      return deserialize(stored)
    } catch {
      return fallback
    }
  })

  React.useEffect(() => {
    window.localStorage.setItem(key, serialize(value))
  }, [key, serialize, value])

  return [value, setValue] as const
}
