"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateCustomerProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Unauthorized. Please log in again." }
  }

  const fullName = (formData.get("full_name") as string || "").trim()
  const phone = (formData.get("phone") as string || "").trim()
  const addressLine1 = (formData.get("address_line_1") as string || "").trim()
  const city = (formData.get("city") as string || "").trim()

  if (!fullName) {
    return { error: "Full name is required." }
  }

  // 1. Update Profile table
  const { error: profileError } = await (supabase.from("profiles") as any)
    .update({
      full_name: fullName,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (profileError) {
    console.error("[updateCustomerProfile] Error updating profile:", profileError)
    return { error: profileError.message }
  }

  // 2. Fetch Customer record
  const { data: customerData } = await (supabase.from("customers") as any)
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle()

  const customer = customerData as any

  // 3. Update or Insert Primary Address if customer record exists
  if (customer && (addressLine1 || city)) {
    const { data: existingAddresses } = await (supabase.from("addresses") as any)
      .select("id")
      .eq("customer_id", customer.id)
      .limit(1)

    if (existingAddresses && existingAddresses.length > 0) {
      await (supabase.from("addresses") as any)
        .update({
          address_line_1: addressLine1,
          city: city,
        })
        .eq("id", (existingAddresses[0] as any).id)
    } else {
      await (supabase.from("addresses") as any)
        .insert({
          customer_id: customer.id,
          address_line_1: addressLine1,
          city: city,
        })
    }
  }

  revalidatePath("/customer/profile")
  revalidatePath("/customer/dashboard")
  return { success: true }
}

export async function changeCustomerPassword(formData: FormData) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Unauthorized. Please log in again." }
  }

  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters long." }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." }
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    console.error("[changeCustomerPassword] Error updating password:", error)
    return { error: error.message }
  }

  revalidatePath("/customer/profile")
  return { success: true }
}
