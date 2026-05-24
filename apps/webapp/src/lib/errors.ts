type ErrorLikeWithMessage = {
  readonly message?: unknown
}

const hasMessage = (error: unknown): error is ErrorLikeWithMessage =>
  typeof error === "object" && error !== null && "message" in error

export function toErrorMessage(error: unknown): string {
  if (
    hasMessage(error) &&
    typeof error.message === "string" &&
    error.message.length > 0
  ) {
    return error.message
  }

  if (typeof error === "string" && error.length > 0) {
    return error
  }

  return "Unexpected error"
}
