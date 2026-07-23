import { getAllEmployees } from "@/actions/queries"
import { getTranslations } from "next-intl/server"
import { EmployeesClient } from "@/components/dashboard/employees-client"

export default async function EmployeesPage() {
  const t = await getTranslations("AdminDashboard")
  let employees: any[] = []
  try {
    employees = await getAllEmployees()
  } catch { /* fallback */ }

  const translations = {
    employees: t('employees'),
    manageEmployees: t('manageEmployees', { count: employees.length }),
    employee: t('employee'),
    phone: t('phone'),
    hourlyRate: t('hourlyRate'),
    rating: t('rating'),
    jobsDone: t('jobsDone'),
    availability: t('availability'),
    unknown: t('unknown'),
    available: t('available'),
    unavailable: t('unavailable'),
    noEmployeesYetTitle: t('noEmployeesYetTitle'),
    noEmployeesYetDesc: t('noEmployeesYetDesc'),
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <EmployeesClient employees={employees} t={translations} />
    </div>
  )
}
