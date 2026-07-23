import Link from "next/link"
import { useTranslations } from "next-intl"

export function WebsiteFooter() {
  const t = useTranslations("Footer")

  return (
    <footer className="w-full border-t border-border/40 bg-slate-50 dark:bg-slate-950 mt-auto">
      <div className="container mx-auto px-4 md:px-8 max-w-screen-2xl py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">
              {t('companyName')}
            </span>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('description')}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">{t('servicesTitle')}</h3>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/services#regular">{t('regularCleaning')}</Link></li>
              <li><Link href="/services#deep">{t('deepCleaning')}</Link></li>
              <li><Link href="/services#end-of-tenancy">{t('endOfTenancy')}</Link></li>
              <li><Link href="/services#office">{t('officeCleaning')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">{t('companyTitle')}</h3>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link href="/about">{t('aboutUs')}</Link></li>
              <li><Link href="/why-choose-us">{t('whyChooseUs')}</Link></li>
              <li><Link href="/faq">{t('faq')}</Link></li>
              <li><Link href="/contact">{t('contactTitle')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">{t('contactTitle')}</h3>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><span dir="ltr">📞 +44 20 1234 5678</span></li>
              <li><span dir="ltr">✉️ info@sparklecleanpro.com</span></li>
              <li>📍 123 Clean Street, London</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} {t('companyName')}. {t('allRightsReserved')}
          </p>
          <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/privacy">{t('privacyPolicy')}</Link>
            <Link href="/terms">{t('termsOfService')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
