import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getServices, getExtraServices, getAllCustomers } from "@/actions/queries"
import { BookingWizard } from "@/components/booking/booking-wizard"
import { Button } from "@/components/ui/button"

export default async function NewBookingPage() {
  const [services, extras, customers] = await Promise.all([
    getServices(),
    getExtraServices(),
    getAllCustomers()
  ])

  // Format customers for the dropdown with full address and phone info
  const formattedCustomers = customers.map((c: any) => {
    const firstAddr = Array.isArray(c.addresses) ? c.addresses[0] : c.addresses
    return {
      id: c.id,
      name: c.profiles?.full_name || "Unknown",
      email: c.profiles?.email || "",
      phone: c.profiles?.phone || "",
      addressLine1: firstAddr?.address_line_1 || "",
      city: firstAddr?.city || "",
    }
  })

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/bookings">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Booking</h1>
          <p className="text-muted-foreground">Create a booking on behalf of a customer.</p>
        </div>
      </div>

      <BookingWizard 
        services={services} 
        extras={extras} 
        customers={formattedCustomers}
        isAdmin={true} 
      />
    </div>
  )
}
