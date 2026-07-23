import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getServices, getExtraServices } from "@/actions/queries"
import { Check, ChevronRight, Sparkles } from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function PricingPage() {
  const t = await getTranslations("WebsitePages")
  let services: any[] = []
  let extras: any[] = []
  try {
    ;[services, extras] = await Promise.all([getServices(), getExtraServices()])
  } catch { /* fallback */ }

  return (
    <div className="container max-w-screen-xl py-20 px-4 md:px-6">
      <div className="max-w-3xl space-y-4 mb-16 text-center mx-auto">
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{t('pricingSubtitle')}</p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          {t('pricingTitle')}
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          {t('pricingDesc')}
        </p>
      </div>

      {/* Main Services Pricing */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
        {services.map((service: any, i: number) => (
          <Card key={service.id} className={`relative overflow-hidden hover:shadow-lg transition-shadow ${i === 1 ? "border-indigo-500 ring-1 ring-indigo-500" : ""}`}>
            {i === 1 && (
              <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0">
                <Badge className="rounded-none rounded-bl-lg rtl:rounded-bl-none rtl:rounded-br-lg bg-indigo-600 text-white hover:bg-indigo-600">{t('mostPopular')}</Badge>
              </div>
            )}
            <CardHeader className="pb-4">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 mb-3">
                <Sparkles className="h-5 w-5" />
              </div>
              <CardTitle>{service.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{service.short_description}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <span className="text-4xl font-bold">£{Number(service.base_price).toFixed(0)}</span>
                <span className="text-muted-foreground ml-1 rtl:mr-1 rtl:ml-0">{t('starting')}</span>
              </div>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  {t('vettedCleaners')}
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  {t('ecoFriendlyProducts')}
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  {Math.floor(service.duration_minutes / 60)}{t('estimatedDuration')}
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  {t('satisfactionGuaranteed')}
                </li>
              </ul>
              <Button className={`w-full ${i === 1 ? "bg-indigo-600 hover:bg-indigo-700" : ""}`} variant={i === 1 ? "default" : "outline"} asChild>
                <Link href="/book">
                  {t('bookNowBtn')} <ChevronRight className="ml-1 h-4 w-4 rtl:rotate-180" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add-On Services */}
      {extras.length > 0 && (
        <div>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">{t('addOnServices')}</h2>
            <p className="text-muted-foreground mt-2">{t('addOnDesc')}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
            {extras.map((extra: any) => (
              <Card key={extra.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{extra.name}</p>
                    <p className="text-xs text-muted-foreground">{extra.duration_minutes} {t('min')}</p>
                  </div>
                  <span className="font-bold text-indigo-600 whitespace-nowrap">+£{Number(extra.price).toFixed(0)}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {services.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <p>{t('emptyPricing')}</p>
        </div>
      )}
    </div>
  )
}
