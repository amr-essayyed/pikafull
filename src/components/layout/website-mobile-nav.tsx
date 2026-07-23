"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu, LogOut } from "lucide-react"
import { logout } from "@/actions/auth"

interface WebsiteMobileNavProps {
  isLoggedIn: boolean
  role: string | null
  t: {
    services: string
    pricing: string
    about: string
    reviews: string
    dashboard: string
    mySchedule: string
    myBookings: string
    logout: string
    login: string
    bookNow: string
  }
}

export function WebsiteMobileNav({ isLoggedIn, role, t }: WebsiteMobileNavProps) {
  const [open, setOpen] = useState(false)

  const handleLinkClick = () => {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        }
      />
      <SheetContent side="right" className="w-[300px] sm:w-[350px] p-6 flex flex-col justify-between">
        <div>
          <SheetHeader className="p-0 pb-6 text-left rtl:text-right">
            <SheetTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">
              SparkleClean Pro
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col gap-4">
            <Link
              href="/services"
              onClick={handleLinkClick}
              className="text-base font-medium text-foreground/80 hover:text-foreground transition-colors py-2 border-b border-border/40"
            >
              {t.services}
            </Link>
            <Link
              href="/pricing"
              onClick={handleLinkClick}
              className="text-base font-medium text-foreground/80 hover:text-foreground transition-colors py-2 border-b border-border/40"
            >
              {t.pricing}
            </Link>
            <Link
              href="/about"
              onClick={handleLinkClick}
              className="text-base font-medium text-foreground/80 hover:text-foreground transition-colors py-2 border-b border-border/40"
            >
              {t.about}
            </Link>
            <Link
              href="/reviews"
              onClick={handleLinkClick}
              className="text-base font-medium text-foreground/80 hover:text-foreground transition-colors py-2 border-b border-border/40"
            >
              {t.reviews}
            </Link>
          </nav>
        </div>

        <div className="flex flex-col gap-3 pt-6 border-t border-border">
          {isLoggedIn ? (
            <>
              {(role === "owner" || role === "staff") && (
                <Button variant="outline" className="w-full justify-start" asChild onClick={handleLinkClick}>
                  <Link href="/dashboard">{t.dashboard}</Link>
                </Button>
              )}
              {role === "employee" && (
                <Button variant="outline" className="w-full justify-start" asChild onClick={handleLinkClick}>
                  <Link href="/employee/my-schedule">{t.mySchedule}</Link>
                </Button>
              )}
              {role === "customer" && (
                <Button variant="outline" className="w-full justify-start" asChild onClick={handleLinkClick}>
                  <Link href="/customer/dashboard">{t.myBookings}</Link>
                </Button>
              )}
              <form action={logout} className="w-full">
                <Button variant="destructive" type="submit" className="w-full justify-start">
                  <LogOut className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                  {t.logout}
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="outline" className="w-full" asChild onClick={handleLinkClick}>
                <Link href="/login">{t.login}</Link>
              </Button>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700" asChild onClick={handleLinkClick}>
                <Link href="/book">{t.bookNow}</Link>
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
