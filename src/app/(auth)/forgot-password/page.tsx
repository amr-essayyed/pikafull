"use client"

import * as React from "react"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useTranslations } from "next-intl"

import { resetPassword } from "@/actions/auth"
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
import { Alert, AlertDescription } from "@/components/ui/alert"

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
})

type ForgotFormData = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const tAuth = useTranslations("Auth")
  const tCommon = useTranslations("Common")
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
  })

  function onSubmit(values: ForgotFormData) {
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const formData = new FormData()
      formData.append("email", values.email)
      
      const result = await resetPassword(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
    })
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {tAuth('checkEmailTitle')}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {tAuth('checkEmailSubtitle')}<span className="font-medium text-slate-900 dark:text-white">{form.getValues().email}</span>.
        </p>
        <div className="mt-8">
          <Button asChild className="w-full" variant="outline">
            <Link href="/login">{tAuth('backToLogin')}</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {tAuth('forgotTitle')}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {tAuth('forgotSubtitle')}
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
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tCommon('emailLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={tCommon('emailPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? tAuth('sendingLinkButton') : tAuth('resetPasswordButton')}
            </Button>
          </form>
        </Form>
      </div>

      <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
        {tAuth('rememberPassword')}{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          {tAuth('backToLogin')}
        </Link>
      </p>
    </>
  )
}
