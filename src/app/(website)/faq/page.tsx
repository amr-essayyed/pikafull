import { getFAQItems } from "@/actions/queries"
import { getTranslations } from "next-intl/server"

export default async function FAQPage() {
  const t = await getTranslations("WebsitePages")
  let faqItems: any[] = []
  try {
    faqItems = await getFAQItems()
  } catch { /* fallback */ }

  // Group by category
  const categories = faqItems.reduce((acc: Record<string, any[]>, item: any) => {
    const cat = item.category || "General"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  return (
    <div className="container max-w-screen-xl py-20 px-4 md:px-6">
      <div className="max-w-3xl space-y-4 mb-16">
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{t('support')}</p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          {t('faqTitle')}
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          {t('faqDesc')}
        </p>
      </div>

      <div className="max-w-3xl space-y-10">
        {Object.entries(categories).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-4 uppercase tracking-wider text-sm">{category}</h2>
            <div className="space-y-4">
              {(items as any[]).map((item: any) => (
                <details key={item.id} className="group border rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer p-5 font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors list-none">
                    {item.question}
                    <span className="ml-4 rtl:mr-4 rtl:ml-0 text-slate-400 group-open:rotate-180 transition-transform text-lg">▼</span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-600 dark:text-slate-400 leading-relaxed border-t pt-4">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}

        {faqItems.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <p>{t('emptyFaq')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
