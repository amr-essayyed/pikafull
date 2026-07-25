"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Sparkles, ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"

export function FloatingBookingButton() {
  const pathname = usePathname()
  const t = useTranslations("Navigation")

  // Do not render the floating button on the booking wizard page itself
  if (pathname === "/book" || pathname === "/book/") {
    return null
  }

  const bookText = t("bookNow") || "Book Now"

  return (
    <>
      {/* Desktop Floating Action Button (Bottom Left) */}
      <div className="hidden sm:block fixed bottom-6 left-6 z-50">
        <Link
          href="/book"
          className="group relative inline-flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label={bookText}
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
          </span>
          <Calendar className="h-4 w-4 transition-transform group-hover:rotate-12" />
          <span>{bookText}</span>
          <Sparkles className="h-4 w-4 opacity-80 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>

      {/* Mobile Sticky Bottom CTA Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-background/95 backdrop-blur-md border-t border-border/60 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <Link
          href="/book"
          className="flex items-center justify-between w-full px-5 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 text-white font-bold text-base shadow-md active:scale-98 transition-transform"
        >
          <div className="flex items-center gap-2.5">
            <Calendar className="h-5 w-5" />
            <span>{bookText}</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
            <span>Fast & Easy</span>
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </div>
        </Link>
      </div>
    </>
  )
}
