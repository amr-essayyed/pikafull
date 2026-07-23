import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getTranslations } from "next-intl/server"

export default async function MySchedulePage() {
  const t = await getTranslations("EmployeeDashboard")
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('mySchedule')}</h1>
        <p className="text-slate-500">{t('upcomingJobs')}</p>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-950 p-4 sm:p-6 rounded-xl border shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">123 Clean Street, Apt 4B</h3>
                <p className="text-sm text-slate-500">{t('regularCleaning')} • 2.5 {t('hours')}</p>
              </div>
              <div className="text-right rtl:text-left">
                <div className="font-bold text-indigo-600">14:00</div>
                <div className="text-xs text-slate-500">{t('today')}</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
              <Button asChild className="w-full sm:w-auto flex-1">
                <Link href={`/employee/job/${i}`}>{t('viewDetails')}</Link>
              </Button>
              <Button variant="outline" className="w-full sm:w-auto" asChild>
                <a href="https://maps.google.com" target="_blank" rel="noreferrer">{t('navigate')}</a>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
