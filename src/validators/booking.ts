import { z } from "zod"

export const bookingSchema = z.object({
  customerId: z.string().optional(),
  fullName: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  serviceId: z.string().min(1, "Please select a service"),
  propertyType: z.enum(["apartment", "house", "office", "studio", "villa", "other"]),
  bedrooms: z.number().min(0).max(10).default(1),
  bathrooms: z.number().min(0).max(10).default(1),
  propertySizeSqft: z.number().optional(),
  
  extras: z.array(z.string()).default([]),
  
  scheduledDate: z.date({ message: "Please select a date." }),
  scheduledTime: z.string().min(1, "Please select a time."),
  
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  phone: z.string().min(1, "Phone number is required"),
  postalCode: z.string().optional(),
  
  notes: z.string().max(500).optional(),
  
  saveToProfile: z.boolean().default(true),
  paymentMethod: z.enum(["cash", "card", "bank_transfer", "online"]).default("online"),
})

export type BookingFormData = z.infer<typeof bookingSchema>
