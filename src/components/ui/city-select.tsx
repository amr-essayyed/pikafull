"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useLocale } from "next-intl"

// Egyptian governorates / major cities — bilingual
const EGYPTIAN_CITIES = [
  { en: "Cairo", ar: "القاهرة" },
  { en: "Giza", ar: "الجيزة" },
  { en: "Alexandria", ar: "الإسكندرية" },
  { en: "Shubra El Kheima", ar: "شبرا الخيمة" },
  { en: "Port Said", ar: "بورسعيد" },
  { en: "Suez", ar: "السويس" },
  { en: "Luxor", ar: "الأقصر" },
  { en: "Aswan", ar: "أسوان" },
  { en: "Asyut", ar: "أسيوط" },
  { en: "Ismailia", ar: "الإسماعيلية" },
  { en: "Faiyum", ar: "الفيوم" },
  { en: "Zagazig", ar: "الزقازيق" },
  { en: "Damietta", ar: "دمياط" },
  { en: "Mansoura", ar: "المنصورة" },
  { en: "Tanta", ar: "طنطا" },
  { en: "Beni Suef", ar: "بني سويف" },
  { en: "Sohag", ar: "سوهاج" },
  { en: "Hurghada", ar: "الغردقة" },
  { en: "6th of October City", ar: "مدينة السادس من أكتوبر" },
  { en: "Shibin El Kom", ar: "شبين الكوم" },
  { en: "Banha", ar: "بنها" },
  { en: "Kafr El Sheikh", ar: "كفر الشيخ" },
  { en: "Arish", ar: "العريش" },
  { en: "Mallawi", ar: "ملوي" },
  { en: "10th of Ramadan City", ar: "مدينة العاشر من رمضان" },
  { en: "Bilbeis", ar: "بلبيس" },
  { en: "Marsa Matruh", ar: "مرسى مطروح" },
  { en: "Idfu", ar: "إدفو" },
  { en: "Mit Ghamr", ar: "ميت غمر" },
  { en: "Al Mahalla Al Kubra", ar: "المحلة الكبرى" },
  { en: "Qena", ar: "قنا" },
  { en: "Minya", ar: "المنيا" },
  { en: "Damanhur", ar: "دمنهور" },
  { en: "New Cairo", ar: "القاهرة الجديدة" },
  { en: "Helwan", ar: "حلوان" },
  { en: "Obour City", ar: "مدينة العبور" },
  { en: "Nasr City", ar: "مدينة نصر" },
  { en: "Maadi", ar: "المعادي" },
  { en: "Sheikh Zayed City", ar: "مدينة الشيخ زايد" },
  { en: "New Administrative Capital", ar: "العاصمة الإدارية الجديدة" },
  { en: "Sharm El Sheikh", ar: "شرم الشيخ" },
  { en: "El Gouna", ar: "الجونة" },
  { en: "Dahab", ar: "دهب" },
  { en: "Nuweiba", ar: "نويبع" },
  { en: "Ain Sokhna", ar: "العين السخنة" },
  { en: "Borg El Arab", ar: "برج العرب" },
  { en: "Sadat City", ar: "مدينة السادات" },
  { en: "Badr City", ar: "مدينة بدر" },
  { en: "Quesna", ar: "قويسنا" },
  { en: "El Kharga", ar: "الخارجة" },
] as const

// Normalize Arabic text for lenient search matching.
// Standard approach: unify alef variants, taa marbuta, alef maqsura,
// strip diacritics (tashkeel) and tatweel (kashida).
function normalizeArabic(text: string): string {
  if (!text) return ""
  return text
    .replace(/(آ|إ|أ)/g, "ا")       // Alef variants → bare Alef
    .replace(/(ة)/g, "ه")            // Taa Marbuta → Ha
    .replace(/(ى)/g, "ي")            // Alef Maqsura → Yeh
    .replace(/[\u064B-\u0652]/g, "") // Remove diacritics (tashkeel)
    .replace(/ـ/g, "")               // Remove tatweel (kashida)
}

interface CitySelectProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
  name?: string
  disabled?: boolean
}

export function CitySelect({
  value = "",
  onChange,
  placeholder,
  className,
  id,
  name,
  disabled = false,
}: CitySelectProps) {
  const locale = useLocale()
  const isArabic = locale === "ar"

  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Focus search input when popover opens
  React.useEffect(() => {
    if (open) {
      // Small delay to allow popover to mount
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [open])

  const displayLabel = React.useMemo(() => {
    if (!value) return ""
    const city = EGYPTIAN_CITIES.find(
      (c) => c.en === value || c.ar === value
    )
    if (city) return isArabic ? city.ar : city.en
    return value // fallback to raw value if not found
  }, [value, isArabic])


  const filteredCities = React.useMemo(() => {
    if (!search.trim()) return EGYPTIAN_CITIES
    const q = search.trim().toLowerCase()
    const qNorm = normalizeArabic(q)
    return EGYPTIAN_CITIES.filter(
      (c) =>
        c.en.toLowerCase().includes(q) ||
        normalizeArabic(c.ar).includes(qNorm)
    )
  }, [search])

  const handleSelect = (city: (typeof EGYPTIAN_CITIES)[number]) => {
    // Always store the English name as the canonical value
    onChange?.(city.en)
    setSearch("")
    setOpen(false)
  }

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-left cursor-pointer",
            !displayLabel && "text-muted-foreground"
          )}
        >
          <span className="truncate">
            {displayLabel || placeholder || (isArabic ? "اختر المدينة..." : "Select city...")}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2 rtl:ml-0 rtl:mr-2" />
        </PopoverTrigger>
        <PopoverContent
          className="w-[calc(100vw-2rem)] sm:w-[320px] p-0"
          align="start"
        >
          {/* Search input */}
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isArabic ? "ابحث عن مدينة..." : "Search cities..."}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* City list */}
          <div className="max-h-[240px] overflow-y-auto overscroll-contain p-1">
            {filteredCities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {isArabic ? "لا توجد نتائج" : "No cities found"}
              </p>
            ) : (
              filteredCities.map((city) => {
                const isSelected = value === city.en || value === city.ar
                return (
                  <button
                    key={city.en}
                    type="button"
                    onClick={() => handleSelect(city)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors cursor-pointer",
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isSelected ? "opacity-100 text-indigo-600" : "opacity-0"
                      )}
                    />
                    <span className="truncate">
                      {isArabic ? city.ar : city.en}
                    </span>
                    <span className="text-xs text-muted-foreground truncate ml-auto rtl:ml-0 rtl:mr-auto">
                      {isArabic ? city.en : city.ar}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Hidden input for native form submissions */}
      {name && <input type="hidden" name={name} value={value} />}
    </div>
  )
}
