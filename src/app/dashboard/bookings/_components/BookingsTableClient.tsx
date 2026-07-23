"use client"

import { useState, useTransition } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { assignEmployeeToBooking } from "@/actions/bookings"
import { Calendar, Eye, UserCheck, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

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

interface BookingsTableClientProps {
  bookings: any[]
  employees: any[]
}

export function BookingsTableClient({ bookings: initialBookings, employees }: BookingsTableClientProps) {
  const t = useTranslations("AdminDashboard")
  const [isPending, startTransition] = useTransition()
  const [loadingBookingId, setLoadingBookingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleAssign = (bookingId: string, employeeId: string | null) => {
    const targetEmpId = !employeeId || employeeId === "unassigned" ? null : employeeId
    setLoadingBookingId(bookingId)
    setErrorMessage(null)
    startTransition(async () => {
      const res = await assignEmployeeToBooking(bookingId, targetEmpId)
      if (res.error) {
        setErrorMessage(res.error)
      }
      setLoadingBookingId(null)
    })
  }

  if (!initialBookings || initialBookings.length === 0) {
    return (
      <div className="border rounded-xl p-16 text-center">
        <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
        <h3 className="text-lg font-semibold mb-2">{t('noBookingsYetTitle')}</h3>
        <p className="text-muted-foreground">{t('noBookingsYetDesc')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {errorMessage && (
        <div className="p-3 text-sm rounded-lg bg-red-50 text-red-800 border border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-xs underline font-semibold">
            Dismiss
          </button>
        </div>
      )}
      <div className="border rounded-xl overflow-hidden shadow-sm bg-card">
        <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-slate-900">
            <TableHead>{t('customer')}</TableHead>
            <TableHead>{t('service')}</TableHead>
            <TableHead>{t('dateAndTime')}</TableHead>
            <TableHead>{t('address')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead>{t('assignedEmployee')}</TableHead>
            <TableHead className="text-right rtl:text-left">{t('total')}</TableHead>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialBookings.map((booking: any) => {
            const customer = booking.customers?.profiles
            const address = booking.addresses
            const currentEmpId = booking.employee_id || "unassigned"
            const assignedEmpObj = employees.find((e: any) => e.id === booking.employee_id)
            const empName = assignedEmpObj?.profiles?.full_name || booking.employees?.profiles?.full_name
            const displayName = currentEmpId === "unassigned" ? t('unassignedOption') : (empName || currentEmpId)
            const isLoadingThis = loadingBookingId === booking.id && isPending

            return (
              <TableRow key={booking.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/50">
                <TableCell>
                  <div>
                    <p className="font-medium">{customer?.full_name || t('unknown')}</p>
                    <p className="text-xs text-muted-foreground">{customer?.email}</p>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{booking.services?.name}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p className="font-medium">{booking.scheduled_date}</p>
                    <p className="text-muted-foreground text-xs">{booking.scheduled_time}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">
                  {address ? `${address.address_line_1}, ${address.city}` : "—"}
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[booking.status] || ""} variant="secondary">
                    {t(`status_${booking.status}`) || booking.status?.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 min-w-[160px]">
                    <Select
                      disabled={isLoadingThis}
                      value={currentEmpId}
                      onValueChange={(val) => handleAssign(booking.id, val)}
                    >
                      <SelectTrigger className="h-8 text-xs w-[160px]">
                        {isLoadingThis ? (
                          <div className="flex items-center gap-1.5">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>{t('assigning')}</span>
                          </div>
                        ) : (
                          <span className="truncate font-medium">{displayName}</span>
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">
                          <span className="text-muted-foreground font-normal">{t('unassignedOption')}</span>
                        </SelectItem>
                        {employees.map((emp: any) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.profiles?.full_name || t('employee')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
  </div>
)
}
