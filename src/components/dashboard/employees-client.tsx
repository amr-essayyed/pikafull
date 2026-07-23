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
import { Briefcase, Star, Pencil, Plus, Trash2 } from "lucide-react"
import { EmployeeFormDialog } from "./employee-form-dialog"
import { deleteEmployee } from "@/actions/admin-users"

export function EmployeesClient({ employees, t }: { employees: any[], t: any }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)

  const handleAdd = () => {
    setSelectedEmployee(null)
    setDialogOpen(true)
  }

  const handleEdit = (employee: any) => {
    setSelectedEmployee(employee)
    setDialogOpen(true)
  }

  const handleDelete = async (profileId: string) => {
    if (window.confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
      try {
        await deleteEmployee(profileId)
      } catch (error: any) {
        alert(error.message || "Failed to delete employee")
      }
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.employees}</h1>
          <p className="text-muted-foreground">{t.manageEmployees.replace('{count}', employees.length.toString())}</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {employees.length > 0 ? (
        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-900">
                <TableHead>{t.employee}</TableHead>
                <TableHead>{t.phone}</TableHead>
                <TableHead>{t.hourlyRate}</TableHead>
                <TableHead>{t.rating}</TableHead>
                <TableHead>{t.jobsDone}</TableHead>
                <TableHead>{t.availability}</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((e: any) => {
                const profile = e.profiles
                const initials = (profile?.full_name || "??")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                return (
                  <TableRow key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
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
                    <TableCell className="font-medium">
                      {e.hourly_rate ? `£${Number(e.hourly_rate).toFixed(2)}/hr` : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium">{Number(e.avg_rating).toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{e.total_jobs}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={e.is_available ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}>
                        {e.is_available ? t.available : t.unavailable}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(e)} title="Edit">
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
          <Briefcase className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold mb-2">{t.noEmployeesYetTitle}</h3>
          <p className="text-muted-foreground">{t.noEmployeesYetDesc}</p>
        </div>
      )}

      {dialogOpen && (
        <EmployeeFormDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen} 
          employee={selectedEmployee} 
        />
      )}
    </>
  )
}
