"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  error?: Error & { digest?: string }
  reset?: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  React.useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2">Something went wrong!</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">
        We apologize for the inconvenience. An unexpected error has occurred.
      </p>
      {reset && (
        <Button onClick={() => reset()} className="bg-indigo-600 hover:bg-indigo-700">
          Try again
        </Button>
      )}
    </div>
  )
}
