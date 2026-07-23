import { getTranslations } from "next-intl/server"

export default async function ContactPage() {
  const t = await getTranslations("WebsitePages")
  return (
    <div className="container max-w-screen-xl py-20 px-4 md:px-6">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{t('contactUs')}</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          {t('contactDesc')}
        </p>
      </div>
      <div className="mt-16 grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <h3 className="font-bold text-xl mb-2">{t('officeAddress')}</h3>
            <p className="text-slate-600 dark:text-slate-400">{t('addressLine1')}<br/>{t('addressLine2')}<br/>{t('addressLine3')}</p>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-2">{t('contactDetails')}</h3>
            <p className="text-slate-600 dark:text-slate-400">{t('phoneLabel')}<br/>{t('emailLabel')}</p>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-xl border">
          <p className="text-center text-slate-600 dark:text-slate-400">{t('contactFormPlaceholder')}</p>
        </div>
      </div>
    </div>
  )
}
