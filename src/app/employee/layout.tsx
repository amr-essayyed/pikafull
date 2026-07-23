import { EmployeeNav } from "@/components/layout/employee-nav"

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 sm:flex">
      <EmployeeNav />
      <main className="flex-1 pb-20 sm:pb-0 p-4 sm:p-8 max-w-screen-xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
