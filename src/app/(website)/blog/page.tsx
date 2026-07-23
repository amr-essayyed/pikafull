import Link from "next/link"
import { getTranslations } from "next-intl/server"

export default async function BlogPage() {
  const t = await getTranslations("WebsitePages")
  return (
    <div className="container max-w-screen-xl py-20 px-4 md:px-6">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{t('blogTitle')}</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          {t('blogDesc')}
        </p>
      </div>
      <div className="mt-16 text-center text-slate-600 dark:text-slate-400">
        <p>{t('blogEmpty')}</p>
        <Link href="/blog/sample-post" className="text-indigo-600 hover:underline mt-4 inline-block">{t('viewSample')}</Link>
      </div>
    </div>
  )
}
