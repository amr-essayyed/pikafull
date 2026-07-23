import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CalendarDays, MapPin, Clock, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getTranslations } from "next-intl/server"

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
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false })
      
    if (data) {
      bookings = data
    }
  }

  return (
    <div className="container py-12 md:py-16 max-w-5xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">{t('myDashboard')}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">{t('dashboardDesc')}</p>
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
                    
                    <div className="text-left md:text-right rtl:md:text-left">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('totalPrice')}</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">£{Number(booking.total_price).toFixed(2)}</p>
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
