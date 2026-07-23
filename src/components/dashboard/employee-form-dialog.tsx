"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createEmployee, updateEmployee } from "@/actions/admin-users"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EmployeeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: any // If provided, we are in edit mode
}

export function EmployeeFormDialog({ open, onOpenChange, employee }: EmployeeFormDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const isEdit = !!employee
  const profile = employee?.profiles

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
      hourly_rate: Number(formData.get("hourly_rate") || 0),
      bio: formData.get("bio") as string,
      is_available: formData.get("is_available") === "true",
    }

    try {
      if (isEdit) {
        await updateEmployee(employee.id, profile.id, data)
        onOpenChange(false)
        router.refresh()
      } else {
        const res = await createEmployee(data)
        if (res.password) {
          setSuccessMsg(`Employee created successfully! Generated Password: ${res.password}`)
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
          <DialogTitle>{isEdit ? "Edit Employee" : "Add New Employee"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update employee details below." : "Enter details for the new employee. A random password will be generated."}
          </DialogDescription>
        </DialogHeader>

        {successMsg ? (
          <div className="py-6 flex flex-col items-center gap-4 text-center">
            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg w-full">
              <p className="font-medium">{successMsg}</p>
              <p className="text-sm mt-2">Please copy this password and share it with the employee.</p>
            </div>
            <Button onClick={() => { onOpenChange(false); router.refresh(); }}>Done</Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input id="full_name" name="full_name" defaultValue={profile?.full_name} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" name="email" type="email" defaultValue={profile?.email} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" defaultValue={profile?.phone} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Hourly Rate (£)</Label>
                <Input id="hourly_rate" name="hourly_rate" type="number" step="0.01" defaultValue={employee?.hourly_rate || ""} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_available">Status</Label>
              <Select name="is_available" defaultValue={isEdit ? (employee.is_available ? "true" : "false") : "true"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Available</SelectItem>
                  <SelectItem value="false">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" defaultValue={employee?.bio} placeholder="Optional bio or description..." />
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
