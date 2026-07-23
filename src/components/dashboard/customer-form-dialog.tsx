"use client"

import { useState, useEffect } from "react"
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
import { PhoneInput } from "@/components/ui/phone-input"
import { parsePhoneWithCountryCode, validatePhoneNumber } from "@/lib/phone-validation"

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
  const firstAddress = Array.isArray(customer?.addresses) ? customer.addresses[0] : customer?.addresses

  const [phoneValue, setPhoneValue] = useState<string>("")

  useEffect(() => {
    setPhoneValue(profile?.phone || "")
  }, [profile?.phone])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccessMsg("")

    const formData = new FormData(e.currentTarget)
    
    // Validate phone number if provided
    if (phoneValue.trim()) {
      const parsed = parsePhoneWithCountryCode(phoneValue)
      const val = validatePhoneNumber(parsed.countryCode, parsed.number, false)
      if (!val.isValid) {
        setError(val.error || "Invalid phone number")
        setLoading(false)
        return
      }
    }

    const data = {
      full_name: formData.get("full_name") as string,
      email: formData.get("email") as string,
      phone: phoneValue,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
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
      <DialogContent className="sm:max-w-[480px]">
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
            {error && <div className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-950/50 p-2.5 rounded-md">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input id="full_name" name="full_name" defaultValue={profile?.full_name} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" name="email" type="email" defaultValue={profile?.email} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <PhoneInput
                id="phone"
                name="phone"
                value={phoneValue}
                onChange={setPhoneValue}
                required={false}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input id="address" name="address" defaultValue={firstAddress?.address_line_1} placeholder="Street address" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City (Optional)</Label>
                <Input id="city" name="city" defaultValue={firstAddress?.city} placeholder="City name" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Admin Notes (Optional)</Label>
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
