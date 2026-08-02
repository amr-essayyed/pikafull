import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { CalendarDays, MapPin, Clock, User, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getTranslations } from "next-intl/server"
import { CancelBookingDialog } from "@/components/booking/cancel-booking-dialog"

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  assigned: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
}

export default async function CustomerDashboardPage() {
  const t = await getTranslations("CustomerDashboard")
  const tNav = await getTranslations("Navigation")
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get customer profile
  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("profile_id", user.id)
    .single()

  let bookings: any[] = []
  
  if (customer) {
    const { data } = await supabase
      .from("bookings")
      .select(`
        *,
        services(name),
        addresses(address_line_1, city)
      `)
      .eq("customer_id", (customer as any).id)
      .order("created_at", { ascending: false })
      
    if (data) {
      bookings = data
    }
  }

  return (
    <div className="container py-8 md:py-12 max-w-5xl mx-auto px-4">
      {/* Sub-Header Navigation Tabs */}
      <div className="flex items-center gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
        <Link
          href="/customer/dashboard"
          className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 px-3.5 py-1.5 rounded-lg shadow-sm"
        >
          <CalendarDays className="w-4 h-4" />
          {tNav("myBookings")}
        </Link>
        <Link
          href="/customer/profile"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 font-medium text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60"
        >
          <User className="w-4 h-4" />
          {tNav("myProfile")}
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t('myDashboard')}</h1>
          <p className="text-slate-600 dark:text-slate-400">{t('dashboardDesc')}</p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-md shrink-0">
          <Link href="/book" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>{tNav('bookNow')}</span>
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">{t('yourBookings')}</h2>
        
        {bookings.length > 0 ? (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <CalendarDays className="h-4 w-4" />
                    <span>{t('bookedOn')}{new Date(booking.created_at).toLocaleDateString()}</span>
                  </div>
                  <Badge className={statusColors[booking.status] || "bg-slate-100 text-slate-800"} variant="secondary">
                    {t(`status_${booking.status}`) || booking.status?.replace("_", " ")}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{booking.services?.name || t('cleaningService')}</h3>
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Clock className="h-4 w-4 text-indigo-500" />
                          <span>
                            {new Date(booking.scheduled_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {booking.scheduled_time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <MapPin className="h-4 w-4 text-emerald-500" />
                          <span>
                            {booking.addresses?.address_line_1}, {booking.addresses?.city}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:items-end justify-between gap-4">
                      <div className="text-left md:text-right rtl:md:text-left">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('totalPrice')}</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">£{Number(booking.total_price).toFixed(2)}</p>
                      </div>
                      <CancelBookingDialog
                        bookingId={booking.id}
                        bookingNumber={booking.booking_number}
                        status={booking.status}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16 px-6">
            <CardHeader>
              <div className="mx-auto bg-indigo-50 dark:bg-indigo-900/20 w-16 h-16 flex items-center justify-center rounded-full mb-4">
                <CalendarDays className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle className="text-2xl">{t('noBookings')}</CardTitle>
              <CardDescription className="text-lg mt-2">
                {t('noBookingsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a 
                href="/book" 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-indigo-600 text-white hover:bg-indigo-700 h-11 px-8 py-2 mt-4"
              >
                {t('bookServiceNow')}
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
