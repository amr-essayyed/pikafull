import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getServices, getTestimonials, getCompanySettings } from "@/actions/queries"
import { Sparkles, Star, Shield, Clock, ChevronRight, Phone } from "lucide-react"
import { getTranslations } from "next-intl/server"

const iconMap: Record<string, React.ReactNode> = {
  sparkles: <Sparkles className="h-6 w-6" />,
  zap: <Sparkles className="h-6 w-6" />,
  home: <Shield className="h-6 w-6" />,
  building: <Clock className="h-6 w-6" />,
  "party-popper": <Sparkles className="h-6 w-6" />,
  layers: <Shield className="h-6 w-6" />,
}

export default async function HomePage() {
  let services: any[] = []
  let testimonials: any[] = []
  let settings: any = null

  try {
    ;[services, testimonials, settings] = await Promise.all([
      getServices(),
      getTestimonials(),
      getCompanySettings(),
    ])
  } catch {
    // Fallback to empty - page renders without DB data
  }

  const t = await getTranslations("LandingPage")

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/30 to-emerald-50/20 dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-950 pt-20 md:pt-28 lg:pt-36 pb-20 md:pb-28 lg:pb-36">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtMzB2Mkgydi0yaDM0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        <div className="container px-4 md:px-6 max-w-screen-xl relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t("ratedBy")}
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl/[1.1]">
                  {t("title")}
                  <span className="bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">
                    {t("titleHighlight")}
                  </span>
                </h1>
                <p className="max-w-[540px] text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t("subtitle")}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-base h-12 px-8 shadow-lg shadow-indigo-500/25" asChild>
                  <Link href="/book">
                    {t("bookNow")}
                    <ChevronRight className="ml-1 h-4 w-4 rtl:rotate-180" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-base h-12 px-8" asChild>
                  <Link href="/services">{t("viewServices")}</Link>
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("joinCustomers")}</p>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-emerald-500/10 border border-indigo-100 dark:border-indigo-900/50 p-1">
                <div className="w-full h-full rounded-xl bg-white dark:bg-slate-900 shadow-2xl flex items-center justify-center overflow-hidden">
                  <div className="text-center space-y-4 p-8">
                    <div className="mx-auto w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">SparkleClean Pro</p>
                    <p className="text-slate-500">{t("trustedPartner")}</p>
                  </div>
                </div>
              </div>
              {/* Floating Stats Cards */}
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border p-4 flex items-center gap-3 rtl:-right-6 rtl:-left-auto">
                <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold">{t("insured")}</p>
                  <p className="text-xs text-slate-500">{t("insuredDesc")}</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg border p-4 flex items-center gap-3 rtl:-left-4 rtl:-right-auto">
                <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                  <Star className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold">{t("rating")}</p>
                  <p className="text-xs text-slate-500">{t("ratingDesc")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 md:py-28 bg-white dark:bg-slate-900">
        <div className="container px-4 md:px-6 max-w-screen-xl">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">{t("whatWeOffer")}</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("servicesTitle")}</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {t("servicesDesc")}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(services.length > 0 ? services : [
              { name: "Regular Cleaning", short_description: "Standard maintenance for your home", base_price: 80, icon: "sparkles", slug: "regular" },
              { name: "Deep Cleaning", short_description: "Thorough top-to-bottom clean", base_price: 150, icon: "zap", slug: "deep" },
              { name: "End of Tenancy", short_description: "Move-out cleaning to secure your deposit", base_price: 200, icon: "home", slug: "end-of-tenancy" },
            ]).map((service: any, i: number) => (
              <Card key={service.slug || i} className="group hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    {iconMap[service.icon] || <Sparkles className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">{service.short_description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {t("fromPrice", { price: Number(service.base_price).toFixed(0) })}
                    </span>
                    <Button variant="ghost" size="sm" className="text-indigo-600 rtl:-translate-x-1 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" asChild>
                      <Link href={`/services#${service.slug}`}>
                        {t("learnMore")} <ChevronRight className="ml-1 h-4 w-4 rtl:rotate-180" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-950">
        <div className="container px-4 md:px-6 max-w-screen-xl">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">{t("whyChooseUs")}</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("trustedBy")}</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <Shield className="h-8 w-8" />, title: t("fullyInsured"), desc: t("fullyInsuredDesc") },
              { icon: <Star className="h-8 w-8" />, title: t("fiveStar"), desc: t("fiveStarDesc") },
              { icon: <Clock className="h-8 w-8" />, title: t("flexibleBooking"), desc: t("flexibleBookingDesc") },
              { icon: <Sparkles className="h-8 w-8" />, title: t("ecoFriendly"), desc: t("ecoFriendlyDesc") },
            ].map((item, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-20 md:py-28 bg-white dark:bg-slate-900">
          <div className="container px-4 md:px-6 max-w-screen-xl">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">{t("testimonialsSubtitle")}</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("testimonialsTitle")}</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.slice(0, 6).map((t: any) => (
                <Card key={t.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground italic leading-relaxed">
                      &ldquo;{t.content}&rdquo;
                    </p>
                    <div className="pt-2 border-t">
                      <p className="font-semibold text-sm">{t.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{t.service_name}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
        <div className="container px-4 md:px-6 max-w-screen-xl text-center space-y-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("ctaTitle")}</h2>
          <p className="text-lg text-indigo-100 max-w-2xl mx-auto">
            {t("ctaDesc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 h-12 px-8 text-base shadow-lg" asChild>
              <Link href="/book">{t("bookOnline")}</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-12 px-8 text-base" asChild>
              <Link href="tel:+442012345678">
                <Phone className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                {t("callUs")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
