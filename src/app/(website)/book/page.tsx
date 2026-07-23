import { BookingWizard } from "@/components/booking/booking-wizard"
import { getServices, getExtraServices } from "@/actions/queries"
import { getTranslations } from "next-intl/server"

export default async function BookPage() {
  const t = await getTranslations("BookingWizard")
  let services: any[] = []
  let extras: any[] = []
  try {
    ;[services, extras] = await Promise.all([getServices(), getExtraServices()])
  } catch { /* fallback */ }

  return (
    <div className="container max-w-screen-xl py-12 px-4 md:px-6">
      <div className="text-center mb-10">
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">{t('bookCleaning')}</p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{t('getInstantQuote')}</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {t('bookDesc')}
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <BookingWizard services={services} extras={extras} />
      </div>
    </div>
  )
}
