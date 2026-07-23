import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { logout } from "@/actions/auth"
import { LogOut } from "lucide-react"
import { LanguageToggle } from "@/components/ui/language-toggle"
import { getLocale, getTranslations } from "next-intl/server"
import { WebsiteMobileNav } from "@/components/layout/website-mobile-nav"

export async function WebsiteHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const currentLocale = await getLocale()
  const t = await getTranslations("Navigation")
  
  let role: string | null = null
  if (user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    role = (data as any)?.role || null
  }

  const navTranslations = {
    services: t('services'),
    pricing: t('pricing'),
    about: t('about'),
    reviews: t('reviews'),
    dashboard: t('dashboard'),
    mySchedule: t('mySchedule'),
    myBookings: t('myBookings'),
    logout: t('logout'),
    login: t('login'),
    bookNow: t('bookNow'),
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">
              SparkleClean Pro
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/services" className="transition-colors hover:text-foreground/80 text-foreground/60">{t('services')}</Link>
            <Link href="/pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">{t('pricing')}</Link>
            <Link href="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">{t('about')}</Link>
            <Link href="/reviews" className="transition-colors hover:text-foreground/80 text-foreground/60">{t('reviews')}</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <LanguageToggle currentLocale={currentLocale} />
          <div className="hidden sm:flex items-center gap-4">
            {user ? (
              <>
                {(role === "owner" || role === "staff") && (
                  <Button variant="ghost" asChild>
                    <Link href="/dashboard">{t('dashboard')}</Link>
                  </Button>
                )}
                {role === "employee" && (
                  <Button variant="ghost" asChild>
                    <Link href="/employee/my-schedule">{t('mySchedule')}</Link>
                  </Button>
                )}
                {role === "customer" && (
                  <Button variant="ghost" asChild>
                    <Link href="/customer/dashboard">{t('myBookings')}</Link>
                  </Button>
                )}
                <form action={logout}>
                  <Button variant="outline" type="submit">
                    <LogOut className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                    {t('logout')}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">{t('login')}</Link>
                </Button>
                <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                  <Link href="/book">{t('bookNow')}</Link>
                </Button>
              </>
            )}
          </div>
          <WebsiteMobileNav isLoggedIn={!!user} role={role} t={navTranslations} />
        </div>
      </div>
    </header>
  )
}
