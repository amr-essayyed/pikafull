"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// Generate a random secure password
function generatePassword() {
  return crypto.randomUUID().replace(/-/g, '') + '!A1'
}

export async function createCustomer(data: { full_name: string; email: string; phone?: string; notes?: string }) {
  const admin = createAdminClient()
  const password = generatePassword()

  // 1. Create Auth User
  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email: data.email,
    password: password,
    email_confirm: true,
    user_metadata: {
      full_name: data.full_name,
      role: "customer"
    }
  })

  if (userError) throw new Error(userError.message)
  const userId = userData.user.id

  // 2. The profile and customer records are created automatically by database triggers.
  // We just need to update phone in profiles, and notes in customers.
  
  // Wait a brief moment for triggers to complete
  await new Promise(resolve => setTimeout(resolve, 500))

  const supabase = await createClient()

  if (data.phone) {
    await supabase.from("profiles").update({ phone: data.phone }).eq("id", userId)
  }

  if (data.notes) {
    await supabase.from("customers").update({ notes: data.notes }).eq("profile_id", userId)
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const { error: resendError } = await resend.emails.send({
        from: 'Pikafull <noreply@4teq.store>',
        to: data.email,
        subject: 'Welcome to Pikafull! Your Account Details',
        html: `<p>Hello ${data.full_name},</p><p>Your account has been created successfully.</p><p>Your login email is: <strong>${data.email}</strong><br/>Your generated password is: <strong>${password}</strong></p><p>Please log in and change your password as soon as possible.</p>`
      })
      if (resendError) console.error("Resend API Error:", resendError)
    } catch (error) {
      console.error("Failed to send welcome email:", error)
    }
  }

  revalidatePath("/dashboard/customers")
  return { success: true, password } // Return password to show or email to user
}

export async function updateCustomer(customerId: string, profileId: string, data: { full_name: string; email: string; phone?: string; notes?: string }) {
  const admin = createAdminClient()
  const supabase = await createClient()

  // 1. Update Auth User Email
  const { error: userError } = await admin.auth.admin.updateUserById(profileId, {
    email: data.email,
    user_metadata: { full_name: data.full_name }
  })
  if (userError) throw new Error(userError.message)

  // 2. Update Profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: data.full_name, email: data.email, phone: data.phone || "" })
    .eq("id", profileId)
  if (profileError) throw new Error(profileError.message)

  // 3. Update Customer Notes
  const { error: customerError } = await supabase
    .from("customers")
    .update({ notes: data.notes || "" })
    .eq("id", customerId)
  if (customerError) throw new Error(customerError.message)

  revalidatePath("/dashboard/customers")
  return { success: true }
}

export async function createEmployee(data: { full_name: string; email: string; phone?: string; hourly_rate?: number; bio?: string; is_available: boolean }) {
  const admin = createAdminClient()
  const password = generatePassword()

  // 1. Create Auth User
  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email: data.email,
    password: password,
    email_confirm: true,
    user_metadata: {
      full_name: data.full_name,
      role: "employee"
    }
  })

  if (userError) throw new Error(userError.message)
  const userId = userData.user.id

  // 2. Profile is auto-created by trigger. We need to update phone and create the employee record.
  
  await new Promise(resolve => setTimeout(resolve, 500))

  const supabase = await createClient()

  if (data.phone) {
    await supabase.from("profiles").update({ phone: data.phone }).eq("id", userId)
  }

  const { error: empError } = await supabase.from("employees").insert({
    profile_id: userId,
    hourly_rate: data.hourly_rate || 0,
    bio: data.bio || "",
    is_available: data.is_available,
    skills: [] // Can be updated later
  })

  if (empError) throw new Error(empError.message)

  if (process.env.RESEND_API_KEY) {
    try {
      const { error: resendError } = await resend.emails.send({
        from: 'Pikafull <noreply@4teq.store>',
        to: data.email,
        subject: 'Welcome to Pikafull! Your Employee Account',
        html: `<p>Hello ${data.full_name},</p><p>Your employee account has been created successfully.</p><p>Your login email is: <strong>${data.email}</strong><br/>Your generated password is: <strong>${password}</strong></p><p>Please log in and change your password as soon as possible.</p>`
      })
      if (resendError) console.error("Resend API Error:", resendError)
    } catch (error) {
      console.error("Failed to send welcome email:", error)
    }
  }

  revalidatePath("/dashboard/employees")
  return { success: true, password }
}

export async function updateEmployee(employeeId: string, profileId: string, data: { full_name: string; email: string; phone?: string; hourly_rate?: number; bio?: string; is_available: boolean }) {
  const admin = createAdminClient()
  const supabase = await createClient()

  // 1. Update Auth User Email
  const { error: userError } = await admin.auth.admin.updateUserById(profileId, {
    email: data.email,
    user_metadata: { full_name: data.full_name }
  })
  if (userError) throw new Error(userError.message)

  // 2. Update Profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: data.full_name, email: data.email, phone: data.phone || "" })
    .eq("id", profileId)
  if (profileError) throw new Error(profileError.message)

  // 3. Update Employee Record
  const { error: empError } = await supabase
    .from("employees")
    .update({ 
      hourly_rate: data.hourly_rate || 0, 
      bio: data.bio || "", 
      is_available: data.is_available 
    })
    .eq("id", employeeId)
  if (empError) throw new Error(empError.message)

  revalidatePath("/dashboard/employees")
  return { success: true }
}

export async function deleteCustomer(profileId: string) {
  const admin = createAdminClient()
  
  const { error } = await admin.auth.admin.deleteUser(profileId)
  
  if (error) {
    if (error.message.includes("foreign key constraint") || error.message.includes("violates foreign key constraint")) {
      throw new Error("Cannot delete this customer because they have existing bookings. Please remove their bookings first.")
    }
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/customers")
  return { success: true }
}

export async function deleteEmployee(profileId: string) {
  const admin = createAdminClient()
  
  const { error } = await admin.auth.admin.deleteUser(profileId)
  
  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/employees")
  return { success: true }
}

