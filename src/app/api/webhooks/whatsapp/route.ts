import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendWhatsAppTextMessage, sanitizePhoneNumber } from "@/lib/whatsapp"
import { getWhatsAppSession, saveWhatsAppSession, clearWhatsAppSession } from "@/lib/whatsapp-sessions"
import { createBooking } from "@/actions/bookings"
import { revalidatePath } from "next/cache"

/**
 * Webhook Verification Handler (for Meta / Green API checks)
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const challenge = url.searchParams.get("hub.challenge")
  if (challenge) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ status: "online", system: "Pikafull WhatsApp Webhook Engine" })
}

/**
 * Parses incoming webhook body across Green API, UltraMsg, and Meta Cloud API formats.
 */
function parseIncomingWebhook(body: any): { senderPhone: string; senderName: string; text: string } | null {
  if (!body) return null

  let senderPhone = ""
  let senderName = ""
  let text = ""

  // 1. Green API Provider Format
  if (body.typeWebhook === "incomingMessageReceived" || body.messageData) {
    const senderData = body.senderData || {}
    senderPhone = senderData.chatId || senderData.sender || ""
    senderName = senderData.senderName || ""

    const msgData = body.messageData || {}
    text =
      msgData.textMessageData?.textMessage ||
      msgData.extendedTextMessageData?.text ||
      msgData.buttonsResponseMessageData?.selectedButtonId ||
      msgData.listResponseMessageData?.title ||
      ""
  }
  // 2. UltraMsg Provider Format
  else if (body.data && body.event_type === "message_received") {
    senderPhone = body.data.from || body.data.chatId || ""
    senderName = body.data.pushname || ""
    text = body.data.body || ""
  }
  // 3. Meta Cloud API Format
  else if (body.entry && body.entry[0]?.changes?.[0]?.value?.messages?.[0]) {
    const msg = body.entry[0].changes[0].value.messages[0]
    const contact = body.entry[0].changes[0].value.contacts?.[0]
    senderPhone = msg.from || ""
    senderName = contact?.profile?.name || ""
    text = msg.text?.body || msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || ""
  }
  // 4. Standard / Generic Payload
  else {
    senderPhone = body.from || body.chatId || body.phone || ""
    senderName = body.name || body.pushName || ""
    text = body.text || body.body || body.message || ""
  }

  const cleanPhone = sanitizePhoneNumber(senderPhone)
  if (!cleanPhone || !text) return null

  return {
    senderPhone: cleanPhone,
    senderName: senderName.trim(),
    text: text.trim(),
  }
}

/**
 * Main Webhook POST Handler for WhatsApp Conversational Form
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null)
    if (!rawBody) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const parsed = parseIncomingWebhook(rawBody)
    if (!parsed) {
      // Return 200 OK so gateway provider doesn't retry non-text / system notifications
      return NextResponse.json({ status: "ignored_non_text_event" }, { status: 200 })
    }

    const { senderPhone, senderName, text } = parsed
    const lowerText = text.toLowerCase()

    // Global Command: Cancel or Reset Session
    if (lowerText === "0" || text === "إلغاء" || lowerText === "cancel" || lowerText === "reset" || text === "خروج") {
      await clearWhatsAppSession(senderPhone)
      await sendWhatsAppTextMessage(
        senderPhone,
        `تم إلغاء طلب الحجز الحالي بنجاح. 🧹\n\nيمكنك البدء من جديد في أي وقت بإرسال كلمة (*حجز*) أو (*مرحباً*).`
      )
      return NextResponse.json({ status: "session_reset" })
    }

    // Retrieve active conversation session
    const session = await getWhatsAppSession(senderPhone)
    const currentStep = session.step || "IDLE"

    // Process State Machine
    await processStateMachine({
      phone: senderPhone,
      senderName,
      userText: text,
      currentStep,
      formData: session.formData,
    })

    return NextResponse.json({ status: "success" })
  } catch (err: any) {
    console.error("[WhatsApp Webhook Error]:", err)
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
  }
}

/**
 * WhatsApp Form State Machine Engine
 */
async function processStateMachine(params: {
  phone: string
  senderName: string
  userText: string
  currentStep: string
  formData: Record<string, any>
}) {
  const { phone, senderName, userText, currentStep, formData } = params
  const admin = createAdminClient()

  // Force reset if user explicitly requests to restart flow
  let activeStep = currentStep
  if (userText === "حجز" || userText === "ابدأ" || userText.toLowerCase() === "start" || userText.toLowerCase() === "booking") {
    activeStep = "IDLE"
  }

  // ----------------------------------------------------
  // STEP: IDLE -> Start Booking Flow & Show Services List
  // ----------------------------------------------------
  if (activeStep === "IDLE") {
    // Fetch active services from DB
    const { data: services } = await (admin.from("services") as any)
      .select("id, name, base_price")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    const activeServices = services && services.length > 0 ? services : [
      { id: "fallback-1", name: "تنظيف منازل شامل", base_price: 150 },
      { id: "fallback-2", name: "تنظيف عميق للمجالس والكنب", base_price: 200 },
      { id: "fallback-3", name: "غسيل وتلميع الأرضيات", base_price: 180 },
    ]

    const serviceListText = activeServices
      .map((s: any, idx: number) => `${idx + 1}️⃣ *${s.name}* (${s.base_price} ر.س)`)
      .join("\n")

    // Save active services list mapping in session
    await saveWhatsAppSession(phone, "AWAITING_SERVICE", {
      availableServices: activeServices.map((s: any, idx: number) => ({
        index: idx + 1,
        id: s.id,
        name: s.name,
        price: s.base_price,
      })),
      fullName: formData.fullName || senderName || "",
    })

    const welcomeMsg = `أهلاً بك في بيكافول (Pikafull)! 👋🧹\nيسعدنا خدمتك. يرجى اختيار الخدمة المطلوبة عن طريق *كتابة رقم الخدمة*:\n\n${serviceListText}\n\n💡 _أرسل رقم (0) في أي وقت لإلغاء الطلب._`
    await sendWhatsAppTextMessage(phone, welcomeMsg)
    return
  }

  // ----------------------------------------------------
  // STEP: AWAITING_SERVICE -> Store Service & Ask Name
  // ----------------------------------------------------
  if (activeStep === "AWAITING_SERVICE") {
    const availableServices: any[] = formData.availableServices || []
    const chosenIndex = parseInt(userText.trim(), 10)

    let selectedService = availableServices.find((s) => s.index === chosenIndex)

    if (!selectedService) {
      // Check if user typed service title text directly
      selectedService = availableServices.find((s) => s.name.toLowerCase().includes(userText.toLowerCase()))
    }

    if (!selectedService) {
      await sendWhatsAppTextMessage(
        phone,
        `⚠️ خيار غير صحيح.\nيرجى كتابة *رقم الخدمة* من القائمة أعلاه (مثال: 1 أو 2):`
      )
      return
    }

    const defaultName = formData.fullName || senderName
    await saveWhatsAppSession(phone, "AWAITING_NAME", {
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
    })

    if (defaultName && defaultName.length > 2) {
      // If we already have sender's name from WhatsApp profile or memory
      await saveWhatsAppSession(phone, "AWAITING_CITY", { fullName: defaultName })
      await askCityStep(phone, defaultName, selectedService.name)
    } else {
      await sendWhatsAppTextMessage(
        phone,
        `ممتاز! تم اختيار: *${selectedService.name}* 🧹✨\n\nيرجى كتابة *اسمك الكامل* لتسجيل الحجز:`
      )
    }
    return
  }

  // ----------------------------------------------------
  // STEP: AWAITING_NAME -> Store Name & Ask City
  // ----------------------------------------------------
  if (activeStep === "AWAITING_NAME") {
    const nameInput = userText.trim()
    if (nameInput.length < 2) {
      await sendWhatsAppTextMessage(phone, `⚠️ يرجى كتابة اسم صحيح لتأكيد الحجز:`)
      return
    }

    await saveWhatsAppSession(phone, "AWAITING_CITY", { fullName: nameInput })
    await askCityStep(phone, nameInput, formData.serviceName)
    return
  }

  // ----------------------------------------------------
  // STEP: AWAITING_CITY -> Store City & Ask Address
  // ----------------------------------------------------
  if (activeStep === "AWAITING_CITY") {
    let chosenCity = userText.trim()
    if (userText === "1") chosenCity = "الرياض"
    else if (userText === "2") chosenCity = "جدة"
    else if (userText === "3") chosenCity = "القاهرة"
    else if (userText === "4") chosenCity = "الدمام"

    await saveWhatsAppSession(phone, "AWAITING_ADDRESS", { city: chosenCity })
    await sendWhatsAppTextMessage(
      phone,
      `📍 رائع! يرجى كتابة *تفاصيل العنوان* (الحي، الشارع، المعالم القريبة):`
    )
    return
  }

  // ----------------------------------------------------
  // STEP: AWAITING_ADDRESS -> Store Address & Ask Date/Time
  // ----------------------------------------------------
  if (activeStep === "AWAITING_ADDRESS") {
    const addressInput = userText.trim()
    if (addressInput.length < 3) {
      await sendWhatsAppTextMessage(phone, `⚠️ يرجى كتابة عنوان واضح وسليم:`)
      return
    }

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split("T")[0]

    const afterTomorrow = new Date()
    afterTomorrow.setDate(afterTomorrow.getDate() + 2)
    const afterTomorrowStr = afterTomorrow.toISOString().split("T")[0]

    await saveWhatsAppSession(phone, "AWAITING_DATETIME", {
      addressLine1: addressInput,
      presetDates: [
        { index: 1, date: tomorrowStr, time: "10:00", label: `غداً (${tomorrowStr}) - 10:00 صباحاً` },
        { index: 2, date: tomorrowStr, time: "14:00", label: `غداً (${tomorrowStr}) - 02:00 ظهراً` },
        { index: 3, date: tomorrowStr, time: "18:00", label: `غداً (${tomorrowStr}) - 06:00 مساءً` },
        { index: 4, date: afterTomorrowStr, time: "10:00", label: `بعد غد (${afterTomorrowStr}) - 10:00 صباحاً` },
      ],
    })

    const dateTimeMsg = `📅 اختر الموعد المناسب لخدمتك:\n\n1️⃣ غداً - 10:00 صباحاً\n2️⃣ غداً - 02:00 ظهراً\n3️⃣ غداً - 06:00 مساءً\n4️⃣ بعد غد - 10:00 صباحاً\n\n(أو اكتب التاريخ والوقت مباشرة، مثال: ${tomorrowStr} 14:00)`
    await sendWhatsAppTextMessage(phone, dateTimeMsg)
    return
  }

  // ----------------------------------------------------
  // STEP: AWAITING_DATETIME -> Store Date & Present Summary
  // ----------------------------------------------------
  if (activeStep === "AWAITING_DATETIME") {
    const presetDates: any[] = formData.presetDates || []
    const chosenIndex = parseInt(userText.trim(), 10)
    const matchedPreset = presetDates.find((p) => p.index === chosenIndex)

    let finalDateStr = ""
    let finalTimeStr = ""

    if (matchedPreset) {
      finalDateStr = matchedPreset.date
      finalTimeStr = matchedPreset.time
    } else {
      // User typed custom date/time string
      const now = new Date()
      now.setDate(now.getDate() + 1)
      finalDateStr = now.toISOString().split("T")[0]
      finalTimeStr = userText.match(/\d{1,2}:\d{2}/)?.[0] || "10:00"
    }

    const updatedFormData: Record<string, any> = {
      ...formData,
      scheduledDate: finalDateStr,
      scheduledTime: finalTimeStr,
    }

    await saveWhatsAppSession(phone, "AWAITING_CONFIRMATION", updatedFormData)

    const summaryCard =
      `📋 *ملخص طلب الحجز الخاص بك:*\n\n` +
      `👤 *الاسم:* ${updatedFormData.fullName}\n` +
      `📱 *الهاتف:* +${phone}\n` +
      `🧹 *الخدمة:* ${updatedFormData.serviceName}\n` +
      `📍 *المدينة والعنوان:* ${updatedFormData.city} - ${updatedFormData.addressLine1}\n` +
      `📅 *الموعد:* ${finalDateStr} (الساعة ${finalTimeStr})\n` +
      `💵 *طريقة الدفع:* نقداً عند الإتمام (Cash)\n\n` +
      `يرجى كتابة:\n` +
      `1️⃣ *لتأكيد الحجز والإرسال* ✅\n` +
      `2️⃣ *لإلغاء الطلب* ❌`

    await sendWhatsAppTextMessage(phone, summaryCard)
    return
  }

  // ----------------------------------------------------
  // STEP: AWAITING_CONFIRMATION -> Create Booking & Sync DB
  // ----------------------------------------------------
  if (activeStep === "AWAITING_CONFIRMATION") {
    if (userText === "1" || userText.includes("تأكيد") || userText.includes("نعم") || userText === "yes") {
      await sendWhatsAppTextMessage(phone, `⏳ جاري إرسال حجزك واعتماده بالنظام...`)

      const bookingPayload = {
        fullName: String(formData.fullName || "عميل واتساب"),
        phone: "+" + phone,
        email: `${phone}@whatsapp.placeholder`,
        serviceId: String(formData.serviceId),
        propertyType: "apartment" as const,
        bedrooms: 1,
        bathrooms: 1,
        extras: [],
        scheduledDate: new Date(formData.scheduledDate || Date.now()),
        scheduledTime: String(formData.scheduledTime || "10:00"),
        addressLine1: String(formData.addressLine1 || "عنوان عبر واتساب"),
        city: String(formData.city || "الرياض"),
        paymentMethod: "cash" as const,
        notes: "تم الإنشاء تلقائياً عبر نموذج واتساب التفاعلي",
        saveToProfile: true,
      }

      // Execute Server Action creation
      const res = await createBooking(bookingPayload)

      if (res.error) {
        console.error("[WhatsApp Form Submission Error]:", res.error)
        await sendWhatsAppTextMessage(
          phone,
          `⚠️ حدث خطأ أثناء إتمام الحجز: ${res.error}\nيرجى إعادة المحاولة بإرسال كلمة (حجز).`
        )
        await clearWhatsAppSession(phone)
        return
      }

      // Revalidate Dashboard paths
      revalidatePath("/dashboard")
      revalidatePath("/dashboard/bookings")
      revalidatePath("/admin")
      revalidatePath("/admin/bookings")

      await clearWhatsAppSession(phone)

      const successMessage =
        `🎉 *تم تأكيد واستلام حجزك بنجاح!* ✨\n\n` +
        `مرجع الحجز الخاص بك في النظام:\n` +
        `🆔 *#BK-WA-${phone.slice(-4)}*\n\n` +
        `📅 *الموعد:* ${formData.scheduledDate} الساعة ${formData.scheduledTime}\n` +
        `👤 *اسمك:* ${formData.fullName}\n\n` +
        `سيقوم الفريق بالتواصل معك وتأكيد التخصيص فوراً. شكراً لاختيارك بيكافول! 🧹`

      await sendWhatsAppTextMessage(phone, successMessage)
      return
    } else {
      await clearWhatsAppSession(phone)
      await sendWhatsAppTextMessage(
        phone,
        `تم إلغاء الطلب. يمكنك البدء مجدداً في أي وقت بإرسال كلمة (حجز). 🧹`
      )
      return
    }
  }

  // Fallback for unhandled inputs in default state
  await sendWhatsAppTextMessage(
    phone,
    `أهلاً بك في بيكافول! 🧹👋\nللبدء وحجز خدمة جديدة، يرجى كتابة كلمة (*حجز*).`
  )
}

/**
 * Helper to display City Selection Prompt
 */
async function askCityStep(phone: string, name: string, serviceName: string) {
  const msg =
    `أهلاً بك يا *${name}*! 👋\n` +
    `نقدم خدمة *${serviceName}* في عدة مدن.\n\n` +
    `اختر مدينتك برقم الخيار:\n` +
    `1️⃣ الرياض\n` +
    `2️⃣ جدة\n` +
    `3️⃣ القاهرة\n` +
    `4️⃣ الدمام\n\n` +
    `(أو اكتب اسم مدينتك مباشرة)`
  await sendWhatsAppTextMessage(phone, msg)
}
