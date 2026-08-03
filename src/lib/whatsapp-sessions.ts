import { createAdminClient } from "@/lib/supabase/admin"
import { sanitizePhoneNumber } from "@/lib/whatsapp"

export interface WhatsAppSession {
  phone: string
  step: string
  formData: Record<string, any>
  updatedAt?: string
}

// In-memory session store as fallback if DB table is not initialized yet
const memorySessions = new Map<string, WhatsAppSession>()

const SESSION_TTL_MS = 60 * 60 * 1000 // 1 hour TTL

/**
 * Retrieves the current conversation session for a WhatsApp phone number.
 */
export async function getWhatsAppSession(phone: string): Promise<WhatsAppSession> {
  const cleanPhone = sanitizePhoneNumber(phone)
  if (!cleanPhone) {
    return { phone: "", step: "IDLE", formData: {} }
  }

  try {
    const admin = createAdminClient()
    const { data, error } = await (admin.from("whatsapp_sessions") as any)
      .select("phone, step, form_data, updated_at")
      .eq("phone", cleanPhone)
      .maybeSingle()

    if (!error && data) {
      // Check for TTL expiration (1 hour)
      const updatedAt = new Date(data.updated_at).getTime()
      if (Date.now() - updatedAt > SESSION_TTL_MS) {
        await clearWhatsAppSession(cleanPhone)
        return { phone: cleanPhone, step: "IDLE", formData: {} }
      }
      return {
        phone: cleanPhone,
        step: data.step || "IDLE",
        formData: data.form_data || {},
        updatedAt: data.updated_at,
      }
    }
  } catch (err) {
    console.warn("[WhatsApp Session] DB fetch failed, using memory store fallback:", err)
  }

  // Fallback memory check
  const memSession = memorySessions.get(cleanPhone)
  if (memSession) {
    if (Date.now() - new Date(memSession.updatedAt || Date.now()).getTime() > SESSION_TTL_MS) {
      memorySessions.delete(cleanPhone)
      return { phone: cleanPhone, step: "IDLE", formData: {} }
    }
    return memSession
  }

  return { phone: cleanPhone, step: "IDLE", formData: {} }
}

/**
 * Updates the conversation step and merges new form data into the session.
 */
export async function saveWhatsAppSession(
  phone: string,
  step: string,
  dataPatch: Record<string, any> = {}
): Promise<WhatsAppSession> {
  const cleanPhone = sanitizePhoneNumber(phone)
  const current = await getWhatsAppSession(cleanPhone)

  const updatedFormData = {
    ...current.formData,
    ...dataPatch,
  }

  const newSession: WhatsAppSession = {
    phone: cleanPhone,
    step,
    formData: updatedFormData,
    updatedAt: new Date().toISOString(),
  }

  // Update memory fallback store
  memorySessions.set(cleanPhone, newSession)

  try {
    const admin = createAdminClient()
    await (admin.from("whatsapp_sessions") as any).upsert({
      phone: cleanPhone,
      step,
      form_data: updatedFormData,
      updated_at: new Date().toISOString(),
    })
  } catch (err) {
    console.warn("[WhatsApp Session] DB upsert failed, stored in memory:", err)
  }

  return newSession
}

/**
 * Clears/Resets the conversation session back to IDLE.
 */
export async function clearWhatsAppSession(phone: string): Promise<void> {
  const cleanPhone = sanitizePhoneNumber(phone)
  memorySessions.delete(cleanPhone)

  try {
    const admin = createAdminClient()
    await (admin.from("whatsapp_sessions") as any)
      .delete()
      .eq("phone", cleanPhone)
  } catch (err) {
    console.warn("[WhatsApp Session] DB delete failed:", err)
  }
}
