import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCompanySettings } from "@/actions/queries"
import { Building2 } from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function SettingsPage() {
  const t = await getTranslations("AdminDashboard")
  let settings: any = null
  try {
    settings = await getCompanySettings()
  } catch { /* fallback */ }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('companySettings')}</h1>
        <p className="text-muted-foreground">{t('configureBusinessInfo')}</p>
      </div>

      {settings ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('businessInformation')}</CardTitle>
              <CardDescription>{t('businessInformationDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('companyName')}</Label>
                <Input defaultValue={settings.company_name} readOnly className="bg-slate-50 dark:bg-slate-900" />
              </div>
              <div className="space-y-2">
                <Label>{t('email')}</Label>
                <Input defaultValue={settings.email} readOnly className="bg-slate-50 dark:bg-slate-900" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('phoneSettings')}</Label>
                  <Input defaultValue={settings.phone} readOnly className="bg-slate-50 dark:bg-slate-900" />
                </div>
                <div className="space-y-2">
                  <Label>{t('whatsapp')}</Label>
                  <Input defaultValue={settings.whatsapp} readOnly className="bg-slate-50 dark:bg-slate-900" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('locationTitle')}</CardTitle>
              <CardDescription>{t('locationDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('addressSettings')}</Label>
                <Input defaultValue={settings.address} readOnly className="bg-slate-50 dark:bg-slate-900" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('city')}</Label>
                  <Input defaultValue={settings.city} readOnly className="bg-slate-50 dark:bg-slate-900" />
                </div>
                <div className="space-y-2">
                  <Label>{t('country')}</Label>
                  <Input defaultValue={settings.country} readOnly className="bg-slate-50 dark:bg-slate-900" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('financial')}</CardTitle>
              <CardDescription>{t('financialDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t('currency')}</Label>
                  <Input defaultValue={settings.currency} readOnly className="bg-slate-50 dark:bg-slate-900" />
                </div>
                <div className="space-y-2">
                  <Label>{t('symbol')}</Label>
                  <Input defaultValue={settings.currency_symbol} readOnly className="bg-slate-50 dark:bg-slate-900" />
                </div>
                <div className="space-y-2">
                  <Label>{t('taxRate')}</Label>
                  <Input defaultValue={settings.tax_rate} readOnly className="bg-slate-50 dark:bg-slate-900" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('bookingRules')}</CardTitle>
              <CardDescription>{t('bookingRulesDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('bookingLeadHours')}</Label>
                  <Input defaultValue={settings.booking_lead_hours} readOnly className="bg-slate-50 dark:bg-slate-900" />
                </div>
                <div className="space-y-2">
                  <Label>{t('cancellationHours')}</Label>
                  <Input defaultValue={settings.cancellation_hours} readOnly className="bg-slate-50 dark:bg-slate-900" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="border rounded-xl p-16 text-center">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold mb-2">{t('noSettingsConfiguredTitle')}</h3>
          <p className="text-muted-foreground">{t('noSettingsConfiguredDesc')}</p>
        </div>
      )}
    </div>
  )
}
