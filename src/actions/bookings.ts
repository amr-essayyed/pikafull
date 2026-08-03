"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { bookingSchema, type BookingFormData } from "@/validators/booking"
import { Resend } from "resend"
import { sendWhatsAppNotification } from "@/lib/whatsapp"
import { sendInAppNotification, getArabicInAppNotificationContent } from "@/lib/notifications"
import { getArabicCityName } from "@/lib/cities"

export async function createBooking(data: BookingFormData) {
  const result = bookingSchema.safeParse(data)

  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()

  // 1. Resolve customer ID and target user profile
  let targetUserId: string | null = null
  let customerId: string | null = null

  // Check if current user has admin/staff privileges
  let isAdminOrStaff = false
  if (user) {
    const { data: curProfile } = await admin.from("profiles").select("role").eq("id", user.id).single()
    const role = (curProfile as any)?.role
    isAdminOrStaff = role === "owner" || role === "staff" || role === "admin"
  }

  // Case A: Customer ID supplied (Admin selecting customer OR Customer booking for themselves)
  if (data.customerId) {
    const { data: custObj } = await admin.from("customers").select("profile_id").eq("id", data.customerId).maybeSingle()
    if (custObj) {
      if (!isAdminOrStaff && user?.id !== (custObj as any).profile_id) {
        return { error: "You are not authorized to create bookings for other customers." }
      }
      customerId = data.customerId
      targetUserId = (custObj as any).profile_id
    } else {
      if (!isAdminOrStaff) {
        return { error: "You are not authorized to create bookings for other customers." }
      }
    }
  } 
  // Case B: Admin/Staff creating a booking for a new customer OR Guest booking on public site
  else if (isAdminOrStaff || !user) {
    if (!data.fullName || !data.email) {
      return { error: "Please enter customer full name and email address to complete booking." }
    }

    const cleanedEmail = data.email.toLowerCase().trim()

    // Check if user profile already exists with this email
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", cleanedEmail)
      .maybeSingle()

    if (existingProfile) {
      targetUserId = (existingProfile as any).id

      if (data.phone && targetUserId) {
        await (admin.from("profiles") as any).update({ phone: data.phone }).eq("id", targetUserId)
      }

      const { data: existingCust } = await (admin.from("customers") as any)
        .select("id")
        .eq("profile_id", targetUserId)
        .maybeSingle()

      if (existingCust) {
        customerId = (existingCust as any).id
      } else {
        const { data: newCust, error: custErr } = await admin
          .from("customers")
          .insert({ profile_id: targetUserId } as any)
          .select("id")
          .single()

        if (custErr || !newCust) {
          return { error: "Failed to create customer profile: " + (custErr?.message || "") }
        }
        customerId = (newCust as any).id
      }
    } else {
      // Create new auth user via Admin API
      const generatedPassword = crypto.randomUUID().replace(/-/g, '') + '!A1'

      const { data: userData, error: userError } = await admin.auth.admin.createUser({
        email: cleanedEmail,
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
          return { error: "An account with this email already exists. Please select them from existing accounts." }
        }
        return { error: userError?.message || "Failed to create customer account." }
      }

      targetUserId = userData.user.id

      await admin.from("profiles").upsert({
        id: targetUserId,
        email: cleanedEmail,
        full_name: data.fullName,
        phone: data.phone || null,
        role: "customer",
      } as any)

      const { data: newCustomer, error: insertError } = await admin
        .from("customers")
        .insert({ profile_id: targetUserId } as any)
        .select("id")
        .single()

      if (insertError || !newCustomer) {
        return { error: "Failed to create customer profile: " + (insertError?.message || "") }
      }
      customerId = (newCustomer as any).id

      // Only auto sign-in if guest booking on website (not when admin creates in dashboard)
      if (!user) {
        try {
          await supabase.auth.signInWithPassword({
            email: cleanedEmail,
            password: generatedPassword,
          })
        } catch (authErr) {
          console.warn("Auto sign-in warning:", authErr)
        }
      }

      try {
        const apiKey = process.env.RESEND_API_KEY
        if (apiKey) {
          const resend = new Resend(apiKey)
          await resend.emails.send({
            from: 'Pikafull <noreply@4teq.store>',
            to: cleanedEmail,
            subject: 'مرحباً بك في بيكافول! تفاصيل حسابك وحجزك',
            html: `<div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; line-height: 1.6;">
              <h2>مرحباً ${data.fullName}! 👋</h2>
              <p>شكراً لطلبك الحجز مع بيكافول (Pikafull)!</p>
              <p>تم إنشاء حساب جديد لك تلقائياً لمتابعة حالة حجزك ورصيدك.</p>
              <p><strong>بيانات الدخول:</strong><br/>
              البريد الإلكتروني: <strong>${cleanedEmail}</strong><br/>
              كلمة المرور المؤقتة: <strong>${generatedPassword}</strong></p>
              <p>يرجى تسجيل الدخول وتغيير كلمة المرور الخاصة بك في أقرب وقت.</p>
            </div>`
          })
        }
      } catch (emailErr) {
        console.error("[Resend] Failed to send welcome email:", emailErr)
      }
    }
  } 
  // Case C: Authenticated Customer booking for themselves
  else {
    targetUserId = user.id

    await admin.from("profiles").upsert({
      id: targetUserId,
      email: data.email || user.email,
      full_name: data.fullName || user.user_metadata?.full_name || "",
      phone: data.phone || null,
      role: "customer",
    } as any)

    const { data: existingCust } = await admin
      .from("customers")
      .select("id")
      .eq("profile_id", targetUserId)
      .maybeSingle()

    if (existingCust) {
      customerId = (existingCust as any).id
    } else {
      const { data: newCustomer, error: insertError } = await admin
        .from("customers")
        .insert({ profile_id: targetUserId } as any)
        .select("id")
        .single()

      if (insertError || !newCustomer) {
        return { error: "Failed to create customer profile: " + (insertError?.message || "") }
      }
      customerId = (newCustomer as any).id
    }
  }

  if (!customerId) {
    return { error: "Could not resolve customer account for booking." }
  }

  try {
    if (data.saveToProfile !== false) {
      if (data.phone && targetUserId) {
        await (admin.from("profiles") as any).update({ phone: data.phone }).eq("id", targetUserId)
      }

      const { data: existingAddr } = await (admin.from("addresses") as any)
        .select("id")
        .eq("customer_id", customerId)
        .maybeSingle()

      if (existingAddr) {
        await (admin.from("addresses") as any).update({
          address_line_1: data.addressLine1,
          city: data.city,
        }).eq("id", (existingAddr as any).id)
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

    // Trigger WhatsApp & In-App pending notifications
    try {
      await triggerBookingWhatsAppNotification((booking as any).id, "pending", data.phone, data.fullName)
    } catch (notifErr) {
      console.error("Failed to send booking pending notifications:", notifErr)
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

  const { error: updateError } = await (supabase.from("bookings") as any)
    .update({
      employee_id: employeeId || null,
      status: newStatus,
    })
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

  // Trigger WhatsApp notification if an employee is assigned or status transitions to assigned/confirmed
  if (employeeId || newStatus === "assigned" || newStatus === "confirmed") {
    try {
      await triggerBookingWhatsAppNotification(bookingId, newStatus)
    } catch (waErr) {
      console.error("Failed to send WhatsApp notification on assignment:", waErr)
    }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/bookings")
  revalidatePath(`/dashboard/bookings/${bookingId}`)

  return { success: true, status: newStatus }
}

export async function updateBookingStatus(bookingId: string, newStatus: string) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Authentication required" }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  const role = (profile as any)?.role
  if (role !== "owner" && role !== "staff" && role !== "admin") {
    return { error: "Not authorized to update booking status" }
  }

  const { data: currentBooking, error: fetchErr } = await admin
    .from("bookings")
    .select("status")
    .eq("id", bookingId)
    .single()

  if (fetchErr || !currentBooking) {
    return { error: "Booking not found" }
  }

  const oldStatus = (currentBooking as any).status

  const { error: updateError } = await (admin.from("bookings") as any)
    .update({ status: newStatus })
    .eq("id", bookingId)

  if (updateError) {
    return { error: updateError.message }
  }

  try {
    await (admin.from("booking_history") as any).insert({
      booking_id: bookingId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: user.id,
      notes: `Status updated to ${newStatus}`,
    })
  } catch (err) {
    console.error("Failed to write booking history:", err)
  }

  try {
    await triggerBookingWhatsAppNotification(bookingId, newStatus)
  } catch (waErr) {
    console.error("Failed to send WhatsApp notification on status update:", waErr)
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/bookings")
  revalidatePath(`/dashboard/bookings/${bookingId}`)

  return { success: true, status: newStatus }
}

async function triggerBookingWhatsAppNotification(
  bookingId: string,
  status: string,
  fallbackPhone?: string,
  fallbackName?: string
) {
  const admin = createAdminClient()

  const { data: booking, error } = await admin
    .from("bookings")
    .select(`
      id,
      booking_number,
      scheduled_date,
      scheduled_time,
      status,
      customers (
        profile_id,
        profiles (
          full_name,
          phone
        )
      ),
      employees (
        profiles (
          full_name
        )
      ),
      services (
        name
      ),
      addresses (
        address_line_1,
        city
      )
    `)
    .eq("id", bookingId)
    .single()

  if (error || !booking) {
    console.warn("[WhatsApp Notification] Could not fetch booking details for ID:", bookingId)
    return
  }

  const custProfile = (booking as any)?.customers?.profiles
  const custUserId = (booking as any)?.customers?.profile_id
  const customerPhone = custProfile?.phone || fallbackPhone
  const customerName = custProfile?.full_name || fallbackName

  const empProfile = (booking as any)?.employees?.profiles
  const employeeName = empProfile?.full_name
  const serviceObj = (booking as any)?.services
  const serviceTitle = serviceObj?.name
  const addrObj = (booking as any)?.addresses
  const addressStr = addrObj ? `${addrObj.address_line_1 || ""}${addrObj.city ? `، ${getArabicCityName(addrObj.city)}` : ""}` : undefined

  // 1. Send In-App Notification if customer profile exists
  if (custUserId) {
    try {
      const inAppContent = getArabicInAppNotificationContent(
        status,
        (booking as any).booking_number ? String((booking as any).booking_number) : undefined,
        serviceTitle,
        employeeName
      )
      await sendInAppNotification({
        userId: custUserId,
        title: inAppContent.title,
        message: inAppContent.message,
        type: "booking",
        actionUrl: "/customer/dashboard",
      })
    } catch (inAppErr) {
      console.error("Failed to create in-app notification:", inAppErr)
    }
  }

  // 2. Send WhatsApp Notification if customer phone exists
  if (!customerPhone) {
    console.log(`[WhatsApp Notification] Customer has no phone number attached for booking ${bookingId}`)
    return
  }

  await sendWhatsAppNotification({
    toPhone: customerPhone,
    customerName: customerName || "Customer",
    bookingId: (booking as any).id,
    bookingNumber: (booking as any).booking_number ? String((booking as any).booking_number) : undefined,
    status: status,
    serviceTitle,
    scheduledDate: (booking as any).scheduled_date,
    scheduledTime: (booking as any).scheduled_time,
    address: addressStr,
    employeeName,
  })
}


export async function cancelBookingByCustomer(bookingId: string, reason?: string) {
  const supabase = await createClient()
  const admin = createAdminClient()

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Authentication required." }
  }

  // 2. Fetch customer profile for user
  const { data: customer } = await admin
    .from("customers")
    .select("id")
    .eq("profile_id", user.id)
    .single()

  if (!customer) {
    return { error: "Customer profile not found." }
  }

  // 3. Fetch booking
  const { data: booking, error: fetchErr } = await admin
    .from("bookings")
    .select("id, status, scheduled_date, scheduled_time, customer_id")
    .eq("id", bookingId)
    .single()

  if (fetchErr || !booking) {
    return { error: "Booking not found." }
  }

  // Verify ownership
  if ((booking as any).customer_id !== (customer as any).id) {
    return { error: "You are not authorized to cancel this booking." }
  }

  const curStatus = (booking as any).status
  if (curStatus === "cancelled") {
    return { error: "Booking is already cancelled." }
  }

  const cancellableStatuses = ["pending", "confirmed", "assigned"]
  if (!cancellableStatuses.includes(curStatus)) {
    return { error: "This booking cannot be cancelled in its current state." }
  }

  // 4. Check cancellation lead time rules from company_settings
  const { data: companySettings } = await admin
    .from("company_settings")
    .select("cancellation_hours")
    .single()

  const cancellationHours = (companySettings as any)?.cancellation_hours ?? 48

  if ((booking as any).scheduled_date && (booking as any).scheduled_time) {
    const scheduledDateTime = new Date(`${(booking as any).scheduled_date}T${(booking as any).scheduled_time}`)
    const now = new Date()
    const diffInMs = scheduledDateTime.getTime() - now.getTime()
    const diffInHours = diffInMs / (1000 * 60 * 60)

    if (diffInHours < cancellationHours) {
      return {
        error: `Bookings cannot be cancelled online within ${cancellationHours} hours of the scheduled time. Please contact support.`,
        cancellationHours,
      }
    }
  }

  // 5. Perform update using admin client
  const { error: updateErr } = await (admin.from("bookings") as any)
    .update({
      status: "cancelled",
    })
    .eq("id", bookingId)

  if (updateErr) {
    return { error: updateErr.message || "Failed to cancel booking." }
  }

  // 6. Record history
  try {
    await (admin.from("booking_history") as any).insert({
      booking_id: bookingId,
      old_status: curStatus,
      new_status: "cancelled",
      changed_by: user.id,
      notes: reason ? `Cancelled by customer: ${reason}` : "Cancelled by customer",
    })
  } catch (histErr) {
    console.error("Failed to write booking history:", histErr)
  }

  try {
    await triggerBookingWhatsAppNotification(bookingId, "cancelled")
  } catch (waErr) {
    console.error("Failed to send cancellation notification:", waErr)
  }

  revalidatePath("/customer/dashboard")
  revalidatePath("/dashboard/bookings")
  revalidatePath(`/dashboard/bookings/${bookingId}`)

  return { success: true }
}



