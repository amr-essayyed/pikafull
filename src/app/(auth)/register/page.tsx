"use client"

import * as React from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useTranslations } from "next-intl"
import { ArrowLeft } from "lucide-react"

import { redirectAfterLogin } from "@/actions/auth"
import { registerSchema, type RegisterFormData } from "@/validators/auth"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"

import { useSearchParams } from "next/navigation"

function RegisterForm() {
  const tAuth = useTranslations("Auth")
  const tCommon = useTranslations("Common")
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo")

  const [error, setError] = React.useState<string | null>(null)
  const [isPending, startTransition] = React.useTransition()
  const [step, setStep] = React.useState<"phone" | "otp">("phone")
  const supabase = createClient()

  // We extend the form data slightly to capture OTP as well in this component state
  const form = useForm<RegisterFormData & { otp?: string }>({
    resolver: zodResolver(registerSchema) as any, // Cast to any to allow otp which isn't in registerSchema
    defaultValues: {
      fullName: "",
      phone: "",
      otp: "",
    },
  })

  async function onRequestOTP(fullName: string, phone: string) {
    setError(null)
    startTransition(async () => {
      const { error } = await supabase.auth.signInWithOtp({ 
        phone,
        options: {
          data: {
            full_name: fullName,
            role: "customer"
          }
        }
      })
      if (error) {
        setError(error.message)
      } else {
        setStep("otp")
      }
    })
  }

  async function onVerifyOTP(phone: string, token: string) {
    setError(null)
    startTransition(async () => {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: "sms",
      })
      if (error) {
        setError(error.message)
      } else if (data.user) {
        await redirectAfterLogin(redirectTo || undefined)
      }
    })
  }

  function onSubmit(values: RegisterFormData & { otp?: string }) {
    if (step === "phone") {
      onRequestOTP(values.fullName, values.phone)
    } else if (step === "otp" && values.otp) {
      onVerifyOTP(values.phone, values.otp)
    }
  }

  return (
    <>
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{tAuth('backToHome')}</span>
        </Link>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {tAuth('registerTitle')}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {step === "phone" ? tAuth('registerSubtitle') : tAuth('enterOtpSubtitle')}
        </p>
      </div>

      <div className="mt-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === "phone" ? (
              <>
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tAuth('fullNameLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={tAuth('fullNamePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tCommon('phoneLabel')}</FormLabel>
                      <FormControl>
                        <PhoneInput
                          value={field.value}
                          onChange={field.onChange}
                          autoComplete="tel"
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? tAuth('creatingAccountButton') : tAuth('createAccountButton')}
                </Button>
              </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tCommon('otpLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder="123456" {...field} autoComplete="one-time-code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? tAuth('verifying') : tAuth('verifyButton')}
                </Button>
                <div className="text-center mt-4">
                  <button 
                    type="button"
                    onClick={() => setStep("phone")}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    {tAuth('changePhoneNumber')}
                  </button>
                </div>
              </>
            )}
          </form>
        </Form>
      </div>

      <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
        {tAuth('hasAccount')}{" "}
        <Link
          href={redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : "/login"}
          className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          {tAuth('signInInstead')}
        </Link>
      </p>
    </>
  )
}

export default function RegisterPage() {
  return (
    <React.Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <RegisterForm />
    </React.Suspense>
  )
}
