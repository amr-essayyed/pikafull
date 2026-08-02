"use client"

import { useTransition } from "react"
import { setLocale } from "@/actions/locale"
import { cn } from "@/lib/utils"

export function LanguageToggle({ currentLocale }: { currentLocale: string }) {
  const [isPending, startTransition] = useTransition()

  const handleSelect = (newLocale: "en" | "ar") => {
    if (newLocale === currentLocale || isPending) return
    startTransition(() => {
      setLocale(newLocale as "en" | "ar")
    })
  }

  const isEn = currentLocale === "en"

  return (
    <div
      role="group"
      aria-label="Language selector"
      className={cn(
        "inline-flex items-center rounded-full bg-slate-200/80 dark:bg-slate-800/80 p-1 border border-slate-300/70 dark:border-slate-700/70 shadow-inner transition-opacity",
        isPending && "opacity-60 pointer-events-none"
      )}
    >
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => handleSelect("en")}
          disabled={isPending}
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
            isEn
              ? "bg-white text-indigo-600 shadow dark:bg-slate-950 dark:text-indigo-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          )}
          aria-pressed={isEn}
          title="English"
        >
          {isEn && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
          <span>EN</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelect("ar")}
          disabled={isPending}
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
            !isEn
              ? "bg-white text-indigo-600 shadow dark:bg-slate-950 dark:text-indigo-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          )}
          aria-pressed={!isEn}
          title="العربية"
        >
          {!isEn && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
          <span>ع</span>
        </button>
      </div>
    </div>
  )
}

