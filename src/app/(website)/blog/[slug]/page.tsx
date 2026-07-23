import { getTranslations } from "next-intl/server"

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const t = await getTranslations("WebsitePages")
  
  return (
    <div className="container max-w-3xl py-20 px-4 md:px-6">
      <div className="space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl capitalize">
          {slug.replace(/-/g, ' ')}
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          {t('blogPostPlaceholder')}
        </p>
      </div>
    </div>
  )
}
