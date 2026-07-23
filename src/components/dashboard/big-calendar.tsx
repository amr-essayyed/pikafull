"use client"

import { useState } from "react"
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
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLocale, useTranslations } from "next-intl"
import { ar, enGB } from "date-fns/locale"

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  assigned: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
}

export function BigCalendar({ bookings }: { bookings: any[] }) {
  const t = useTranslations("AdminDashboard")
  const locale = useLocale()
  const dfLocale = locale === "ar" ? ar : enGB

  const [currentDate, setCurrentDate] = useState(new Date())

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const today = () => setCurrentDate(new Date())

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
            {dayBookings.slice(0, 4).map((booking, idx) => (
              <div 
                key={booking.id || idx} 
                className={cn(
                  "text-[10px] sm:text-xs truncate rounded px-1.5 py-1 cursor-pointer hover:opacity-80 transition-opacity",
                  statusColors[booking.status] || "bg-slate-100 text-slate-800"
                )}
                title={`${booking.scheduled_time} - ${booking.customers?.profiles?.full_name || t('booking')}`}
              >
                <span className="font-semibold">{booking.scheduled_time?.slice(0, 5)}</span> {booking.customers?.profiles?.full_name?.split(' ')[0] || t('booking')}
              </div>
            ))}
            {dayBookings.length > 4 && (
              <div className="text-[10px] text-muted-foreground font-medium px-1">
                {t('moreBookings', { count: dayBookings.length - 4 })}
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
    </div>
  )
}
