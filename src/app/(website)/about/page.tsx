import { Shield, Star, Users, Clock, Award, Heart } from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function AboutPage() {
  const t = await getTranslations("WebsitePages")
  
  return (
    <div className="container max-w-screen-xl py-20 px-4 md:px-6">
      <div className="max-w-3xl space-y-4 mb-16">
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{t('aboutUsSubtitle')}</p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          {t('aboutUsTitle')}
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
          {t('aboutUsDesc')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
        {[
          { value: "1,000+", label: t('happyCustomers'), icon: Users },
          { value: "4.9★", label: t('averageRating'), icon: Star },
          { value: "5+", label: t('yearsExperience'), icon: Award },
          { value: "10,000+", label: t('cleansCompleted'), icon: Heart },
        ].map((stat, i) => (
          <div key={i} className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600">
              <stat.icon className="h-6 w-6" />
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Values */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold mb-8 text-center">{t('ourValuesTitle')}</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { icon: <Shield className="h-8 w-8" />, title: t('value1Title'), desc: t('value1Desc') },
            { icon: <Star className="h-8 w-8" />, title: t('value2Title'), desc: t('value2Desc') },
            { icon: <Clock className="h-8 w-8" />, title: t('value3Title'), desc: t('value3Desc') },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl border bg-slate-50 dark:bg-slate-950 space-y-4">
              <div className="h-14 w-14 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
