import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { CustomerProfileClient } from "./_components/CustomerProfileClient"
import { CalendarDays, User, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function CustomerProfilePage() {
  const t = await getTranslations("CustomerProfile")
  const tNav = await getTranslations("Navigation")
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch profile details
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, created_at")
    .eq("id", user.id)
    .single()

  // Fetch customer stats & record
  const { data: customer } = await supabase
    .from("customers")
    .select("id, total_bookings, lifetime_value")
    .eq("profile_id", user.id)
    .maybeSingle()

  const profileData = profile as any
  const customerData = customer as any

  let address: { address_line_1: string; city: string; postal_code: string } | null = null
  if (customerData) {
    const { data: addresses } = await supabase
      .from("addresses")
      .select("address_line_1, city, postal_code")
      .eq("customer_id", customerData.id)
      .limit(1)

    if (addresses && addresses.length > 0) {
      address = addresses[0] as any
    }
  }

  return (
    <div className="container py-8 md:py-12 max-w-5xl mx-auto px-4">
      {/* Sub-Header Navigation Tabs */}
      <div className="flex items-center justify-between gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <Link
            href="/customer/dashboard"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 font-medium text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60"
          >
            <CalendarDays className="w-4 h-4" />
            {tNav("myBookings")}
          </Link>
          <Link
            href="/customer/profile"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 px-3.5 py-1.5 rounded-lg shadow-sm"
          >
            <User className="w-4 h-4" />
            {tNav("myProfile")}
          </Link>
        </div>
        <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-sm">
          <Link href="/book" className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>{tNav("bookNow")}</span>
          </Link>
        </Button>
      </div>

      <CustomerProfileClient
        profile={{
          id: user.id,
          full_name: profileData?.full_name || user.user_metadata?.full_name || null,
          email: user.email || profileData?.email || "",
          phone: profileData?.phone || null,
          created_at: profileData?.created_at || user.created_at,
        }}
        customer={customerData ? {
          id: customerData.id,
          total_bookings: customerData.total_bookings || 0,
          lifetime_value: customerData.lifetime_value || 0,
        } : null}
        address={address}
      />
    </div>
  )
}
