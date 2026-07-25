"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { bookingSchema, type BookingFormData } from "@/validators/booking"
import { Resend } from "resend"

export async function createBooking(data: BookingFormData) {
  const result = bookingSchema.safeParse(data)

  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const supabase = await createClient()
  const admin = createAdminClient()

  // 1. Get current user or handle guest auto-registration
  const { data: { user } } = await supabase.auth.getUser()
  let activeUserId: string | null = user?.id || null

  if (!activeUserId) {
    if (!data.fullName || !data.email) {
      return { error: "Please enter your full name and email address to complete your booking." }
    }

    const generatedPassword = crypto.randomUUID().replace(/-/g, '') + '!A1'

    // Create user via Admin API (bypasses RLS & confirms email immediately)
    const { data: userData, error: userError } = await admin.auth.admin.createUser({
      email: data.email,
      password: generatedPassword,
      email_confirm: true,
      user_metadata: {
        full_name: data.fullName,
        role: "customer",
      },
    })

    if (userError || !userData?.user) {
      const msg = userError?.message || ""
      if (msg.includes("already registered") || msg.includes("already exists")) {
        return { error: "An account with this email already exists. Please sign in to complete your booking." }
      }
      return { error: userError?.message || "Failed to create customer account." }
    }

    activeUserId = userData.user.id

    // Sign the new user in on the client cookies so their session is active
    try {
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: generatedPassword,
      })
    } catch (authErr) {
      console.warn("Auto sign-in warning:", authErr)
    }

    // Send welcome email with generated password via Resend
    try {
      const apiKey = process.env.RESEND_API_KEY
      if (apiKey) {
        const resend = new Resend(apiKey)
        await resend.emails.send({
          from: 'Pikafull <noreply@4teq.store>',
          to: data.email,
          subject: 'Welcome to Pikafull! Your Account & Booking Details',
          html: `<p>Hello ${data.fullName},</p><p>Thank you for booking with Pikafull!</p><p>An account has been automatically created for you to track your booking.</p><p>Your login email is: <strong>${data.email}</strong><br/>Your generated password is: <strong>${generatedPassword}</strong></p><p>Please log in and change your password as soon as possible.</p>`
        })
      }
    } catch (emailErr) {
      console.error("[Resend] Failed to send welcome email:", emailErr)
    }
  }

  // 2. Get or create customer profile id using admin client (bypassing RLS)
  let customerId: string
  
  if (data.customerId) {
    // Admin/Staff booking for a specific customer
    const { data: profile } = await admin.from("profiles").select("role").eq("id", activeUserId).single()
    // @ts-expect-error Typescript infers profile as never if DB types aren't fully generated
    if (profile?.role === "owner" || profile?.role === "staff" || profile?.role === "admin") {
      customerId = data.customerId
    } else {
      return { error: "You are not authorized to create bookings for other customers." }
    }
  } else {
    // Ensure profile row exists & update phone
    await admin.from("profiles").upsert({
      id: activeUserId,
      email: data.email || user?.email,
      full_name: data.fullName || user?.user_metadata?.full_name || "",
      phone: data.phone || null,
      role: "customer",
    } as any)

    const { data: existingCust } = await admin
      .from("customers")
      .select("id")
      .eq("profile_id", activeUserId)
      .maybeSingle()

    if (existingCust) {
      customerId = (existingCust as any).id
    } else {
      const { data: newCustomer, error: insertError } = await admin
        .from("customers")
        .insert({ profile_id: activeUserId } as any)
        .select("id")
        .single()

      if (insertError || !newCustomer) {
        console.error("Failed to create customer profile:", insertError);
        return { error: "Failed to create customer profile: " + (insertError?.message || "Unknown error") }
      }
      customerId = (newCustomer as any).id
    }
  }

  try {
    if (data.saveToProfile !== false) {
      if (data.phone) {
        await admin.from("profiles").update({ phone: data.phone } as any).eq("id", activeUserId)
      }

      const { data: existingAddr } = await admin
        .from("addresses")
        .select("id")
        .eq("customer_id", customerId)
        .maybeSingle()

      if (existingAddr) {
        await admin.from("addresses").update({
          address_line_1: data.addressLine1,
          city: data.city,
        } as any).eq("id", (existingAddr as any).id)
      }
    }

    // 3. Create Address
    const { data: address, error: addressError } = await admin
      .from("addresses")
      .insert({
        customer_id: customerId,
        address_line_1: data.addressLine1,
        address_line_2: data.addressLine2 || "",
        city: data.city,
        postal_code: data.postalCode || "",
      } as any)
      .select()
      .single()

    if (addressError) throw new Error("Failed to save address: " + addressError.message)

    // 4. Check Timeslot Availability
    const scheduledDateStr = new Date(data.scheduledDate).toISOString().split('T')[0]
    const unavailableSlots = await getUnavailableTimeslots(scheduledDateStr)
    if (unavailableSlots.includes(data.scheduledTime)) {
      return { error: "The selected timeslot is no longer available because all employees are busy at that time. Please choose another timeslot." }
    }

    // 5. Create Booking
    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .insert({
        customer_id: customerId,
        service_id: data.serviceId,
        address_id: (address as any).id,
        property_type: data.propertyType,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        scheduled_date: scheduledDateStr,
        scheduled_time: data.scheduledTime,
        base_price: 100,
        extras_price: 0,
        total_price: 100,
        customer_notes: data.notes || "",
        status: "pending"
      } as any)
      .select()
      .single()

    if (bookingError) throw new Error("Failed to create booking: " + bookingError.message)

    // 6. Create Booking Extras
    if (data.extras && data.extras.length > 0) {
      const extrasToInsert = data.extras.map(extraId => ({
        booking_id: (booking as any).id,
        extra_service_id: extraId,
        quantity: 1,
        price: 0
      }))

      await admin.from("booking_extras").insert(extrasToInsert as any)
    }

    revalidatePath("/customer/dashboard")
    revalidatePath("/dashboard/bookings")
    return { success: true, bookingId: (booking as any).id }
  } catch (err: any) {
    console.error("Booking creation failed:", err)
    return { error: err.message || "An unexpected error occurred while placing your booking." }
  }
}

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0
  const parts = timeStr.split(":")
  const hours = parseInt(parts[0], 10) || 0
  const minutes = parseInt(parts[1], 10) || 0
  return hours * 60 + minutes
}

function hasTimeOverlap(
  timeA: string,
  durationA: number,
  timeB: string,
  durationB: number
): boolean {
  const startA = parseTimeToMinutes(timeA)
  const endA = startA + (durationA || 120)
  const startB = parseTimeToMinutes(timeB)
  const endB = startB + (durationB || 120)

  return startA < endB && startB < endA
}

export async function getUnavailableTimeslots(dateStr: string): Promise<string[]> {
  if (!dateStr) return []

  const admin = createAdminClient()
  const formattedDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr

  // 1. Fetch available/active employees
  const { data: employees, error: empErr } = await admin
    .from("employees")
    .select("id, is_available, profiles!inner(is_active)")

  if (empErr) {
    console.error("Failed to fetch employees for timeslot availability:", empErr)
    return []
  }

  // Filter employees who are available and have active profiles
  const activeEmployees = (employees || []).filter((e: any) => {
    const isAvail = e.is_available !== false
    const isActive = e.profiles?.is_active !== false
    return isAvail && isActive
  })

  const totalEmployeesCount = activeEmployees.length
  const activeEmployeeIds = new Set(activeEmployees.map((e: any) => e.id))

  const standardTimeslots = ["08:00", "10:00", "12:00", "14:00", "16:00"]

  // If there are 0 active employees, all timeslots are unavailable
  if (totalEmployeesCount === 0) {
    return standardTimeslots
  }

  // 2. Fetch non-cancelled bookings for the specified date
  const { data: bookings, error: bookErr } = await admin
    .from("bookings")
    .select("id, employee_id, scheduled_time, estimated_duration, status")
    .eq("scheduled_date", formattedDate)
    .neq("status", "cancelled")

  if (bookErr || !bookings) {
    if (bookErr) console.error("Failed to fetch bookings for availability:", bookErr)
    return []
  }

  const unavailable: string[] = []

  for (const slot of standardTimeslots) {
    const slotDuration = 120
    const assignedBusy = new Set<string>()
    let unassignedCount = 0

    for (const b of (bookings as any[])) {
      if (!b.scheduled_time) continue
      const bDuration = b.estimated_duration || 120

      if (hasTimeOverlap(slot, slotDuration, b.scheduled_time, bDuration)) {
        if (b.employee_id && activeEmployeeIds.has(b.employee_id)) {
          assignedBusy.add(b.employee_id)
        } else {
          unassignedCount++
        }
      }
    }

    const occupiedCount = assignedBusy.size + unassignedCount
    if (occupiedCount >= totalEmployeesCount) {
      unavailable.push(slot)
    }
  }

  return unavailable
}

export async function assignEmployeeToBooking(bookingId: string, employeeId: string | null) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Authentication required" }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  const role = (profile as any)?.role
  if (role !== "owner" && role !== "staff" && role !== "admin") {
    return { error: "Not authorized to assign employees" }
  }

  const { data: currentBooking, error: fetchErr } = await supabase
    .from("bookings")
    .select("status, employee_id, scheduled_date, scheduled_time, estimated_duration")
    .eq("id", bookingId)
    .single()

  if (fetchErr || !currentBooking) {
    return { error: "Booking not found" }
  }

  // Check for time conflicts if an employee is being assigned
  if (employeeId) {
    const { data: existingBookings, error: conflictErr } = await supabase
      .from("bookings")
      .select("id, scheduled_date, scheduled_time, estimated_duration, status")
      .eq("employee_id", employeeId)
      .eq("scheduled_date", (currentBooking as any).scheduled_date)
      .neq("id", bookingId)
      .neq("status", "cancelled")

    if (conflictErr) {
      return { error: "Failed to check employee schedule availability" }
    }

    if (existingBookings && existingBookings.length > 0) {
      const targetTime = (currentBooking as any).scheduled_time
      const targetDuration = (currentBooking as any).estimated_duration || 120

      for (const eb of existingBookings) {
        const ebTime = (eb as any).scheduled_time
        const ebDuration = (eb as any).estimated_duration || 120

        if (hasTimeOverlap(targetTime, targetDuration, ebTime, ebDuration)) {
          return {
            error: `Employee is already assigned to another booking on ${(currentBooking as any).scheduled_date} at ${ebTime?.slice(0, 5)}.`
          }
        }
      }
    }
  }

  const curStatus = (currentBooking as any).status
  let newStatus = curStatus
  if (employeeId && curStatus === "pending") {
    newStatus = "assigned"
  } else if (!employeeId && curStatus === "assigned") {
    newStatus = "pending"
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      employee_id: employeeId || null,
      status: newStatus,
    } as any)
    .eq("id", bookingId)

  if (updateError) {
    return { error: updateError.message }
  }

  try {
    await supabase.from("booking_history").insert({
      booking_id: bookingId,
      old_status: curStatus,
      new_status: newStatus,
      changed_by: user.id,
      notes: employeeId ? `Assigned employee ${employeeId}` : "Unassigned employee",
    } as any)
  } catch (err) {
    console.error("Failed to write booking history:", err)
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/bookings")
  revalidatePath(`/dashboard/bookings/${bookingId}`)

  return { success: true, status: newStatus }
}


