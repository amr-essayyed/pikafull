import { BookingWizard } from "@/components/booking/booking-wizard"
import { getServices, getExtraServices, getCurrentCustomerProfile } from "@/actions/queries"
import { getTranslations } from "next-intl/server"

import { createClient } from "@/lib/supabase/server"

export default async function BookPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const t = await getTranslations("BookingWizard")
  const { service: initialServiceId } = await searchParams
  let services: any[] = []
  let extras: any[] = []
  let currentCustomer: any = null
  let isAuthenticated = false

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    isAuthenticated = !!user

    ;[services, extras, currentCustomer] = await Promise.all([
      getServices(), 
      getExtraServices(),
      getCurrentCustomerProfile()
    ])
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
        <BookingWizard 
          services={services} 
          extras={extras} 
          initialCustomerData={currentCustomer}
          isAuthenticated={isAuthenticated}
          initialServiceId={initialServiceId}
        />
      </div>
    </div>
  )
}
