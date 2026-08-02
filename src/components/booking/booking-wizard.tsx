"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ar as arLocale } from "date-fns/locale"
import { CalendarIcon, User, UserPlus, Check, Minus, Plus } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { CitySelect } from "@/components/ui/city-select"
import { bookingSchema, type BookingFormData } from "@/validators/booking"
import { createBooking, getUnavailableTimeslots } from "@/actions/bookings"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BookingWizardProps {
  services?: any[]
  extras?: any[]
  customers?: any[]
  isAdmin?: boolean
  isAuthenticated?: boolean
  initialServiceId?: string
  initialCustomerData?: {
    id?: string
    fullName?: string
    email?: string
    phone?: string
    addressLine1?: string
    city?: string
  }
}

export function BookingWizard({
  services = [],
  extras = [],
  customers = [],
  isAdmin = false,
  isAuthenticated = true,
  initialServiceId,
  initialCustomerData,
}: BookingWizardProps) {
  const t = useTranslations("BookingWizard")
  const currentLocale = useLocale()
  const isArabic = currentLocale === "ar"
  const dateFnsLocale = isArabic ? arLocale : undefined
  const [currentStep, setCurrentStep] = React.useState(0)
  const [error, setError] = React.useState<string | null>(null)
  const [isPending, startTransition] = React.useTransition()
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [datePopoverOpen, setDatePopoverOpen] = React.useState(false)
  const [unavailableTimeslots, setUnavailableTimeslots] = React.useState<string[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = React.useState<boolean>(false)
  const [customerMode, setCustomerMode] = React.useState<"existing" | "new">("existing")

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema) as any,
    defaultValues: {
      customerId: initialCustomerData?.id || "",
      fullName: initialCustomerData?.fullName || "",
      email: initialCustomerData?.email || "",
      serviceId: initialServiceId || "",
      propertyType: "apartment",
      bedrooms: 1,
      bathrooms: 1,
      extras: [],
      scheduledDate: undefined,
      scheduledTime: "",
      addressLine1: initialCustomerData?.addressLine1 || "",
      addressLine2: "",
      city: initialCustomerData?.city || "",
      phone: initialCustomerData?.phone || "",
      saveToProfile: true,
      paymentMethod: "online",
    },
  })

  // Auto-populate customer details on mount if initialCustomerData is available
  React.useEffect(() => {
    if (initialCustomerData) {
      if (initialCustomerData.id) form.setValue("customerId", initialCustomerData.id)
      if (initialCustomerData.fullName) form.setValue("fullName", initialCustomerData.fullName)
      if (initialCustomerData.email) form.setValue("email", initialCustomerData.email)
      if (initialCustomerData.addressLine1) form.setValue("addressLine1", initialCustomerData.addressLine1)
      if (initialCustomerData.city) form.setValue("city", initialCustomerData.city)
      if (initialCustomerData.phone) form.setValue("phone", initialCustomerData.phone)
    }
  }, [initialCustomerData, form])

  // Auto-advance past service selection if a service was pre-selected via URL
  React.useEffect(() => {
    if (initialServiceId && !isAdmin && currentStep === 0) {
      // Verify the service exists in the available list before advancing
      const svcExists = services.some((s: any) => s.id === initialServiceId)
      if (svcExists) {
        setCurrentStep(1)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run only on mount

  // Restore form draft from sessionStorage on mount (if guest or user returning)
  React.useEffect(() => {
    if (typeof window !== "undefined" && !isAdmin) {
      try {
        const saved = sessionStorage.getItem("pikafull_booking_draft")
        if (saved) {
          const draft = JSON.parse(saved)
          if (draft.fullName) form.setValue("fullName", draft.fullName)
          if (draft.email) form.setValue("email", draft.email)
          if (draft.serviceId && !initialServiceId) form.setValue("serviceId", draft.serviceId)
          if (draft.propertyType) form.setValue("propertyType", draft.propertyType)
          if (typeof draft.bedrooms === "number") form.setValue("bedrooms", draft.bedrooms)
          if (typeof draft.bathrooms === "number") form.setValue("bathrooms", draft.bathrooms)
          if (Array.isArray(draft.extras)) form.setValue("extras", draft.extras)
          if (draft.scheduledDate) form.setValue("scheduledDate", new Date(draft.scheduledDate))
          if (draft.scheduledTime) form.setValue("scheduledTime", draft.scheduledTime)
          if (draft.addressLine1 && !initialCustomerData?.addressLine1) form.setValue("addressLine1", draft.addressLine1)
          if (draft.city && !initialCustomerData?.city) form.setValue("city", draft.city)
          if (draft.phone && !initialCustomerData?.phone) form.setValue("phone", draft.phone)
          if (typeof draft.currentStep === "number" && draft.currentStep >= 0 && draft.currentStep < 4 && !initialServiceId) {
            setCurrentStep(draft.currentStep)
          }
        }
      } catch (e) {
        console.error("Failed to restore booking draft:", e)
      }
    }
  }, [isAdmin, form, initialCustomerData])

  // Save form draft to sessionStorage on change
  const watchAllFields = form.watch()
  React.useEffect(() => {
    if (typeof window !== "undefined" && !isAdmin) {
      try {
        const draft = {
          ...watchAllFields,
          currentStep,
        }
        sessionStorage.setItem("pikafull_booking_draft", JSON.stringify(draft))
      } catch (e) {
        console.error("Failed to save booking draft:", e)
      }
    }
  }, [watchAllFields, currentStep, isAdmin])

  // Fetch unavailable timeslots whenever scheduledDate changes
  const watchedDate = form.watch("scheduledDate")
  React.useEffect(() => {
    if (watchedDate) {
      const d = new Date(watchedDate)
      if (!isNaN(d.getTime())) {
        const dateStr = format(d, "yyyy-MM-dd")
        setIsLoadingSlots(true)
        getUnavailableTimeslots(dateStr)
          .then((slots) => {
            setUnavailableTimeslots(slots)
            const currentSlot = form.getValues("scheduledTime")
            if (currentSlot && slots.includes(currentSlot)) {
              form.setValue("scheduledTime", "")
            }
          })
          .catch((err) => {
            console.error("Failed to check timeslots availability:", err)
          })
          .finally(() => {
            setIsLoadingSlots(false)
          })
      }
    } else {
      setUnavailableTimeslots([])
    }
  }, [watchedDate, form])

  // Handle admin customer selection to auto-fill address/city/phone
  const handleCustomerChange = (selectedId: string) => {
    form.setValue("customerId", selectedId)
    if (selectedId && customers.length > 0) {
      const cust = customers.find((c: any) => c.id === selectedId)
      if (cust) {
        if (cust.addressLine1) form.setValue("addressLine1", cust.addressLine1)
        if (cust.city) form.setValue("city", cust.city)
        if (cust.phone) form.setValue("phone", cust.phone)
      }
    }
  }

  // Use real services from DB, fall back to defaults
  const displayServices = services.length > 0 ? services : [
    { id: "11111111-1111-1111-1111-111111111111", name: "Regular Cleaning", base_price: 80 },
    { id: "22222222-2222-2222-2222-222222222222", name: "Deep Cleaning", base_price: 150 },
  ]

  const defaultSteps = [
    { id: "Step 1", internalName: "Service Selection", name: t('stepServiceSelection') },
    { id: "Step 2", internalName: "Property Details", name: t('stepPropertyDetails') },
    { id: "Step 3", internalName: "Date & Time", name: t('stepDateTime') },
    { id: "Step 4", internalName: "Address & Payment", name: t('stepAddressPayment') },
  ]

  const wizardSteps = isAdmin ? [
    { id: "Step 1", internalName: "Customer Selection", name: t('stepCustomerSelection') },
    ...defaultSteps.map(s => ({ ...s, id: `Step ${parseInt(s.id.split(" ")[1]) + 1}` }))
  ] : defaultSteps;

  const processForm = async (data: BookingFormData) => {
    setError(null)
    startTransition(async () => {
      const result = await createBooking(data)
      if (result?.error) {
        setError(result.error)
      } else {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("pikafull_booking_draft")
        }
        setIsSuccess(true)
      }
    })
  }

  const next = async () => {
    if (wizardSteps[currentStep].internalName === "Customer Selection") {
      if (customerMode === "existing") {
        const custId = form.getValues("customerId")
        if (!custId) {
          form.setError("customerId", { type: "custom", message: t("pleaseSelectCustomer") })
          return
        }
      }
    }

    const fields = getFieldsForStep(currentStep)
    const output = await form.trigger(fields as any, { shouldFocus: true })

    if (!output) return

    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(step => step + 1)
    } else {
      await form.handleSubmit(
        processForm,
        (errors) => {
          console.error("Booking form validation errors:", errors)
          const errorKeys = Object.keys(errors)
          if (errorKeys.length > 0) {
            const firstKey = errorKeys[0]
            const errObj = errors[firstKey as keyof typeof errors]
            setError(errObj?.message ? String(errObj.message) : "Please fill in all required fields.")
          }
        }
      )()
    }
  }

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(step => step - 1)
    }
  }

  const getFieldsForStep = (step: number) => {
    const stepName = wizardSteps[step].internalName;
    switch (stepName) {
      case "Customer Selection":
        return customerMode === "existing" ? ["customerId"] : ["fullName", "email"]
      case "Service Selection":
        return ["serviceId"]
      case "Property Details":
        return ["propertyType", "bedrooms", "bathrooms"]
      case "Date & Time":
        return ["scheduledDate", "scheduledTime"]
      case "Address & Payment":
        return isAuthenticated
          ? ["addressLine1", "city", "phone", "paymentMethod"]
          : ["fullName", "email", "addressLine1", "city", "phone", "paymentMethod"]
      default:
        return []
    }
  }

  if (isSuccess) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border p-12 text-center shadow-sm">
        <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold mb-4">{t('bookingConfirmed')}</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          {t('thankYouDesc')}
        </p>
        <Button onClick={() => window.location.href = isAdmin ? "/dashboard/bookings" : "/customer/dashboard"}>
          {isAdmin ? t('goToBookings') : t('goToDashboard')}
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border shadow-sm overflow-hidden">
      {!isAuthenticated && !isAdmin && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 p-4 px-6 flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-base">💡</span>
            <span>
              <strong>Booking as Guest:</strong> Your customer account will be created automatically when you confirm your booking.
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900 text-xs shrink-0"
            onClick={() => window.location.href = "/login?redirectTo=/book"}
          >
            Sign In Instead
          </Button>
        </div>
      )}

      {/* Progress Bar — Compact on mobile, full on desktop */}
      {/* Mobile compact stepper */}
      <div className="block md:hidden p-4 bg-slate-50 dark:bg-slate-950 border-b">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
            {wizardSteps[currentStep].id} {t('of')} {wizardSteps.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {Math.round(((currentStep + 1) / wizardSteps.length) * 100)}%
          </p>
        </div>
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / wizardSteps.length) * 100}%` }}
          />
        </div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {wizardSteps[currentStep].name}
        </p>
      </div>

      {/* Desktop full stepper */}
      <nav aria-label="Progress" className="hidden md:block">
        <ol role="list" className="flex space-x-8 p-6 bg-slate-50 dark:bg-slate-950 border-b">
          {wizardSteps.map((step, index) => (
            <li key={step.internalName} className="flex-1">
              <div
                className={cn(
                  "group pt-4 pb-0 border-t-4 flex flex-col",
                  currentStep > index
                    ? "border-indigo-600 hover:border-indigo-800"
                    : currentStep === index
                    ? "border-indigo-600"
                    : "border-gray-200"
                )}
              >
                <span
                  className={cn(
                    "text-sm font-medium",
                    currentStep > index
                      ? "text-indigo-600 group-hover:text-indigo-800"
                      : currentStep === index
                      ? "text-indigo-600"
                      : "text-gray-500"
                  )}
                >
                  {step.id}
                </span>
                <span className="text-sm font-medium">{step.name}</span>
              </div>
            </li>
          ))}
        </ol>
      </nav>

      {/* Form Area */}
      <div className="p-6 md:p-10">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form className="space-y-8">
            {/* Step 0: Customer Selection (Admin Only) */}
            {wizardSteps[currentStep].internalName === "Customer Selection" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {t('selectCustomerType')}
                  </label>
                  <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg max-w-md">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerMode("existing")
                        form.clearErrors("customerId")
                      }}
                      className={cn(
                        "flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium rounded-md transition-all cursor-pointer",
                        customerMode === "existing"
                          ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                      )}
                    >
                      <User className="w-4 h-4" />
                      {t('existingCustomer')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerMode("new")
                        form.setValue("customerId", "")
                        form.clearErrors(["fullName", "email"])
                      }}
                      className={cn(
                        "flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium rounded-md transition-all cursor-pointer",
                        customerMode === "new"
                          ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                      )}
                    >
                      <UserPlus className="w-4 h-4" />
                      {t('newCustomer')}
                    </button>
                  </div>
                </div>

                {customerMode === "existing" ? (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>{t('selectCustomer')}</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              value={field.value || ""}
                              onChange={(e) => {
                                field.onChange(e)
                                handleCustomerChange(e.target.value)
                              }}
                            >
                              <option value="">{t('selectCustomerPlaceholder')}</option>
                              {customers.map((c: any) => (
                                <option key={c.id} value={c.id}>
                                  {c.name} ({c.email})
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("customerId") && (
                      <div className="p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-sm space-y-1">
                        <p className="font-semibold text-indigo-900 dark:text-indigo-200">
                          {customers.find((c: any) => c.id === form.watch("customerId"))?.name}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          ✉️ {customers.find((c: any) => c.id === form.watch("customerId"))?.email}
                        </p>
                        {customers.find((c: any) => c.id === form.watch("customerId"))?.phone && (
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            📞 {customers.find((c: any) => c.id === form.watch("customerId"))?.phone}
                          </p>
                        )}
                        {customers.find((c: any) => c.id === form.watch("customerId"))?.addressLine1 && (
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            📍 {customers.find((c: any) => c.id === form.watch("customerId"))?.addressLine1}, {customers.find((c: any) => c.id === form.watch("customerId"))?.city}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('fullName')}</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
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
                            <FormLabel>{t('email')}</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                      <span className="text-base leading-none">💡</span>
                      <div>
                        <strong>{t('newCustomerNotice')}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Service Selection */}
            {wizardSteps[currentStep].internalName === "Service Selection" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <FormField
                  control={form.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>{t('selectService')}</FormLabel>
                      <FormControl>
                        <div className="grid gap-4 md:grid-cols-2">
                          {displayServices.map((service) => (
                            <div
                              key={service.id}
                              className={cn(
                                "relative border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-indigo-600 active:scale-[0.98]",
                                field.value === service.id
                                  ? "border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50 dark:bg-indigo-950"
                                  : "hover:shadow-sm"
                              )}
                              onClick={() => field.onChange(service.id)}
                            >
                              {/* Selection checkmark badge */}
                              {field.value === service.id && (
                                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                              )}
                              <h3 className="font-bold">{service.name}</h3>
                              <p className="text-indigo-600 font-semibold mt-2">{t('fromPrice')}{service.base_price}</p>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 2: Property Details */}
            {wizardSteps[currentStep].internalName === "Property Details" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('bedrooms')}</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => field.onChange(Math.max(0, (field.value || 0) - 1))}
                              className="shrink-0 w-11 h-11 rounded-lg border border-input bg-background flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
                              disabled={field.value <= 0}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center text-lg font-semibold tabular-nums">
                              {field.value || 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => field.onChange(Math.min(10, (field.value || 0) + 1))}
                              className="shrink-0 w-11 h-11 rounded-lg border border-input bg-background flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
                              disabled={field.value >= 10}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('bathrooms')}</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => field.onChange(Math.max(0, (field.value || 0) - 1))}
                              className="shrink-0 w-11 h-11 rounded-lg border border-input bg-background flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
                              disabled={field.value <= 0}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center text-lg font-semibold tabular-nums">
                              {field.value || 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => field.onChange(Math.min(10, (field.value || 0) + 1))}
                              className="shrink-0 w-11 h-11 rounded-lg border border-input bg-background flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
                              disabled={field.value >= 10}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Date & Time */}
            {wizardSteps[currentStep].internalName === "Date & Time" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="scheduledDate"
                    render={({ field }) => {
                      const selectedDate = field.value ? new Date(field.value) : undefined
                      const isDateValid = selectedDate && !isNaN(selectedDate.getTime())

                      return (
                        <FormItem className="flex flex-col">
                          <FormLabel>{t('date')}</FormLabel>
                          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                            <PopoverTrigger
                              type="button"
                              className={cn(
                                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-left font-normal cursor-pointer",
                                !isDateValid && "text-muted-foreground"
                              )}
                            >
                              <span>
                                {isDateValid ? format(selectedDate, "PPP", { locale: dateFnsLocale }) : t('pickDate')}
                              </span>
                              <CalendarIcon className="h-4 w-4 opacity-50 ml-2" />
                            </PopoverTrigger>
                            <PopoverContent className="w-[calc(100vw-2rem)] sm:w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={isDateValid ? selectedDate : undefined}
                                onSelect={(date) => {
                                  if (date) {
                                    field.onChange(date)
                                    setDatePopoverOpen(false)
                                  }
                                }}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                locale={dateFnsLocale}
                                dir={isArabic ? "rtl" : "ltr"}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />
                  
                  <FormField
                    control={form.control}
                    name="scheduledTime"
                    render={({ field }) => {
                      const allSlots = isArabic ? [
                        { value: "08:00", label: "08:00 ص" },
                        { value: "10:00", label: "10:00 ص" },
                        { value: "12:00", label: "12:00 م" },
                        { value: "14:00", label: "02:00 م" },
                        { value: "16:00", label: "04:00 م" },
                      ] : [
                        { value: "08:00", label: "08:00 AM" },
                        { value: "10:00", label: "10:00 AM" },
                        { value: "12:00", label: "12:00 PM" },
                        { value: "14:00", label: "02:00 PM" },
                        { value: "16:00", label: "04:00 PM" },
                      ]
                      const availableSlots = allSlots.filter(
                        (slot) => !unavailableTimeslots.includes(slot.value)
                      )

                      return (
                        <FormItem>
                          <FormLabel>{t('time')}</FormLabel>
                          <FormControl>
                            <div>
                              {!watchedDate ? (
                                <p className="text-sm text-muted-foreground py-2">{t('selectDateFirst')}</p>
                              ) : isLoadingSlots ? (
                                <p className="text-sm text-muted-foreground py-2">{t('checkingAvailability')}</p>
                              ) : availableSlots.length === 0 ? (
                                <p className="text-sm text-destructive py-2">{t('noTimeslotsAvailable')}</p>
                              ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                  {availableSlots.map((slot) => (
                                    <button
                                      key={slot.value}
                                      type="button"
                                      onClick={() => field.onChange(slot.value)}
                                      className={cn(
                                        "relative h-11 rounded-lg border text-sm font-medium transition-all duration-200 active:scale-[0.97] cursor-pointer",
                                        field.value === slot.value
                                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-600"
                                          : "border-input bg-background text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                      )}
                                    >
                                      {slot.label}
                                      {field.value === slot.value && (
                                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                                          <Check className="w-2.5 h-2.5" />
                                        </div>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Address & Payment */}
            {wizardSteps[currentStep].internalName === "Address & Payment" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {!isAuthenticated && (
                  <div className="space-y-4 border-b pb-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Contact & Account Details</h3>
                      <span className="text-xs text-muted-foreground">Auto account creation</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
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
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
                      <span className="text-base leading-none">💡</span>
                      <div>
                        <strong>Automatic Account Creation:</strong> A customer account will be created automatically for this email. We will email your login password to you upon confirmation.
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">{t('serviceAddress')}</h3>
                  <FormField
                    control={form.control}
                    name="addressLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('addressLine1')}</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('city')}</FormLabel>
                          <FormControl>
                            <CitySelect
                              value={field.value || ""}
                              onChange={field.onChange}
                            />
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
                          <FormLabel>{t('phone')}</FormLabel>
                          <FormControl>
                            <PhoneInput
                              id="booking-phone"
                              name="phone"
                              value={field.value || ""}
                              onChange={field.onChange}
                              required={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Option to save address & phone as default in customer profile */}
                  {isAuthenticated && (
                    <FormField
                      control={form.control}
                      name="saveToProfile"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 bg-slate-50 dark:bg-slate-950/60 mt-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-semibold text-sm cursor-pointer">
                              {t('saveToProfile')}
                            </FormLabel>
                            <FormDescription className="text-xs text-muted-foreground">
                              {t('saveToProfileDesc')}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Form Actions — sticky on mobile, static on desktop */}
            <div className="fixed bottom-0 inset-x-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t p-4 flex justify-between items-center gap-3 md:static md:bg-transparent md:dark:bg-transparent md:backdrop-blur-none md:border-t md:z-auto md:p-0 md:pt-8 md:mt-8">
               <Button
                type="button"
                variant="outline"
                onClick={prev}
                disabled={currentStep === 0 || isPending}
                className="flex-1 md:flex-none"
              >
                {t('back')}
              </Button>
              <Button 
                type="button" 
                onClick={next}
                disabled={isPending}
                className="bg-indigo-600 hover:bg-indigo-700 font-semibold flex-1 md:flex-none"
              >
                {currentStep === wizardSteps.length - 1 
                  ? (isPending ? t('processing') : t('confirmBooking')) 
                  : t('continue')}
              </Button>
            </div>
            {/* Spacer to prevent sticky bar from overlapping form content on mobile */}
            <div className="h-20 md:h-0" />
          </form>
        </Form>
      </div>
    </div>
  )
}
