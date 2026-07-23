"use client"

import * as React from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useTranslations } from "next-intl"

import { adminLogin } from "@/actions/auth"
import { loginSchema, type LoginFormData } from "@/validators/auth"
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
import { ShieldCheck } from "lucide-react"

export default function AdminLoginPage() {
  const tAuth = useTranslations("Auth")
  const tCommon = useTranslations("Common")
  const [error, setError] = React.useState<string | null>(null)
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(values: LoginFormData) {
    setError(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.append("email", values.email)
      formData.append("password", values.password)
      
      const result = await adminLogin(formData)
      if (result?.error) {
        setError(typeof result.error === 'string' ? result.error : JSON.stringify(result.error))
      }
    })
  }

  return (
    <>
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4">
          <ShieldCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {tAuth('adminTitle')}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {tAuth('adminSubtitle')}
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
                  <FormLabel>{tAuth('staffEmailLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={tAuth('staffEmailPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>{tCommon('passwordLabel')}</FormLabel>
                  </div>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isPending}>
              {isPending ? tAuth('authenticatingButton') : tAuth('accessDashboardButton')}
            </Button>
          </form>
        </Form>
      </div>

      <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
        {tAuth('notStaff')}{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          {tAuth('customerLoginLink')}
        </Link>
      </p>
    </>
  )
}
