import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BigCalendar } from "@/components/dashboard/big-calendar"
import { getDashboardStats, getAllBookings, getAllEmployees } from "@/actions/queries"
import { CalendarDays, DollarSign, Users, Briefcase } from "lucide-react"
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

export default async function DashboardOverviewPage() {
  const t = await getTranslations("AdminDashboard")
  let stats = {
    totalRevenue: 0,
    totalBookings: 0,
    totalCustomers: 0,
    activeEmployees: 0,
    recentBookings: [] as any[],
  }

  let allBookings = [] as any[]
  let allEmployees = [] as any[]

  try {
    const [fetchedStats, fetchedBookings, fetchedEmployees] = await Promise.all([
      getDashboardStats(),
      getAllBookings(),
      getAllEmployees(),
    ])
    stats = fetchedStats
    allBookings = fetchedBookings
    allEmployees = fetchedEmployees
  } catch { /* fallback to empty stats */ }


  const kpiCards = [
    {
      title: t('totalRevenue'),
      value: `£${stats.totalRevenue.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50",
    },
    {
      title: t('totalBookings'),
      value: stats.totalBookings.toString(),
      icon: CalendarDays,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/50",
    },
    {
      title: t('activeCustomers'),
      value: stats.totalCustomers.toString(),
      icon: Users,
      color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/50",
    },
    {
      title: t('activeCleaners'),
      value: stats.activeEmployees.toString(),
      icon: Briefcase,
      color: "text-amber-600 bg-amber-100 dark:bg-amber-900/50",
    },
  ]

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard')}</h1>
        <p className="text-muted-foreground">{t('welcomeBack')}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${kpi.color}`}>
                  <kpi.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-1">
        {/* Calendar View */}
        <div className="h-[700px] w-full">
          <BigCalendar bookings={allBookings} employees={allEmployees} />
        </div>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>{t('recentBookings')}</CardTitle>
            <CardDescription>{t('latestBookings')}</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentBookings.length > 0 ? (
              <div className="space-y-4">
                {stats.recentBookings.map((booking: any) => {
                  const customerName = booking.customers?.profiles?.full_name || t('unknown')
                  const initials = customerName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
                  return (
                    <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium">{customerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.services?.name} • {booking.scheduled_date} {booking.scheduled_time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 self-start sm:self-auto">
                        <Badge className={statusColors[booking.status] || ""} variant="secondary">
                          {t(`status_${booking.status}`) || booking.status?.replace("_", " ")}
                        </Badge>
                        <p className="font-bold text-sm">
                          £{Number(booking.total_price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>{t('noBookingsYet')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
