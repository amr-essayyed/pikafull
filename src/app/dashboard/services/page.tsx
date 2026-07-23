import { getAllServices, getAllExtraServices } from "@/actions/services"
import ServiceManagerClient from "./_components/ServiceManagerClient"

export default async function ServicesManagementPage() {
  let services: any[] = []
  let extras: any[] = []
  try {
    ;[services, extras] = await Promise.all([getAllServices(), getAllExtraServices()])
  } catch { /* fallback */ }

  return (
    <ServiceManagerClient initialServices={services} initialExtras={extras} />
  )
}
