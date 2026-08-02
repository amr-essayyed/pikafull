import { z } from "zod"
import { parsePhoneWithCountryCode, validatePhoneNumber } from "@/lib/phone-validation"

const phoneValidation = (data: { phone: string }, ctx: z.RefinementCtx) => {
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

export const phoneSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
}).superRefine(phoneValidation)

export const loginSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  otp: z.string().optional(),
}).superRefine(phoneValidation)

export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  phone: z.string().min(1, "Phone number is required"),
}).superRefine(phoneValidation)

export type PhoneFormData = z.infer<typeof phoneSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
