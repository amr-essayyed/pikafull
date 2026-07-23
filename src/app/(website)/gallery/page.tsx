import { getTranslations } from "next-intl/server"

export default async function GalleryPage() {
  const t = await getTranslations("WebsitePages")
  return (
    <div className="container max-w-screen-xl py-20 px-4 md:px-6">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{t('galleryTitle')}</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          {t('galleryDesc')}
        </p>
      </div>
    </div>
  )
}
