import * as React from "react"

export function useDocumentTitle(title: string) {
  React.useEffect(() => {
    const previousTitle = document.title
    document.title = title

    return () => {
      document.title = previousTitle
    }
  }, [title])
}
