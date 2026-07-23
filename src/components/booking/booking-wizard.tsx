"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useTranslations } from "next-intl"

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
import { bookingSchema, type BookingFormData } from "@/validators/booking"
import { createBooking } from "@/actions/bookings"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BookingWizardProps {
  services?: any[]
  extras?: any[]
  customers?: any[]
  isAdmin?: boolean
  initialCustomerData?: {
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
  initialCustomerData,
}: BookingWizardProps) {
  const t = useTranslations("BookingWizard")
  const [currentStep, setCurrentStep] = React.useState(0)
  const [error, setError] = React.useState<string | null>(null)
  const [isPending, startTransition] = React.useTransition()
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [datePopoverOpen, setDatePopoverOpen] = React.useState(false)

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema) as any,
    defaultValues: {
      customerId: "",
      serviceId: "",
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
      if (initialCustomerData.addressLine1) form.setValue("addressLine1", initialCustomerData.addressLine1)
      if (initialCustomerData.city) form.setValue("city", initialCustomerData.city)
      if (initialCustomerData.phone) form.setValue("phone", initialCustomerData.phone)
    }
  }, [initialCustomerData, form])

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
        setIsSuccess(true)
      }
    })
  }

  const next = async () => {
    const fields = getFieldsForStep(currentStep)
    const output = await form.trigger(fields as any, { shouldFocus: true })

    if (!output) return

    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(step => step + 1)
    } else {
      await form.handleSubmit(processForm)()
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
        return ["customerId"]
      case "Service Selection":
        return ["serviceId"]
      case "Property Details":
        return ["propertyType", "bedrooms", "bathrooms"]
      case "Date & Time":
        return ["scheduledDate", "scheduledTime"]
      case "Address & Payment":
        return ["addressLine1", "city", "phone", "paymentMethod"]
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
      {/* Progress Bar */}
      <nav aria-label="Progress">
        <ol role="list" className="space-y-4 md:flex md:space-y-0 md:space-x-8 p-6 bg-slate-50 dark:bg-slate-950 border-b">
          {wizardSteps.map((step, index) => (
            <li key={step.internalName} className="md:flex-1">
              <div
                className={cn(
                  "group pl-4 py-2 flex flex-col border-l-4 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4",
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
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                     <FormItem className="space-y-3">
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
                                "border rounded-xl p-4 cursor-pointer transition-all hover:border-indigo-600",
                                field.value === service.id ? "border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50 dark:bg-indigo-950" : ""
                              )}
                              onClick={() => field.onChange(service.id)}
                            >
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
                          <Input 
                            type="number" 
                            min={0} 
                            max={10} 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value))} 
                          />
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
                          <Input 
                            type="number" 
                            min={0} 
                            max={10} 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value))} 
                          />
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
                                {isDateValid ? format(selectedDate, "PPP") : t('pickDate')}
                              </span>
                              <CalendarIcon className="h-4 w-4 opacity-50 ml-2" />
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('time')}</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="">{t('selectTime')}</option>
                            <option value="08:00">08:00 AM</option>
                            <option value="10:00">10:00 AM</option>
                            <option value="12:00">12:00 PM</option>
                            <option value="14:00">02:00 PM</option>
                            <option value="16:00">04:00 PM</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Address & Payment */}
            {wizardSteps[currentStep].internalName === "Address & Payment" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
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
                            <Input placeholder="Cairo" {...field} />
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
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="pt-8 flex justify-between items-center border-t mt-8">
               <Button
                type="button"
                variant="outline"
                onClick={prev}
                disabled={currentStep === 0 || isPending}
              >
                {t('back')}
              </Button>
              <Button 
                type="button" 
                onClick={next}
                disabled={isPending}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {currentStep === wizardSteps.length - 1 
                  ? (isPending ? t('processing') : t('confirmBooking')) 
                  : t('continue')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
