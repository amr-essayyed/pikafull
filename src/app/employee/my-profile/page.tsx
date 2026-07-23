import { getTranslations } from "next-intl/server"

export default async function EmployeeProfilePage() {
  const t = await getTranslations("EmployeeDashboard")
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('myProfile')}</h1>
        <p className="text-slate-500">{t('manageInfo')}</p>
      </div>

      <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border shadow-sm">
        <p className="text-slate-500 text-center py-8">{t('profileFormPlaceholder')}</p>
      </div>
    </div>
  )
}
