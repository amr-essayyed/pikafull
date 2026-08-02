"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cancelBookingByCustomer } from "@/actions/bookings"

interface CancelBookingDialogProps {
  bookingId: string
  bookingNumber?: string
  status: string
}

export function CancelBookingDialog({ bookingId, bookingNumber, status }: CancelBookingDialogProps) {
  const t = useTranslations("CustomerDashboard")
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const cancellableStatuses = ["pending", "confirmed", "assigned"]
  if (!cancellableStatuses.includes(status)) {
    return null
  }

  const handleCancel = async () => {
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const res = await cancelBookingByCustomer(bookingId, reason)
      if (res.error) {
        setErrorMsg(res.error)
      } else {
        setSuccessMsg(t("cancelSuccess"))
        setTimeout(() => {
          setOpen(false)
        }, 1500)
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center text-sm font-medium h-8 rounded-md px-3 border text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-950/40 cursor-pointer transition-colors">
        <XCircle className="w-4 h-4 mr-1.5 ltr:mr-1.5 rtl:ml-1.5" />
        {t("cancelBooking")}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            {t("cancelBookingTitle")} {bookingNumber ? `#${bookingNumber}` : ""}
          </DialogTitle>
          <DialogDescription>
            {t("cancelBookingDesc")}
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 rounded-md text-sm border border-red-200 dark:border-red-900">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 rounded-md text-sm border border-emerald-200 dark:border-emerald-900">
            {successMsg}
          </div>
        )}

        {!successMsg && (
          <div className="space-y-3 py-2">
            <Label htmlFor="cancel-reason" className="text-sm font-medium">
              {t("cancellationReason")}
            </Label>
            <Textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("cancellationReasonPlaceholder")}
              rows={3}
              disabled={loading}
            />
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            {t("keepBooking")}
          </Button>
          {!successMsg && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancel}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("cancelling")}
                </>
              ) : (
                t("confirmCancel")
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
