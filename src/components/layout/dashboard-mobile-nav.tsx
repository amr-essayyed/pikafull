"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  Users,
  Briefcase,
  Settings,
  FileText,
  CreditCard,
  Tag,
  LayoutTemplate,
  LogOut,
  Menu
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { logout } from "@/actions/auth"
import { useTranslations } from "next-intl"

const navItemsKeys = [
  { titleKey: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { titleKey: "bookings", href: "/dashboard/bookings", icon: Calendar },
  { titleKey: "customers", href: "/dashboard/customers", icon: Users },
  { titleKey: "employees", href: "/dashboard/employees", icon: Briefcase },
  { titleKey: "services", href: "/dashboard/services", icon: Tag },
  { titleKey: "invoices", href: "/dashboard/invoices", icon: CreditCard },
  { titleKey: "reports", href: "/dashboard/reports", icon: FileText },
  { titleKey: "cms", href: "/dashboard/cms", icon: LayoutTemplate },
  { titleKey: "settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardMobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const t = useTranslations("AdminSidebar")

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  const handleLinkClick = () => {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="icon" className="sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Navigation Menu</span>
          </Button>
        }
      />
      <SheetContent side="left" className="w-[280px] p-6 flex flex-col justify-between">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-0 pb-6 text-left rtl:text-right">
            <SheetTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">
              SparkleClean
            </SheetTitle>
          </SheetHeader>

          <ul className="space-y-1 font-medium flex-1 overflow-y-auto">
            {navItemsKeys.map((item) => {
              const active = isActive(item.href)
              return (
                <li key={item.titleKey}>
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center rounded-lg px-4 py-2.5 transition-colors",
                      active
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 me-3 transition-colors",
                      active
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-slate-400 dark:text-slate-500"
                    )} />
                    <span>{t(item.titleKey)}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="mt-auto border-t pt-4">
            <form action={async () => { await logout() }}>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                type="submit"
              >
                <LogOut className="me-3 h-5 w-5" />
                {t('signOut')}
              </Button>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
