import { NextResponse } from "next/server"
import { sendWhatsAppOTP } from "@/lib/whatsapp"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Supabase custom SMS provider payload format
    const { user, sms } = body

    if (!user || !user.phone || !sms || !sms.otp) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const { success, error } = await sendWhatsAppOTP(user.phone, sms.otp)

    if (!success) {
      console.error("[SMS Webhook] Failed to send OTP:", error)
      return NextResponse.json({ error: "Failed to send OTP via WhatsApp" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[SMS Webhook] Error processing request:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
