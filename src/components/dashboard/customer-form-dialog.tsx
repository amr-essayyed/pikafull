"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createCustomer, updateCustomer } from "@/actions/admin-users"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CustomerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: any // If provided, we are in edit mode
}

export function CustomerFormDialog({ open, onOpenChange, customer }: CustomerFormDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const isEdit = !!customer
  const profile = customer?.profiles

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccessMsg("")

    const formData = new FormData(e.currentTarget)
    const data = {
      full_name: formData.get("full_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      notes: formData.get("notes") as string,
    }

    try {
      if (isEdit) {
        await updateCustomer(customer.id, profile.id, data)
        onOpenChange(false)
        router.refresh()
      } else {
        const res = await createCustomer(data)
        if (res.password) {
          setSuccessMsg(`Customer created successfully! Generated Password: ${res.password}`)
          // Keep dialog open to show password, or we could close it and show a toast
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Customer" : "Add New Customer"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update customer details below." : "Enter details for the new customer. A random password will be generated."}
          </DialogDescription>
        </DialogHeader>

        {successMsg ? (
          <div className="py-6 flex flex-col items-center gap-4 text-center">
            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg w-full">
              <p className="font-medium">{successMsg}</p>
              <p className="text-sm mt-2">Please copy this password and share it with the customer.</p>
            </div>
            <Button onClick={() => { onOpenChange(false); router.refresh(); }}>Done</Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input id="full_name" name="full_name" defaultValue={profile?.full_name} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" name="email" type="email" defaultValue={profile?.email} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" type="tel" defaultValue={profile?.phone} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Admin Notes</Label>
              <Textarea id="notes" name="notes" defaultValue={customer?.notes} placeholder="Optional internal notes..." />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
