"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// ── Dashboard Queries (auth required, fetch all) ──

export async function getAllServices() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order")
  if (error) throw error
  return data || []
}

export async function getAllExtraServices() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("extra_services")
    .select("*")
    .order("sort_order")
  if (error) throw error
  return data || []
}

// ── Mutations ──

export async function createService(data: {
  name: string
  slug: string
  description?: string
  short_description?: string
  base_price: number
  duration_minutes: number
  is_active?: boolean
}) {
  const supabase = await createClient()
  const { error } = await supabase.from("services").insert(data)
  if (error) throw error
  revalidatePath("/dashboard/services")
  revalidatePath("/") // revalidate public pages if needed
}

export async function updateService(id: string, data: any) {
  const supabase = await createClient()
  const { error } = await supabase.from("services").update(data).eq("id", id)
  if (error) throw error
  revalidatePath("/dashboard/services")
  revalidatePath("/")
}

export async function toggleServiceStatus(id: string, is_active: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from("services").update({ is_active }).eq("id", id)
  if (error) throw error
  revalidatePath("/dashboard/services")
  revalidatePath("/")
}

export async function createExtraService(data: {
  name: string
  description?: string
  price: number
  duration_minutes: number
  is_active?: boolean
}) {
  const supabase = await createClient()
  const { error } = await supabase.from("extra_services").insert(data)
  if (error) throw error
  revalidatePath("/dashboard/services")
  revalidatePath("/")
}

export async function updateExtraService(id: string, data: any) {
  const supabase = await createClient()
  const { error } = await supabase.from("extra_services").update(data).eq("id", id)
  if (error) throw error
  revalidatePath("/dashboard/services")
  revalidatePath("/")
}

export async function toggleExtraServiceStatus(id: string, is_active: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from("extra_services").update({ is_active }).eq("id", id)
  if (error) throw error
  revalidatePath("/dashboard/services")
  revalidatePath("/")
}
