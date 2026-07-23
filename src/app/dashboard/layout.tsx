import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { LanguageToggle } from "@/components/ui/language-toggle"
import { useLocale } from "next-intl"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentLocale = useLocale()

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <DashboardSidebar />
      <div className="p-4 sm:ml-64 rtl:sm:ml-0 rtl:sm:mr-64">
        {/* Mobile Header (Hidden on large screens) */}
        <div className="flex items-center justify-between sm:hidden mb-4 p-4 bg-white dark:bg-slate-950 rounded-xl border shadow-sm">
          <span className="text-lg font-bold">SparkleClean</span>
          <div className="flex items-center gap-2">
            <LanguageToggle currentLocale={currentLocale} />
            <button className="p-2 border rounded-md">Menu</button>
          </div>
        </div>
        
        {/* Main Content Area */}
        <main className="min-h-[calc(100vh-2rem)] rounded-xl bg-white dark:bg-slate-950 border shadow-sm">
          {children}
        </main>
      </div>
    </div>
  )
}
