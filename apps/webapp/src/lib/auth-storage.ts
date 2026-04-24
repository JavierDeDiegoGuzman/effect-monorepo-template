const authTokenKey = "app.auth.token"

export const isProbablyJwt = (value: string): boolean => value.split(".").length === 3

export const readAuthToken = (): string | null => {
  if (typeof window === "undefined") {
    return null
  }

  const value = window.localStorage.getItem(authTokenKey)
  return typeof value === "string" && value.length > 0 ? value : null
}

export const writeAuthToken = (token: string) => {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(authTokenKey, token)
}

export const clearAuthToken = () => {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(authTokenKey)
}
