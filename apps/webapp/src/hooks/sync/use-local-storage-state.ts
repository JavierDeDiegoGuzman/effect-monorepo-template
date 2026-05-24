import * as React from "react"

type Options<T> = {
  readonly serialize?: (value: T) => string
  readonly deserialize?: (value: string) => T
}

type Initializer<T> = () => T

const defaultDeserialize = <T>(value: string): T => JSON.parse(value)

const isInitializer = <T>(value: T | Initializer<T>): value is Initializer<T> =>
  typeof value === "function"

const resolveInitialValue = <T>(initialValue: T | Initializer<T>): T =>
  isInitializer(initialValue) ? initialValue() : initialValue

export function useLocalStorageState<T>(
  key: string,
  initialValue: T | Initializer<T>,
  options: Options<T> = {},
): readonly [T, React.Dispatch<React.SetStateAction<T>>] {
  const { serialize = JSON.stringify, deserialize = defaultDeserialize<T> } =
    options

  const [value, setValue] = React.useState<T>(() => {
    const fallback = resolveInitialValue(initialValue)

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

  return [value, setValue]
}
