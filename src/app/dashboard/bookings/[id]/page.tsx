import { notFound } from "next/navigation"
import { getBookingById, getAllEmployees } from "@/actions/queries"
import { BookingDetailClient } from "./_components/BookingDetailClient"

interface BookingDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = await params

  const [booking, employees] = await Promise.all([
    getBookingById(id),
    getAllEmployees(),
  ])

  if (!booking) {
    notFound()
  }

  return <BookingDetailClient booking={booking} employees={employees} />
}
