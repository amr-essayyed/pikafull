export interface WhatsAppNotificationPayload {
  toPhone: string
  customerName: string
  bookingId: string
  bookingNumber?: string
  status: "pending" | "confirmed" | "assigned" | "on_the_way" | "in_progress" | "completed" | "cancelled" | "reminder_24h" | "review_request" | string
  serviceTitle?: string
  scheduledDate?: string
  scheduledTime?: string
  address?: string
  employeeName?: string
  reviewUrl?: string
}

/**
 * Clean and format phone number for WhatsApp wa.me links and API.
 * Strips non-digit characters except leading plus, and ensures valid international format without leading zeros.
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return ""
  let cleaned = phone.replace(/[^\d+]/g, "")
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1)
  }
  // Strip leading zero if present without country code
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.replace(/^0+/, "")
  }
  return cleaned
}

/**
 * Constructs a friendly WhatsApp message body in Arabic based on booking status.
 */
export function formatBookingWhatsAppMessage(payload: WhatsAppNotificationPayload): string {
  const name = payload.customerName || "عميلنا العزيز"
  const ref = payload.bookingNumber ? `#${payload.bookingNumber}` : `#${payload.bookingId.slice(0, 8)}`
  const service = payload.serviceTitle || "خدمة التنظيف"
  const date = payload.scheduledDate || ""
  const time = payload.scheduledTime ? payload.scheduledTime.slice(0, 5) : ""
  const location = payload.address ? `\n📍 *العنوان:* ${payload.address}` : ""
  const cleaner = payload.employeeName ? `\n👤 *المختص:* ${payload.employeeName}` : ""

  switch (payload.status) {
    case "pending":
      return `أهلاً ${name}! 👋\n\nتم استلام طلب الحجز الخاص بك ${ref} لـ *${service}* بنجاح.\n\n📅 *التاريخ:* ${date}\n⏰ *الوقت:* ${time}${location}\n\nطلبك حالياً قيد المراجعة، وسنوافيك بالتأكيد فوراً. شكراً لاختيارك بيكافول! 🧹✨`

    case "confirmed":
      return `أهلاً ${name}! 👋\n\nتم *تأكيد* حجزك ${ref} لـ *${service}* بنجاح!\n\n📅 *التاريخ:* ${date}\n⏰ *الوقت:* ${time}${location}${cleaner}\n\nنتطلع لخدمتك. شكراً لاختيارك بيكافول! 🧹✨`

    case "assigned":
      return `أهلاً ${name}! 👋\n\nخبر سار! تم تعيين المختص المسؤول عن حجزك ${ref} لـ *${service}*.\n\n👤 *المختص المسؤول:* ${payload.employeeName || "فريق التنظيف"}\n📅 *التاريخ:* ${date}\n⏰ *الوقت:* ${time}${location}\n\nشكراً لاختيارك بيكافول! 🧹✨`

    case "on_the_way":
      return `أهلاً ${name}! 👋\n\n🚗 المختص *${payload.employeeName || "المسؤول"}* في الطريق إليك الآن لإنجاز حجزك ${ref} لـ *${service}*.\n${location}\n\nيرجى التكرم بالاستعداد لاستقباله. شكراً لك! 🧹✨`

    case "in_progress":
      return `أهلاً ${name}! 👋\n\n✨ بدأ المختص *${payload.employeeName || "المسؤول"}* الآن تقديم خدمة *${service}* لحجزك ${ref}.\n\nنتمنى لك تجربة رائعة مع بيكافول! 🧹✨`

    case "completed":
      return `أهلاً ${name}! 👋\n\n🎉 تم بحمد الله إتمام خدمة *${service}* لحجزك ${ref} بنجاح!\n\nيمكنك الاطلاع على صور العمل والفاتورة عبر حسابك.\nنتمنى أن تكون الخدمة قد حازت على رضاك التام! 🧹✨`

    case "cancelled":
      return `أهلاً ${name}! 👋\n\nتم إلغاء حجزك ${ref} لـ *${service}*.\nإذا كان لديك أي استفسار أو ترغب في إعادة الجدولة، يرجى التواصل معنا.\n\nشكراً لك! 🧹✨`

    case "reminder_24h":
      return `أهلاً ${name}! 👋\n\n⏰ تذكير: موعد خدمتك *${service}* (حجز ${ref}) غداً في تمام الساعة ${time}.\n${cleaner}${location}\n\nيرجى التأكد من جهوزية الموقع. يسعدنا دائماً خدمتك! 🧹✨`

    case "review_request":
      const reviewUrlStr = payload.reviewUrl ? `\n🔗 *رابط التقييم:* ${payload.reviewUrl}` : ""
      return `أهلاً ${name}! 👋\n\nرأيك يهمنا جداً! ⭐ كيف كانت تجربتك مع خدمة *${service}* المستلمة اليوم؟${cleaner}${reviewUrlStr}\n\nيسعدنا تقييمكم لمساعدتنا في تقديم أفضل خدمة دائماً. شكراً لثقتكم بيكافول! 🧹✨`

    default:
      return `أهلاً ${name}! 👋\n\nتحديث بشأن حجزك ${ref} لـ *${service}*:\nحالة الحجز الآن هي *${payload.status}*.\n📅 *التاريخ:* ${date}\n⏰ *الوقت:* ${time}${location}\n\nشكراً لاختيارك بيكافول! 🧹✨`
  }
}

/**
 * Generates direct wa.me link for browser / manual sending.
 */
export function getWhatsAppShareUrl(phone: string, message: string): string {
  const sanitizedPhone = sanitizePhoneNumber(phone)
  const encodedText = encodeURIComponent(message)
  return `https://wa.me/${sanitizedPhone}?text=${encodedText}`
}

/**
 * Server-side function to send a WhatsApp notification.
 * Dispatches via external API if credentials are provided in environment variables,
 * and logs to console.
 */
export async function sendWhatsAppNotification(payload: WhatsAppNotificationPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const sanitizedPhone = sanitizePhoneNumber(payload.toPhone)
  if (!sanitizedPhone) {
    console.warn("[WhatsApp Notification] No valid phone number provided for customer:", payload.customerName)
    return { success: false, error: "Invalid or missing phone number" }
  }

  const messageText = formatBookingWhatsAppMessage(payload)

  console.log(`\n========================================`)
  console.log(`📲 [WhatsApp Notification Triggered]`)
  console.log(`TO: ${payload.customerName} (${sanitizedPhone})`)
  console.log(`STATUS: ${payload.status}`)
  console.log(`MESSAGE:\n${messageText}`)
  console.log(`========================================\n`)

  const apiUrl = process.env.WHATSAPP_API_URL
  const apiToken = process.env.WHATSAPP_API_TOKEN

  if (apiUrl) {
    // Check if URL still contains unreplaced placeholder text
    if (apiUrl.includes("YOUR_INSTANCE_ID") || apiUrl.includes("YOUR_TOKEN")) {
      console.error("[WhatsApp Configuration Error] WHATSAPP_API_URL in .env.local contains unreplaced placeholder text 'YOUR_INSTANCE_ID'. Please replace it with your actual Green API idInstance.")
      return { success: false, error: "Invalid WHATSAPP_API_URL placeholder" }
    }

    try {
      let headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      let requestBody: any = {}

      // Green API Provider
      if (apiUrl.includes("green-api.com")) {
        // Green API expects NO Authorization header and uses chatId parameter format
        requestBody = {
          chatId: `${sanitizedPhone}@c.us`,
          message: messageText,
        }
      }
      // UltraMsg Provider
      else if (apiUrl.includes("ultramsg.com")) {
        requestBody = {
          token: apiToken,
          to: sanitizedPhone,
          body: messageText,
        }
      }
      // Whapi / Meta Cloud / Standard REST API
      else {
        if (apiToken) {
          headers["Authorization"] = `Bearer ${apiToken}`
        }
        requestBody = {
          to: sanitizedPhone,
          chatId: `${sanitizedPhone}@c.us`,
          body: messageText,
          message: messageText,
        }
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errText = await response.text()
        console.error("[WhatsApp API Error]:", response.status, errText)
        return { success: false, error: `API response ${response.status}: ${errText}` }
      }

      const resData = await response.json().catch(() => ({}))
      console.log("✅ [WhatsApp Notification Success] Sent message successfully via API!")
      return { success: true, messageId: resData.idMessage || resData.id || resData.messageId }
    } catch (err: any) {
      console.error("[WhatsApp API Fetch Exception]:", err)
      return { success: false, error: err?.message || "Failed to contact WhatsApp API gateway" }
    }
  }

  return { success: true, messageId: "logged-only" }
}
