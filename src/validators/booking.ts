import { z } from "zod"
import { parsePhoneWithCountryCode, validatePhoneNumber } from "@/lib/phone-validation"

export const bookingSchema = z.object({
  customerId: z.string().optional(),
  serviceId: z.string().min(1, "Please select a service"),
  propertyType: z.enum(["apartment", "house", "office", "studio", "villa", "other"]),
  bedrooms: z.number().min(0).max(10).default(1),
  bathrooms: z.number().min(0).max(10).default(1),
  propertySizeSqft: z.number().optional(),
  
  extras: z.array(z.string()).default([]),
  
  scheduledDate: z.date(),
  scheduledTime: z.string().min(1, "Please select a time."),
  
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  phone: z.string().min(1, "Phone number is required"),
  postalCode: z.string().optional(),
  
  notes: z.string().max(500).optional(),
  
  saveToProfile: z.boolean().default(true),
  paymentMethod: z.enum(["cash", "card", "bank_transfer", "online"]).default("online"),
}).superRefine((data, ctx) => {
  if (data.phone) {
    const parsed = parsePhoneWithCountryCode(data.phone)
    const res = validatePhoneNumber(parsed.countryCode, parsed.number, true)
    if (!res.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: res.error || "Invalid phone number",
      })
    }
  }
})

export type BookingFormData = z.infer<typeof bookingSchema>
