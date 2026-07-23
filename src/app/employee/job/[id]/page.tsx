"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { use } from "react"
import { useTranslations } from "next-intl"

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const t = useTranslations("EmployeeDashboard")
  const [status, setStatus] = React.useState<"assigned" | "on_the_way" | "in_progress" | "completed">("assigned")

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border shadow-sm">
        <h1 className="text-2xl font-bold mb-2">{t('job')}{id}</h1>
        <p className="text-slate-500 mb-6">123 Clean Street, Apt 4B, London</p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <p className="text-xs text-slate-500 uppercase font-semibold">{t('service')}</p>
            <p className="font-medium">{t('regularCleaning')}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <p className="text-xs text-slate-500 uppercase font-semibold">{t('duration')}</p>
            <p className="font-medium">2.5 {t('hours')}</p>
          </div>
        </div>

        <div className="border-t pt-6 space-y-4">
          <h3 className="font-bold">{t('customerNotes')}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-900">
            {t('customerNotesSample')}
          </p>
        </div>
      </div>

      {/* Job Actions */}
      <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border shadow-sm space-y-4">
        <h3 className="font-bold text-lg mb-4">{t('jobControls')}</h3>
        
        <div className="flex flex-col gap-3">
          {status === "assigned" && (
            <Button size="lg" className="w-full" onClick={() => setStatus("on_the_way")}>
              {t('markOnTheWay')}
            </Button>
          )}
          {status === "on_the_way" && (
            <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => setStatus("in_progress")}>
              {t('startCleaning')}
            </Button>
          )}
          {status === "in_progress" && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-center font-bold animate-pulse">
                {t('cleaningInProgress')}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline">{t('uploadBefore')}</Button>
                <Button variant="outline">{t('uploadAfter')}</Button>
              </div>
              <Textarea placeholder={t('addNotes')} />
              <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => setStatus("completed")}>
                {t('completeJob')}
              </Button>
            </div>
          )}
          {status === "completed" && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-center font-bold">
              {t('jobCompleted')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
