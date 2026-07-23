import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getAllBookings } from "@/actions/queries"
import { Calendar, Eye, Plus } from "lucide-react"
import { getTranslations } from "next-intl/server"

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  assigned: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  on_the_way: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
}

export default async function BookingsManagementPage() {
  const t = await getTranslations("AdminDashboard")
  let bookings: any[] = []
  try {
    bookings = await getAllBookings()
  } catch { /* fallback */ }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('bookings')}</h1>
          <p className="text-muted-foreground">{t('manageBookings', { count: bookings.length })}</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/bookings/new">
            <Plus className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" /> {t('newBooking')}
          </Link>
        </Button>
      </div>

      {bookings.length > 0 ? (
        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-900">
                <TableHead>{t('customer')}</TableHead>
                <TableHead>{t('service')}</TableHead>
                <TableHead>{t('dateAndTime')}</TableHead>
                <TableHead>{t('address')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead className="text-right rtl:text-left">{t('total')}</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking: any) => {
                const customer = booking.customers?.profiles
                const address = booking.addresses
                return (
                  <TableRow key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer?.full_name || t('unknown')}</p>
                        <p className="text-xs text-muted-foreground">{customer?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{booking.services?.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{booking.scheduled_date}</p>
                        <p className="text-muted-foreground">{booking.scheduled_time}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {address ? `${address.address_line_1}, ${address.city}` : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[booking.status] || ""} variant="secondary">
                        {t(`status_${booking.status}`) || booking.status?.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right rtl:text-left font-bold">
                      £{Number(booking.total_price).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/bookings/${booking.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="border rounded-xl p-16 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold mb-2">{t('noBookingsYetTitle')}</h3>
          <p className="text-muted-foreground">{t('noBookingsYetDesc')}</p>
        </div>
      )}
    </div>
  )
}
