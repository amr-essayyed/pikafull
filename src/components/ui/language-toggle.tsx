"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { setLocale } from "@/actions/locale"
import { Languages } from "lucide-react"

export function LanguageToggle({ currentLocale }: { currentLocale: string }) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    const nextLocale = currentLocale === "en" ? "ar" : "en"
    startTransition(() => {
      setLocale(nextLocale)
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isPending}
      title={currentLocale === "en" ? "Switch to Arabic" : "Switch to English"}
    >
      <Languages className="h-4 w-4" />
      <span className="sr-only">Toggle language</span>
    </Button>
  )
}
