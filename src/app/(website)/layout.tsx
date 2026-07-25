import { WebsiteHeader } from "@/components/layout/website-header"
import { WebsiteFooter } from "@/components/layout/website-footer"
import { WhatsAppButton } from "@/components/shared/whatsapp-button"
import { FloatingBookingButton } from "@/components/shared/floating-booking-button"

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <WebsiteHeader />
      <main className="flex-1 pb-16 sm:pb-0">
        {children}
      </main>
      <WebsiteFooter />
      <WhatsAppButton />
      <FloatingBookingButton />
    </div>
  )
}
