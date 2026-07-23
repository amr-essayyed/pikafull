"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Users, Pencil, Plus, Trash2 } from "lucide-react"
import { CustomerFormDialog } from "./customer-form-dialog"
import { deleteCustomer } from "@/actions/admin-users"

export function CustomersClient({ customers, t }: { customers: any[], t: any }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)

  const handleAdd = () => {
    setSelectedCustomer(null)
    setDialogOpen(true)
  }

  const handleEdit = (customer: any) => {
    setSelectedCustomer(customer)
    setDialogOpen(true)
  }

  const handleDelete = async (profileId: string) => {
    if (window.confirm("Are you sure you want to delete this customer? This action cannot be undone.")) {
      try {
        await deleteCustomer(profileId)
      } catch (error: any) {
        alert(error.message || "Failed to delete customer")
      }
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.customers}</h1>
          <p className="text-muted-foreground">{t.manageCustomers.replace('{count}', customers.length.toString())}</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {customers.length > 0 ? (
        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-900">
                <TableHead>{t.customer}</TableHead>
                <TableHead>{t.phone}</TableHead>
                <TableHead>{t.totalBookings}</TableHead>
                <TableHead>{t.lifetimeValue}</TableHead>
                <TableHead>{t.status}</TableHead>
                <TableHead>{t.joined}</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c: any) => {
                const profile = c.profiles
                const initials = (profile?.full_name || "??")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                return (
                  <TableRow key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium">{profile?.full_name || t.unknown}</p>
                          <p className="text-xs text-muted-foreground">{profile?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{profile?.phone || "—"}</TableCell>
                    <TableCell className="font-medium">{c.total_bookings}</TableCell>
                    <TableCell className="font-bold">
                      £{Number(c.lifetime_value).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={profile?.is_active ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" : "bg-slate-100 text-slate-600"}>
                        {profile?.is_active ? t.active : t.inactive}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString("en-GB")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(c)} title="Edit">
                        <Pencil className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(profile.id)} title="Delete" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="border rounded-xl p-16 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold mb-2">{t.noCustomersYetTitle}</h3>
          <p className="text-muted-foreground">{t.noCustomersYetDesc}</p>
        </div>
      )}

      {dialogOpen && (
        <CustomerFormDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen} 
          customer={selectedCustomer} 
        />
      )}
    </>
  )
}
