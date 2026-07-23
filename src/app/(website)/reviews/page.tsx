import { Card, CardContent } from "@/components/ui/card"
import { getTestimonials } from "@/actions/queries"
import { Star } from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function ReviewsPage() {
  const t = await getTranslations("WebsitePages")
  let testimonials: any[] = []
  try {
    testimonials = await getTestimonials()
  } catch { /* fallback */ }

  return (
    <div className="container max-w-screen-xl py-20 px-4 md:px-6">
      <div className="max-w-3xl space-y-4 mb-16">
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{t('testimonials')}</p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          {t('reviewsTitle')}
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          {t('reviewsDesc')}
        </p>
      </div>

      {/* Overall Rating */}
      <div className="flex items-center gap-6 mb-12 p-6 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900">
        <div className="text-center">
          <p className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">4.9</p>
          <div className="flex items-center gap-0.5 mt-1 justify-center">
            {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
          </div>
          <p className="text-sm text-slate-500 mt-1">{t('reviewsCount')}</p>
        </div>
        <div className="h-16 w-px bg-indigo-200 dark:bg-indigo-800" />
        <div className="space-y-1.5 flex-1">
          {[5,4,3,2,1].map(stars => {
            const count = testimonials.filter(t => t.rating === stars).length
            const pct = testimonials.length > 0 ? (count / testimonials.length * 100) : 0
            return (
              <div key={stars} className="flex items-center gap-2 text-sm">
                <span className="w-3 text-slate-500">{stars}</span>
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right rtl:text-left text-slate-400">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t: any) => (
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
              <div className="pt-3 border-t flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center font-bold text-indigo-600 text-sm">
                  {t.customer_name?.split(" ").map((n: string) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{t.service_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <p>{t('emptyReviews')}</p>
        </div>
      )}
    </div>
  )
}
