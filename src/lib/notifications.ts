import { createAdminClient } from "@/lib/supabase/admin"

export interface InAppNotificationParams {
  userId: string
  title: string
  message: string
  type?: "booking" | "system" | "reminder" | "payment"
  actionUrl?: string
}

/**
 * Server-side helper to create an in-app notification record in Supabase.
 */
export async function sendInAppNotification(params: InAppNotificationParams): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient()
    const { error } = await admin.from("notifications").insert({
      user_id: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || "booking",
      action_url: params.actionUrl || "/customer/dashboard",
      is_read: false,
    } as any)

    if (error) {
      console.error("[In-App Notification Error]:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error("[In-App Notification Exception]:", err)
    return { success: false, error: err?.message || "Failed to create in-app notification" }
  }
}

/**
 * Maps booking status to Arabic title and message for in-app notification.
 */
export function getArabicInAppNotificationContent(
  status: string,
  bookingNumber?: string,
  serviceTitle?: string,
  employeeName?: string
): { title: string; message: string } {
  const ref = bookingNumber ? `#${bookingNumber}` : "الخاص بك"
  const service = serviceTitle || "خدمة التنظيف"

  switch (status) {
    case "pending":
      return {
        title: "طلب حجز جديد 📝",
        message: `تم استلام طلب الحجز ${ref} لـ ${service} بنجاح، وهو قيد المراجعة الآن.`,
      }
    case "confirmed":
      return {
        title: "تم تأكيد الحجز ✅",
        message: `تم تأكيد حجزك ${ref} لـ ${service} بنجاح.`,
      }
    case "assigned":
      return {
        title: "تم تعيين مختص الخدمة 👤",
        message: `تم تكليف ${employeeName || "المختص"} بإنجاز حجزك ${ref} لـ ${service}.`,
      }
    case "on_the_way":
      return {
        title: "المختص في الطريق 🚗",
        message: `المختص ${employeeName || "المسؤول"} في الطريق إليك الآن لموقع الحجز ${ref}.`,
      }
    case "in_progress":
      return {
        title: "بدأ تقديم الخدمة ✨",
        message: `بدأ تقديم خدمة ${service} الآن للحجز ${ref}.`,
      }
    case "completed":
      return {
        title: "تم إتمام الخدمة 🎉",
        message: `تم الانتهاء من خدمة ${service} للحجز ${ref} بنجاح! يمكنك الآن مشاهدة الصور والفاتورة.`,
      }
    case "cancelled":
      return {
        title: "تم إلغاء الحجز ❌",
        message: `تم إلغاء الحجز ${ref} لـ ${service}.`,
      }
    case "reminder_24h":
      return {
        title: "تذكير بموعد الحجز غداً ⏰",
        message: `نود تذكيرك بموعد خدمة ${service} (حجز ${ref}) غداً.`,
      }
    default:
      return {
        title: "تحديث بشأن الحجز ℹ️",
        message: `تم تحديث حالة الحجز ${ref} لـ ${service} إلى ${status}.`,
      }
  }
}
