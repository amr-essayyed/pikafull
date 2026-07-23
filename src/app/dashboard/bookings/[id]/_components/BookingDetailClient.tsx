"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { assignEmployeeToBooking, updateBookingStatus } from "@/actions/bookings"
import { updateBookingStatus as updateStatusAction } from "@/actions/queries"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Home, 
  Sparkles, 
  UserCheck, 
  CheckCircle2, 
  Loader2 
} from "lucide-react"
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

interface BookingDetailClientProps {
  booking: any
  employees: any[]
}

export function BookingDetailClient({ booking: initialBooking, employees }: BookingDetailClientProps) {
  const t = useTranslations("AdminDashboard")
  const [booking, setBooking] = useState(initialBooking)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(booking.employee_id || "unassigned")
  const [currentStatus, setCurrentStatus] = useState<string>(booking.status)
  const [isAssigning, startAssignTransition] = useTransition()
  const [isUpdatingStatus, startStatusTransition] = useTransition()
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleAssign = () => {
    const empId = selectedEmployeeId === "unassigned" ? null : selectedEmployeeId
    setFeedback(null)
    startAssignTransition(async () => {
      const res = await assignEmployeeToBooking(booking.id, empId)
      if (res.error) {
        setFeedback(res.error)
      } else {
        setFeedback(t('employeeAssignedSuccessfully'))
        if (res.status) {
          setCurrentStatus(res.status)
        }
        // find employee details
        const assignedEmp = employees.find((e: any) => e.id === empId)
        setBooking((prev: any) => ({
          ...prev,
          employee_id: empId,
          employees: assignedEmp ? assignedEmp : null,
          status: res.status || prev.status
        }))
      }
    })
  }

  const handleStatusChange = (newStatus: string) => {
    startStatusTransition(async () => {
      try {
        await updateStatusAction(booking.id, newStatus)
        setCurrentStatus(newStatus)
        setBooking((prev: any) => ({ ...prev, status: newStatus }))
      } catch (err: any) {
        setFeedback(err?.message || "Failed to update status")
      }
    })
  }

  const customerProfile = booking.customers?.profiles
  const employeeProfile = booking.employees?.profiles
  const address = booking.addresses

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/bookings">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {booking.booking_number || `Booking #${booking.id.slice(0, 8)}`}
              </h1>
              <Badge className={statusColors[currentStatus] || ""} variant="secondary">
                {t(`status_${currentStatus}`) || currentStatus.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {booking.services?.name} • {booking.scheduled_date} {booking.scheduled_time}
            </p>
          </div>
        </div>

        {/* Change Booking Status */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
            {t('status')}:
          </span>
          <Select
            disabled={isUpdatingStatus}
            value={currentStatus}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[150px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["pending", "confirmed", "assigned", "on_the_way", "in_progress", "completed", "cancelled", "paid"].map((st) => (
                <SelectItem key={st} value={st}>
                  {t(`status_${st}`) || st.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {feedback && (
        <div className="p-3 text-sm rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left 2 Columns - Booking details & Customer info */}
        <div className="md:col-span-2 space-y-6">
          {/* Employee Assignment Card */}
          <Card className="border-indigo-100 dark:border-indigo-950 shadow-sm bg-gradient-to-br from-indigo-50/30 to-card dark:from-indigo-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-indigo-600" />
                {t('assignedEmployee')}
              </CardTitle>
              <CardDescription>
                Assign or change the cleaner responsible for this booking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {employeeProfile ? (
                <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={employeeProfile.avatar_url || ""} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                        {employeeProfile.full_name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{employeeProfile.full_name}</h4>
                      <p className="text-xs text-muted-foreground">{employeeProfile.email}</p>
                      {employeeProfile.phone && (
                        <p className="text-xs text-muted-foreground">{employeeProfile.phone}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    {t('assigned')}
                  </Badge>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed text-center bg-slate-50/50 dark:bg-slate-900/50">
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    {t('unassigned')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    No cleaner has been assigned to this booking yet.
                  </p>
                </div>
              )}

              {/* Assignment Control */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Select
                  value={selectedEmployeeId}
                  onValueChange={setSelectedEmployeeId}
                >
                  <SelectTrigger className="flex-1">
                    <span className="truncate font-medium">
                      {selectedEmployeeId === "unassigned"
                        ? t('unassignedOption')
                        : (employees.find((e: any) => e.id === selectedEmployeeId)?.profiles?.full_name || employeeProfile?.full_name || selectedEmployeeId)}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">
                      <span className="text-muted-foreground">{t('unassignedOption')}</span>
                    </SelectItem>
                    {employees.map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.profiles?.full_name || t('employee')} ({emp.profiles?.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleAssign}
                  disabled={isAssigning}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
                >
                  {isAssigning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('assigning')}
                    </>
                  ) : (
                    <>
                      <UserCheck className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2" />
                      {employeeProfile ? t('changeEmployee') : t('assignEmployee')}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Service & Property Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                {t('service')} & {t('propertyDetails')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900">
                <div>
                  <p className="text-xs text-muted-foreground">{t('service')}</p>
                  <p className="font-semibold text-sm mt-0.5">{booking.services?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('dateAndTime')}</p>
                  <p className="font-semibold text-sm mt-0.5">
                    {booking.scheduled_date} ({booking.scheduled_time})
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Property</p>
                  <p className="font-semibold text-sm mt-0.5 capitalize">
                    {booking.property_type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rooms</p>
                  <p className="font-semibold text-sm mt-0.5">
                    {booking.bedrooms} Bed, {booking.bathrooms} Bath
                  </p>
                </div>
              </div>

              {/* Extras list if any */}
              {booking.booking_extras && booking.booking_extras.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Add-ons Included
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {booking.booking_extras.map((extra: any) => (
                      <Badge key={extra.id} variant="outline">
                        {extra.extra_services?.name} (x{extra.quantity})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Notes */}
              {booking.customer_notes && (
                <div className="pt-2 border-t">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    {t('customerNotes')}
                  </p>
                  <p className="text-sm bg-amber-50/50 dark:bg-amber-950/30 p-3 rounded-lg border text-slate-700 dark:text-slate-300 italic">
                    "{booking.customer_notes}"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Customer & Location Info */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                {t('customer')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-3 pb-3 border-b">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={customerProfile?.avatar_url || ""} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                    {customerProfile?.full_name?.slice(0, 2).toUpperCase() || "C"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{customerProfile?.full_name || t('unknown')}</h4>
                  <p className="text-xs text-muted-foreground">{customerProfile?.email}</p>
                </div>
              </div>

              {customerProfile?.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                  <a href={`mailto:${customerProfile.email}`} className="hover:underline text-xs truncate">
                    {customerProfile.email}
                  </a>
                </div>
              )}

              {customerProfile?.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                  <a href={`tel:${customerProfile.phone}`} className="hover:underline text-xs">
                    {customerProfile.phone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location / Address Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-500" />
                {t('address')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {address ? (
                <div>
                  <p className="font-medium">{address.address_line_1}</p>
                  {address.address_line_2 && <p className="text-muted-foreground">{address.address_line_2}</p>}
                  <p className="text-muted-foreground">
                    {address.city}, {address.postal_code}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">No address recorded</p>
              )}
            </CardContent>
          </Card>

          {/* Price Summary Card */}
          <Card className="bg-slate-50 dark:bg-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t('total')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Price</span>
                <span>£{Number(booking.base_price || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Add-ons</span>
                <span>£{Number(booking.extras_price || 0).toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                <span>Total Amount</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  £{Number(booking.total_price || 0).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
