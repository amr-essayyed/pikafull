"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { updateCustomerProfile, changeCustomerPassword } from "@/actions/customer-profile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  User,
  Lock,
  Calendar,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
} from "lucide-react"

interface CustomerProfileClientProps {
  profile: {
    id: string
    full_name: string | null
    email: string
    phone: string | null
    created_at: string
  }
  customer: {
    id: string
    total_bookings: number
    lifetime_value: number
  } | null
  address: {
    address_line_1: string
    city: string
    postal_code: string
  } | null
}

export function CustomerProfileClient({ profile, customer, address }: CustomerProfileClientProps) {
  const t = useTranslations("CustomerProfile")

  // Form states for profile edit
  const [profilePending, setProfilePending] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Form states for password change
  const [passwordPending, setPasswordPending] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const memberDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—"

  // Handler for Profile Update
  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setProfilePending(true)
    setProfileSuccess(null)
    setProfileError(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateCustomerProfile(formData)

    setProfilePending(false)
    if (result.error) {
      setProfileError(result.error)
    } else if (result.success) {
      setProfileSuccess(t("profileUpdatedSuccess"))
    }
  }

  // Handler for Password Change
  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (password.length < 6) {
      setPasswordError(t("passwordTooShort"))
      return
    }

    if (password !== confirmPassword) {
      setPasswordError(t("passwordMismatch"))
      return
    }

    setPasswordPending(true)
    setPasswordSuccess(null)
    setPasswordError(null)

    const formData = new FormData()
    formData.append("password", password)
    formData.append("confirmPassword", confirmPassword)

    const result = await changeCustomerPassword(formData)

    setPasswordPending(false)
    if (result.error) {
      setPasswordError(result.error)
    } else if (result.success) {
      setPasswordSuccess(t("passwordUpdatedSuccess"))
      setPassword("")
      setConfirmPassword("")
    }
  }

  // Initials for avatar preview
  const initials = (profile.full_name || profile.email || "C")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  return (
    <div className="space-y-8">
      {/* Header Profile Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-emerald-900 text-white p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-2xl font-extrabold text-white shadow-inner">
              {initials}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-indigo-900 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                  {profile.full_name || profile.email}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {t("customerRole")}
                </span>
              </div>
              <p className="text-indigo-200 text-sm mt-1 flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                {profile.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/book"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-all shadow-lg hover:shadow-emerald-500/25 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              {t("bookNewService")}
            </Link>
            <Link
              href="/customer/dashboard"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium border border-white/10 backdrop-blur-sm transition-all text-sm"
            >
              {t("viewBookings")}
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="personal-info" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
          <TabsTrigger value="personal-info" className="rounded-lg flex items-center gap-2 text-xs sm:text-sm">
            <User className="w-4 h-4" />
            <span className="hidden xs:inline">{t("tabPersonalInfo")}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg flex items-center gap-2 text-xs sm:text-sm">
            <Lock className="w-4 h-4" />
            <span className="hidden xs:inline">{t("tabSecurity")}</span>
          </TabsTrigger>
          <TabsTrigger value="overview" className="rounded-lg flex items-center gap-2 text-xs sm:text-sm">
            <Calendar className="w-4 h-4" />
            <span className="hidden xs:inline">{t("tabOverview")}</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Personal Info & Address */}
        <TabsContent value="personal-info">
          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {t("personalInformation")}
              </CardTitle>
              <CardDescription>{t("personalInformationDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {profileSuccess && (
                <Alert className="mb-6 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <AlertTitle className="font-semibold">Success</AlertTitle>
                  <AlertDescription>{profileSuccess}</AlertDescription>
                </Alert>
              )}

              {profileError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{profileError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-sm font-medium">
                      {t("fullName")}
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400 rtl:right-3 rtl:left-auto" />
                      <Input
                        id="full_name"
                        name="full_name"
                        defaultValue={profile.full_name || ""}
                        placeholder={t("fullNamePlaceholder")}
                        className="pl-10 rtl:pr-10 rtl:pl-3"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      {t("email")}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 rtl:right-3 rtl:left-auto" />
                      <Input
                        id="email"
                        value={profile.email}
                        disabled
                        className="pl-10 rtl:pr-10 rtl:pl-3 bg-slate-100 dark:bg-slate-900 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-slate-500">{t("emailNote")}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    {t("phone")}
                  </Label>
                  <div className="relative max-w-md">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400 rtl:right-3 rtl:left-auto" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      defaultValue={profile.phone || ""}
                      placeholder={t("phonePlaceholder")}
                      className="pl-10 rtl:pr-10 rtl:pl-3"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <h3 className="text-md font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    {t("primaryAddress")}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address_line_1" className="text-xs font-medium">
                        {t("addressLine1")}
                      </Label>
                      <Input
                        id="address_line_1"
                        name="address_line_1"
                        defaultValue={address?.address_line_1 || ""}
                        placeholder={t("addressLine1Placeholder")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-xs font-medium">
                        {t("city")}
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        defaultValue={address?.city || ""}
                        placeholder={t("cityPlaceholder")}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={profilePending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]"
                  >
                    {profilePending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin rtl:ml-2 rtl:mr-0" />
                        {t("saving")}
                      </>
                    ) : (
                      t("saveChanges")
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Security & Password */}
        <TabsContent value="security">
          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xl flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {t("securitySettings")}
              </CardTitle>
              <CardDescription>{t("securitySettingsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {passwordSuccess && (
                <Alert className="mb-6 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <AlertTitle className="font-semibold">Success</AlertTitle>
                  <AlertDescription>{passwordSuccess}</AlertDescription>
                </Alert>
              )}

              {passwordError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    {t("newPassword")}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 rtl:right-3 rtl:left-auto" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("newPasswordPlaceholder")}
                      className="pl-10 rtl:pr-10 rtl:pl-3"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    {t("confirmPassword")}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 rtl:right-3 rtl:left-auto" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t("confirmPasswordPlaceholder")}
                      className="pl-10 rtl:pr-10 rtl:pl-3"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={passwordPending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
                  >
                    {passwordPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin rtl:ml-2 rtl:mr-0" />
                        {t("updatingPassword")}
                      </>
                    ) : (
                      t("changePassword")
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Account Overview */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  {t("accountOverview")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-slate-500">{t("memberSince")}</span>
                  <span className="font-medium">{memberDate}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-slate-500">{t("totalBookings")}</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {customer?.total_bookings || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-500">{t("primaryAddress")}</span>
                  <span className="font-medium text-right text-xs max-w-[200px] truncate">
                    {address?.address_line_1 ? `${address.address_line_1}, ${address.city}` : "—"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  {t("quickActions")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link
                  href="/book"
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-emerald-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                        {t("bookNewService")}
                      </p>
                      <p className="text-xs text-slate-500">Schedule your next cleaning session</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all" />
                </Link>

                <Link
                  href="/customer/dashboard"
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-indigo-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                        {t("viewBookings")}
                      </p>
                      <p className="text-xs text-slate-500">Check current and past bookings</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
