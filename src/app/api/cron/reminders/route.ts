import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendWhatsAppNotification } from "@/lib/whatsapp"
import { sendInAppNotification, getArabicInAppNotificationContent } from "@/lib/notifications"

export async function GET(request: Request) {
  try {
    const admin = createAdminClient()

    // 1. Calculate Tomorrow's Date (YYYY-MM-DD) for 24-hour advance reminders
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split("T")[0]

    // 2. Fetch active bookings scheduled for tomorrow
    const { data: upcomingBookings, error: fetchErr } = await admin
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
      .eq("scheduled_date", tomorrowStr)
      .in("status", ["confirmed", "assigned"])

    let remindersSent = 0

    if (!fetchErr && upcomingBookings && upcomingBookings.length > 0) {
      for (const booking of upcomingBookings as any[]) {
        const custUserId = booking.customers?.profile_id
        const customerPhone = booking.customers?.profiles?.phone
        const customerName = booking.customers?.profiles?.full_name
        const employeeName = booking.employees?.profiles?.full_name
        const serviceTitle = booking.services?.name
        const addrObj = booking.addresses
        const addressStr = addrObj ? `${addrObj.address_line_1 || ""}${addrObj.city ? `, ${addrObj.city}` : ""}` : undefined

        // In-App Notification
        if (custUserId) {
          const inApp = getArabicInAppNotificationContent("reminder_24h", booking.booking_number, serviceTitle, employeeName)
          await sendInAppNotification({
            userId: custUserId,
            title: inApp.title,
            message: inApp.message,
            type: "reminder",
            actionUrl: "/customer/dashboard",
          })
        }

        // WhatsApp Notification
        if (customerPhone) {
          await sendWhatsAppNotification({
            toPhone: customerPhone,
            customerName: customerName || "عميلنا العزيز",
            bookingId: booking.id,
            bookingNumber: booking.booking_number ? String(booking.booking_number) : undefined,
            status: "reminder_24h",
            serviceTitle,
            scheduledDate: booking.scheduled_date,
            scheduledTime: booking.scheduled_time,
            address: addressStr,
            employeeName,
          })
          remindersSent++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Automated Arabic reminders dispatched successfully. Sent ${remindersSent} 24-hour reminders for ${tomorrowStr}.`,
      dateProcessed: tomorrowStr,
      remindersSent,
    })
  } catch (err: any) {
    console.error("[Cron Reminders API Error]:", err)
    return NextResponse.json({ success: false, error: err?.message || "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return GET(request)
}
