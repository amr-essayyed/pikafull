import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getAllBookings, getAllEmployees } from "@/actions/queries"
import { Plus } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { BookingsTableClient } from "./_components/BookingsTableClient"

export default async function BookingsManagementPage() {
  const t = await getTranslations("AdminDashboard")
  let bookings: any[] = []
  let employees: any[] = []

  try {
    const [fetchedBookings, fetchedEmployees] = await Promise.all([
      getAllBookings(),
      getAllEmployees(),
    ])
    bookings = fetchedBookings
    employees = fetchedEmployees
  } catch (err) {
    console.error("Error fetching bookings/employees:", err)
  }

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

      <BookingsTableClient bookings={bookings} employees={employees} />
    </div>
  )
}

