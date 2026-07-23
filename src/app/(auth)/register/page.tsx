"use client"

import * as React from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useTranslations } from "next-intl"

import { register } from "@/actions/auth"
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
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RegisterPage() {
  const tAuth = useTranslations("Auth")
  const tCommon = useTranslations("Common")
  const [error, setError] = React.useState<string | null>(null)
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  })

  function onSubmit(values: RegisterFormData) {
    setError(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.append("fullName", values.fullName)
      formData.append("email", values.email)
      formData.append("password", values.password)
      
      const result = await register(formData)
      if (result?.error) {
        setError(typeof result.error === 'string' ? result.error : JSON.stringify(result.error))
      }
    })
  }

  return (
    <>
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {tAuth('registerTitle')}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {tAuth('registerSubtitle')}
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tCommon('passwordLabel')}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? tAuth('creatingAccountButton') : tAuth('createAccountButton')}
            </Button>
          </form>
        </Form>
      </div>

      <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
        {tAuth('hasAccount')}{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          {tAuth('signInInstead')}
        </Link>
      </p>
    </>
  )
}
