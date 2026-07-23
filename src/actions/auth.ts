"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { loginSchema, registerSchema } from "@/validators/auth"

export async function login(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const result = loginSchema.safeParse(data)

  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const supabase = await createClient()

  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  })

  if (error) {
    return { error: error.message || JSON.stringify(error) }
  }

  // Fetch user role to determine redirect
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", signInData.user.id)
    .single()

  revalidatePath("/", "layout")

  // @ts-expect-error Typescript infers profile as never if DB types aren't fully generated
  const role = profile?.role
  if (role === "owner" || role === "staff") {
    redirect("/dashboard")
  } else if (role === "employee") {
    redirect("/employee/my-schedule")
  } else {
    redirect("/")
  }
}

export async function adminLogin(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const result = loginSchema.safeParse(data)

  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const supabase = await createClient()

  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  })

  if (error) {
    return { error: error.message || JSON.stringify(error) }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", signInData.user.id)
    .single()

  // @ts-expect-error Typescript infers profile as never if DB types aren't fully generated
  const role = profile?.role
  if (role !== "owner" && role !== "staff") {
    await supabase.auth.signOut()
    return { error: "Access denied. You must be an owner or staff member to access the dashboard." }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function register(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const result = registerSchema.safeParse(data)

  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const supabase = await createClient()

  // For a generic registration, we'll assign the role 'customer'
  // and pass the full name in the user metadata
  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: {
        full_name: result.data.fullName,
        role: "customer",
      },
    },
  })

  if (error) {
    return { error: error.message || JSON.stringify(error) }
  }

  revalidatePath("/", "layout")
  redirect("/")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function resetPassword(formData: FormData) {
  const email = formData.get("email") as string
  if (!email) {
    return { error: "Email is required" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const password = formData.get("password") as string
  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect("/dashboard")
}
