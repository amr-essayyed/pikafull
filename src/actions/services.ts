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
  before_image_url?: string
  after_image_url?: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from("services").insert(data)
  if (error) throw error
  revalidatePath("/dashboard/services")
  revalidatePath("/") // revalidate public pages if needed
}

export async function uploadServicePhoto(formData: FormData): Promise<string> {
  const file = formData.get("file") as File
  if (!file || file.size === 0) {
    throw new Error("No file provided")
  }
  const supabase = await createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
  const filePath = `photos/${fileName}`

  const buffer = await file.arrayBuffer()
  const { error } = await supabase.storage
    .from("services")
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (error) {
    // Fallback to base64 Data URL if storage bucket fails or isn't set up locally
    const base64 = Buffer.from(buffer).toString('base64')
    return `data:${file.type};base64,${base64}`
  }

  const { data: publicUrlData } = supabase.storage
    .from("services")
    .getPublicUrl(filePath)

  return publicUrlData.publicUrl
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
