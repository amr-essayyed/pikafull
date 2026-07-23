import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getServices } from "@/actions/queries"
import { Sparkles, Clock, ChevronRight, Check } from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function ServicesPage() {
  const t = await getTranslations("WebsitePages")
  let services: any[] = []
  try {
    services = await getServices()
  } catch { /* fallback to empty */ }

  return (
    <div className="container max-w-screen-xl py-20 px-4 md:px-6">
      <div className="max-w-3xl space-y-4 mb-16">
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{t('ourServices')}</p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          {t('servicesHeroTitle')}
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          {t('servicesHeroDesc')}
        </p>
      </div>

      <div className="space-y-8">
        {services.map((service: any) => (
          <Card key={service.id} id={service.slug} className="overflow-hidden hover:shadow-lg transition-shadow scroll-mt-24">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-[1fr_300px]">
                <div className="p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl font-bold">{service.name}</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {Math.floor(service.duration_minutes / 60)}{t('estimatedDuration')}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-emerald-500" />
                      {t('ecoFriendlyProducts')}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-emerald-500" />
                      {t('insuredCleaners')}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 border-l">
                  <p className="text-sm text-slate-500 mb-1">{t('startingFrom')}</p>
                  <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
                    £{Number(service.base_price).toFixed(0)}
                  </p>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 w-full" asChild>
                    <Link href="/book">
                      {t('bookNowBtn')} <ChevronRight className="ml-1 h-4 w-4 rtl:rotate-180" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <p>{t('emptyServices')}</p>
        </div>
      )}
    </div>
  )
}
