import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Authentication - SparkleClean Pro",
  description: "Login or register to your account.",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm space-y-8">
          {children}
        </div>
      </div>
      <div className="hidden lg:flex flex-col justify-center items-center bg-indigo-600 text-white p-12">
        <Link href="/" className="max-w-md space-y-6 text-center group cursor-pointer">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm group-hover:scale-105 transition-transform">
            <span className="text-3xl">✨</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight">SparkleClean Pro</h2>
          <p className="text-lg text-indigo-100">
            Professional cleaning services at your fingertips. Manage your bookings,
            view schedules, and stay in control.
          </p>
        </Link>
      </div>
    </div>
  )
}
