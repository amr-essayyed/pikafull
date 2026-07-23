import Link from "next/link"
import { Calendar, User, Briefcase, LogOut } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

export function EmployeeNav() {
  const t = useTranslations("EmployeeDashboard")
  return (
    <nav className="fixed bottom-0 w-full bg-white dark:bg-slate-950 border-t sm:static sm:w-64 sm:h-screen sm:border-r sm:border-t-0 sm:flex sm:flex-col p-2 sm:p-4 z-50">
      <div className="hidden sm:block mb-8 px-2">
        <span className="text-xl font-bold text-indigo-600">{t('portal')}</span>
      </div>
      
      <ul className="flex justify-around sm:flex-col sm:space-y-2 sm:justify-start flex-1">
        <li>
          <Link href="/employee/my-schedule" className="flex flex-col sm:flex-row items-center sm:px-4 py-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
            <Calendar className="h-6 w-6 sm:mr-3 sm:h-5 sm:w-5" />
            <span className="text-xs mt-1 sm:mt-0 sm:text-base">{t('schedule')}</span>
          </Link>
        </li>
        <li>
          <Link href="/employee/my-profile" className="flex flex-col sm:flex-row items-center sm:px-4 py-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
            <User className="h-6 w-6 sm:mr-3 sm:h-5 sm:w-5" />
            <span className="text-xs mt-1 sm:mt-0 sm:text-base">{t('profile')}</span>
          </Link>
        </li>
      </ul>

      <div className="hidden sm:block mt-auto border-t pt-4">
        <form action="/api/auth/logout" method="POST">
          <Button variant="ghost" className="w-full justify-start text-red-600" type="submit">
            <LogOut className="mr-3 h-5 w-5 rtl:mr-0 rtl:ml-3" />
            {t('signOut')}
          </Button>
        </form>
      </div>
    </nav>
  )
}
