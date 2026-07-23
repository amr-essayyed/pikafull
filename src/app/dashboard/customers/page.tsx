import { getAllCustomers } from "@/actions/queries"
import { getTranslations } from "next-intl/server"
import { CustomersClient } from "@/components/dashboard/customers-client"

export default async function CustomersPage() {
  const t = await getTranslations("AdminDashboard")
  let customers: any[] = []
  try {
    customers = await getAllCustomers()
  } catch { /* fallback */ }

  // Extract translations needed for the client
  const translations = {
    customers: t('customers'),
    manageCustomers: t('manageCustomers', { count: customers.length }),
    customer: t('customer'),
    phone: t('phone'),
    totalBookings: t('totalBookings'),
    lifetimeValue: t('lifetimeValue'),
    status: t('status'),
    joined: t('joined'),
    unknown: t('unknown'),
    active: t('active'),
    inactive: t('inactive'),
    noCustomersYetTitle: t('noCustomersYetTitle'),
    noCustomersYetDesc: t('noCustomersYetDesc'),
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <CustomersClient customers={customers} t={translations} />
    </div>
  )
}
