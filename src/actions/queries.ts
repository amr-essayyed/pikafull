"use server"

import { createClient } from "@/lib/supabase/server"

// ── Public Queries (no auth required) ──

export async function getServices() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
  if (error) throw error
  return data
}

export async function getExtraServices() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("extra_services")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
  if (error) throw error
  return data
}

export async function getFAQItems() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("faq_items")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
  if (error) throw error
  return data
}

export async function getTestimonials() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_featured", true)
    .order("sort_order")
  if (error) throw error
  return data
}

export async function getCompanySettings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("company_settings")
    .select("*")
    .single()
  if (error) throw error
  return data
}

export async function getGalleryImages() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .order("sort_order")
  if (error) throw error
  return data
}

// ── Dashboard Queries (auth required) ──

export async function getDashboardStats() {
  const supabase = await createClient()

  const [bookings, customers, employees] = await Promise.all([
    supabase.from("bookings").select("id, total_price, status, created_at"),
    supabase.from("customers").select("id"),
    supabase.from("employees").select("id, is_available"),
  ])

  const totalRevenue = (bookings.data || [])
    .filter((b) => b.status === "completed" || b.status === "paid")
    .reduce((sum, b) => sum + Number(b.total_price), 0)

  const totalBookings = bookings.data?.length || 0
  const totalCustomers = customers.data?.length || 0
  const activeEmployees = (employees.data || []).filter((e) => e.is_available).length

  // Recent bookings (last 5)
  const { data: recentBookings } = await supabase
    .from("bookings")
    .select(`
      id, total_price, status, scheduled_date, scheduled_time,
      customers ( profiles ( full_name, email ) ),
      services ( name )
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  return {
    totalRevenue,
    totalBookings,
    totalCustomers,
    activeEmployees,
    recentBookings: recentBookings || [],
  }
}

export async function getAllBookings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id, booking_number, status, scheduled_date, scheduled_time,
      base_price, extras_price, total_price,
      property_type, bedrooms, bathrooms,
      customer_notes, employee_notes, created_at, employee_id,
      customers ( id, profiles ( id, full_name, email, phone, avatar_url ) ),
      services ( id, name, description, base_price ),
      employees ( id, profile_id, profiles ( id, full_name, email, phone, avatar_url ) ),
      addresses ( address_line_1, address_line_2, city, postal_code )
    `)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data || []
}

export async function getBookingById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id, booking_number, status, scheduled_date, scheduled_time,
      base_price, extras_price, total_price,
      property_type, bedrooms, bathrooms, property_size_sqft,
      customer_notes, employee_notes, created_at, employee_id,
      customers ( id, profile_id, profiles ( id, full_name, email, phone, avatar_url ) ),
      services ( id, name, description, duration_minutes, base_price ),
      employees ( id, profile_id, profiles ( id, full_name, email, phone, avatar_url ) ),
      addresses ( address_line_1, address_line_2, city, postal_code ),
      booking_extras ( id, price, quantity, extra_services ( name ) )
    `)
    .eq("id", id)
    .single()
  if (error) return null
  return data
}


export async function getAllCustomers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("customers")
    .select(`
      id, notes, lifetime_value, total_bookings, created_at,
      profiles ( id, full_name, email, phone, is_active ),
      addresses ( id, address_line_1, city, postal_code )
    `)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data || []
}

export async function getCurrentCustomerProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: customer } = await supabase
    .from("customers")
    .select(`
      id,
      profiles ( id, full_name, email, phone ),
      addresses ( id, address_line_1, city, postal_code )
    `)
    .eq("profile_id", user.id)
    .maybeSingle()

  if (!customer) return null

  const rawAddresses = (customer as any)?.addresses
  const firstAddr = Array.isArray(rawAddresses) ? rawAddresses[0] : rawAddresses
  return {
    id: (customer as any).id,
    phone: (customer as any).profiles?.phone || "",
    addressLine1: (firstAddr as any)?.address_line_1 || "",
    city: (firstAddr as any)?.city || "",
  }
}

export async function getAllEmployees() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("employees")
    .select(`
      id, skills, hourly_rate, avg_rating, total_jobs, is_available, created_at,
      profiles ( id, full_name, email, phone, avatar_url, is_active )
    `)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data || []
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId)
  if (error) throw error
}

export async function updateCompanySettings(settings: Record<string, any>) {
  const supabase = await createClient()
  const { data: existing } = await supabase
    .from("company_settings")
    .select("id")
    .single()

  if (existing) {
    const { error } = await supabase
      .from("company_settings")
      .update(settings)
      .eq("id", existing.id)
    if (error) throw error
  }
}
