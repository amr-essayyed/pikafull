import { z } from "zod"

export const bookingSchema = z.object({
  customerId: z.union([z.string().uuid("Please select a customer"), z.literal("")]).optional().transform(e => e === "" ? undefined : e),
  serviceId: z.string().uuid("Please select a service"),
  propertyType: z.enum(["apartment", "house", "office", "studio", "villa", "other"]),
  bedrooms: z.number().min(0).max(10).default(1),
  bathrooms: z.number().min(0).max(10).default(1),
  propertySizeSqft: z.number().optional(),
  
  extras: z.array(z.string().uuid()).default([]),
  
  scheduledDate: z.date({
    required_error: "Please select a date.",
  }),
  scheduledTime: z.string().min(1, "Please select a time."),
  
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  
  notes: z.string().max(500).optional(),
  
  paymentMethod: z.enum(["cash", "card", "bank_transfer", "online"]).default("online"),
})

export type BookingFormData = z.infer<typeof bookingSchema>
