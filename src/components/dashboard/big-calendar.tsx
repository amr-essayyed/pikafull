"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
} from "date-fns"
import { ChevronLeft, ChevronRight, UserCheck, Eye, Loader2, Calendar as CalendarIcon, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { assignEmployeeToBooking } from "@/actions/bookings"
import { cn } from "@/lib/utils"
import { useLocale, useTranslations } from "next-intl"
import { ar, enGB } from "date-fns/locale"

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

export function BigCalendar({ bookings, employees = [] }: { bookings: any[]; employees?: any[] }) {
  const t = useTranslations("AdminDashboard")
  const locale = useLocale()
  const dfLocale = locale === "ar" ? ar : enGB

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const [selectedEmpId, setSelectedEmpId] = useState<string>("unassigned")
  const [isAssigning, startAssignTransition] = useTransition()
  const [assignMessage, setAssignMessage] = useState<string | null>(null)

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const today = () => setCurrentDate(new Date())

  const openBookingModal = (booking: any) => {
    setSelectedBooking(booking)
    setSelectedEmpId(booking.employee_id || "unassigned")
    setAssignMessage(null)
  }

  const handleAssignInModal = (empId: string | null) => {
    const validEmpId = empId || "unassigned"
    setSelectedEmpId(validEmpId)
    if (!selectedBooking) return
    const targetEmpId = validEmpId === "unassigned" ? null : validEmpId

    startAssignTransition(async () => {
      const res = await assignEmployeeToBooking(selectedBooking.id, targetEmpId)
      if (res.error) {
        setAssignMessage(res.error)
      } else {
        setAssignMessage(t('employeeAssignedSuccessfully'))
        // find employee profile
        const assigned = employees.find((e: any) => e.id === targetEmpId)
        setSelectedBooking((prev: any) => ({
          ...prev,
          employee_id: targetEmpId,
          employees: assigned || null,
          status: res.status || prev?.status
        }))
      }
    })
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 6 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 6 })

  const dateFormat = "d"
  const rows = []
  let days = []
  let day = startDate
  let formattedDate = ""

  // Generate calendar days
  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat)
      const cloneDay = day
      
      // find bookings for this day
      const dayBookings = bookings.filter(b => b.scheduled_date === format(cloneDay, "yyyy-MM-dd"))

      days.push(
        <div
          key={day.toString()}
          className={cn(
            "min-h-[120px] border-r border-b border-slate-100 dark:border-slate-800 p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900",
            !isSameMonth(day, monthStart) ? "text-slate-400 bg-slate-50/50 dark:bg-slate-900/50" : "bg-white dark:bg-slate-950",
            isSameDay(day, new Date()) ? "ring-2 ring-primary ring-inset z-10" : ""
          )}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={cn(
              "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
              isSameDay(day, new Date()) ? "bg-primary text-primary-foreground" : ""
            )}>
              {formattedDate}
            </span>
          </div>
          <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] custom-scrollbar">
            {dayBookings.slice(0, 3).map((booking, idx) => {
              const assignedEmp = employees.find((e: any) => e.id === booking.employee_id)
              const empName = assignedEmp?.profiles?.full_name || booking.employees?.profiles?.full_name
              const customerName = booking.customers?.profiles?.full_name || t('booking')
              const customerFirstName = customerName.split(' ')[0]

              return (
                <div 
                  key={booking.id || idx} 
                  onClick={() => openBookingModal(booking)}
                  className={cn(
                    "text-[10px] sm:text-xs rounded-md px-1.5 py-1 cursor-pointer hover:opacity-90 transition-all flex flex-col gap-0.5 shadow-xs border border-black/5 dark:border-white/10",
                    statusColors[booking.status] || "bg-slate-100 text-slate-800"
                  )}
                  title={`${booking.scheduled_time} - ${customerName} (${empName ? `Cleaner: ${empName}` : t('unassigned')})`}
                >
                  <div className="flex items-center justify-between font-semibold leading-tight truncate">
                    <span className="truncate">{booking.scheduled_time?.slice(0, 5)} - {customerFirstName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] sm:text-[10px] truncate">
                    {empName ? (
                      <span className="truncate flex items-center gap-1 font-medium text-indigo-900 dark:text-indigo-200">
                        <UserCheck className="h-3 w-3 shrink-0 text-indigo-600 dark:text-indigo-400" />
                        <span className="truncate">{empName}</span>
                      </span>
                    ) : (
                      <span className="text-amber-800 dark:text-amber-300 font-medium italic text-[9px]">
                        {t('unassigned')}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
            {dayBookings.length > 3 && (
              <div className="text-[10px] text-muted-foreground font-medium px-1">
                {t('moreBookings', { count: dayBookings.length - 3 })}
              </div>
            )}
          </div>
        </div>
      )
      day = addDays(day, 1)
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toString()}>
        {days}
      </div>
    )
    days = []
  }

  const customerName = selectedBooking?.customers?.profiles?.full_name || t('unknown')
  const addressStr = selectedBooking?.addresses ? `${selectedBooking.addresses.address_line_1}, ${selectedBooking.addresses.city}` : null
  const assignedEmpName = selectedBooking?.employees?.profiles?.full_name

  return (
    <div className="flex flex-col w-full h-full bg-card rounded-xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b">
        <h2 className="text-xl font-bold text-card-foreground mb-4 sm:mb-0">
          {format(currentDate, "MMMM yyyy", { locale: dfLocale })}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={today}>{t('today')}</Button>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 border-b bg-muted/40">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="text-center text-xs sm:text-sm font-semibold text-muted-foreground py-3 border-r last:border-r-0">
            {format(addDays(startDate, i), "EEE", { locale: dfLocale })}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col bg-muted/10">
        {rows.map((row, i) => (
          <div key={i} className="flex-1 border-b last:border-b-0">
            {row}
          </div>
        ))}
      </div>

      {/* Booking Quick View & Employee Assignment Modal */}
      {selectedBooking && (
        <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <div className="flex items-center justify-between gap-2 pr-6">
                <DialogTitle className="text-lg font-bold">
                  {selectedBooking.booking_number || `${t('booking')} #${selectedBooking.id.slice(0, 8)}`}
                </DialogTitle>
                <Badge className={statusColors[selectedBooking.status] || ""} variant="secondary">
                  {t(`status_${selectedBooking.status}`) || selectedBooking.status?.replace("_", " ")}
                </Badge>
              </div>
              <DialogDescription>
                {selectedBooking.services?.name || t('service')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border">
                <div>
                  <p className="text-xs text-muted-foreground">{t('customer')}</p>
                  <p className="font-semibold">{customerName}</p>
                  <p className="text-xs text-muted-foreground">{selectedBooking.customers?.profiles?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('dateAndTime')}</p>
                  <p className="font-semibold text-xs mt-0.5 flex items-center gap-1">
                    <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                    {selectedBooking.scheduled_date}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {selectedBooking.scheduled_time}
                  </p>
                </div>
              </div>

              {addressStr && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground p-2 rounded-md bg-slate-50/50 dark:bg-slate-900/50">
                  <MapPin className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                  <span>{addressStr}</span>
                </div>
              )}

              {/* Employee Assignment Dropdown */}
              <div className="space-y-2 pt-2 border-t">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-indigo-600" />
                  {t('assignedEmployee')}
                </label>

                {assignMessage && (
                  <p className="text-xs text-emerald-600 font-medium">
                    {assignMessage}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <Select
                    disabled={isAssigning}
                    value={selectedEmpId}
                    onValueChange={handleAssignInModal}
                  >
                    <SelectTrigger className="w-full">
                      {isAssigning ? (
                        <div className="flex items-center gap-2 text-xs">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>{t('assigning')}</span>
                        </div>
                      ) : (
                        <span className="truncate font-medium">
                          {selectedEmpId === "unassigned" 
                            ? t('unassignedOption') 
                            : (employees.find((e: any) => e.id === selectedEmpId)?.profiles?.full_name || selectedBooking?.employees?.profiles?.full_name || selectedEmpId)}
                        </span>
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">
                        <span className="text-muted-foreground">{t('unassignedOption')}</span>
                      </SelectItem>
                      {employees.map((emp: any) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.profiles?.full_name || t('employee')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {assignedEmpName && (
                  <p className="text-xs text-muted-foreground">
                    Currently assigned to: <strong className="text-foreground">{assignedEmpName}</strong>
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Link href={`/dashboard/bookings/${selectedBooking.id}`}>
                  <Eye className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
                  {t('bookingDetails')}
                </Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
