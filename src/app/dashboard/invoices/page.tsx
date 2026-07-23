import { getTranslations } from "next-intl/server"

export default async function InvoicesPage() {
  const t = await getTranslations("AdminDashboard")
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('invoicesPayments')}</h1>
          <p className="text-slate-500">{t('manageBilling')}</p>
        </div>
      </div>
      <div className="border rounded-xl p-8 text-center text-slate-500">
        {t('invoicesTablePlaceholder')}
      </div>
    </div>
  )
}
