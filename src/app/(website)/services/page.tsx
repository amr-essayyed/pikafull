import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getServices } from "@/actions/queries"
import { Sparkles, Clock, ChevronRight, Check } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { BeforeAfterSlider } from "@/components/ui/before-after-slider"
import { getServicePhotos } from "@/lib/constants/service-photos"

const DEFAULT_SERVICES = [
  {
    id: "regular-1",
    name: "Regular Cleaning",
    slug: "regular",
    description: "Our standard cleaning service covers all essential areas of your home. Includes dusting, vacuuming, mopping, kitchen cleaning, and bathroom sanitization. Perfect for maintaining a clean and healthy living environment.",
    base_price: 80,
    duration_minutes: 120,
  },
  {
    id: "deep-1",
    name: "Deep Cleaning",
    slug: "deep",
    description: "An intensive top-to-bottom cleaning that reaches every corner. Includes inside oven cleaning, behind appliances, inside cupboards, window sills, skirting boards, and detailed bathroom descaling. Recommended every 3-6 months.",
    base_price: 150,
    duration_minutes: 240,
  },
  {
    id: "end-of-tenancy-1",
    name: "End of Tenancy",
    slug: "end-of-tenancy",
    description: "Professional cleaning designed to meet landlord and letting agent standards. Covers every room in detail with special attention to kitchens and bathrooms. Helps ensure you get your deposit back.",
    base_price: 200,
    duration_minutes: 360,
  },
  {
    id: "office-1",
    name: "Office Cleaning",
    slug: "office",
    description: "Keep your workspace pristine with our commercial cleaning service. Includes desk sanitization, floor cleaning, kitchen area, restrooms, and reception areas. Available for offices of all sizes.",
    base_price: 120,
    duration_minutes: 180,
  },
  {
    id: "after-party-1",
    name: "After Party Cleaning",
    slug: "after-party-cleaning",
    description: "Had a great party? Let us handle the aftermath. We will take care of all the mess, from spills and stains to rubbish removal and kitchen deep clean. Your home will be back to normal in no time.",
    base_price: 130,
    duration_minutes: 180,
  },
  {
    id: "carpet-1",
    name: "Carpet Cleaning",
    slug: "carpet-cleaning",
    description: "Professional carpet and upholstery cleaning using state-of-the-art equipment. Removes deep-seated dirt, stains, allergens, and odours. Available for residential and commercial properties.",
    base_price: 100,
    duration_minutes: 120,
  },
]

export default async function ServicesPage() {
  const t = await getTranslations("WebsitePages")
  const tLanding = await getTranslations("LandingPage")

  let services: any[] = []
  try {
    services = await getServices()
  } catch {
    /* fallback to empty */
  }

  const displayServices = services.length > 0 ? services : DEFAULT_SERVICES

  return (
    <div className="container max-w-screen-xl py-16 md:py-24 px-4 md:px-6">
      <div className="max-w-3xl space-y-4 mb-16">
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{t('ourServices')}</p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          {t('servicesHeroTitle')}
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          {t('servicesHeroDesc')}
        </p>
      </div>

      <div className="space-y-10">
        {displayServices.map((service: any) => {
          const photos = getServicePhotos(service)
          return (
            <Card key={service.id || service.slug} id={service.slug} className="overflow-hidden hover:shadow-xl transition-all duration-300 scroll-mt-24 border-border/60">
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-[380px_1fr_240px] md:grid-cols-[1fr_240px] items-stretch">
                  {/* Before & After Photo Comparison */}
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-border/50">
                    <BeforeAfterSlider
                      beforeImage={photos.before}
                      afterImage={photos.after}
                      alt={service.name}
                      aspectRatio="aspect-[4/3]"
                      className="w-full"
                      beforeLabel={tLanding('before')}
                      afterLabel={tLanding('after')}
                    />
                  </div>

                  {/* Details */}
                  <div className="p-6 md:p-8 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <h2 className="text-2xl font-bold">{service.name}</h2>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
                        {service.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-slate-500 pt-2 border-t border-border/40">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                        <Clock className="h-4 w-4 text-indigo-600" />
                        {Math.floor((service.duration_minutes || 120) / 60)}{t('estimatedDuration')}
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

                  {/* Price & Action */}
                  <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-slate-50 dark:bg-slate-950 border-t lg:border-t-0 border-l-0 lg:border-l border-border/50 text-center">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{t('startingFrom')}</p>
                    <p className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-4">
                      £{Number(service.base_price).toFixed(0)}
                    </p>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 w-full shadow-md hover:shadow-indigo-500/20" asChild>
                      <Link href="/book">
                        {t('bookNowBtn')} <ChevronRight className="ml-1 h-4 w-4 rtl:rotate-180" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
