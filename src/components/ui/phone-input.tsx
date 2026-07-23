"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { COUNTRY_CODES, parsePhoneWithCountryCode, validatePhoneNumber } from "@/lib/phone-validation"
import { cn } from "@/lib/utils"

interface PhoneInputProps {
  value?: string
  onChange?: (formattedPhone: string) => void
  onRawChange?: (countryCode: string, number: string) => void
  error?: string
  required?: boolean
  className?: string
  id?: string
  name?: string
  label?: string
}

export function PhoneInput({
  value = "",
  onChange,
  onRawChange,
  error: externalError,
  required = false,
  className,
  id = "phone",
  name = "phone",
  label = "Phone Number",
}: PhoneInputProps) {
  const parsed = React.useMemo(() => parsePhoneWithCountryCode(value), [value])
  const [countryCode, setCountryCode] = React.useState<string>(parsed.countryCode)
  const [number, setNumber] = React.useState<string>(parsed.number)
  const [touched, setTouched] = React.useState(false)

  // Keep internal state in sync with external value if value changes outside
  React.useEffect(() => {
    const p = parsePhoneWithCountryCode(value)
    setCountryCode(p.countryCode)
    setNumber(p.number)
  }, [value])

  const validation = React.useMemo(() => {
    return validatePhoneNumber(countryCode, number, required)
  }, [countryCode, number, required])

  const activeError = externalError || (touched && !validation.isValid ? validation.error : undefined)

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value
    setCountryCode(newCode)
    setTouched(true)
    const res = validatePhoneNumber(newCode, number, required)
    if (onChange) onChange(res.formatted || (number ? `${newCode}${number}` : ""))
    if (onRawChange) onRawChange(newCode, number)
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNum = e.target.value
    setNumber(newNum)
    setTouched(true)
    const res = validatePhoneNumber(countryCode, newNum, required)
    if (onChange) onChange(res.formatted || (newNum ? `${countryCode}${newNum}` : ""))
    if (onRawChange) onRawChange(countryCode, newNum)
  }

  const currentCountryObj = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0]

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex gap-2">
        {/* Country Code Select */}
        <div className="relative shrink-0">
          <select
            value={countryCode}
            onChange={handleCountryCodeChange}
            className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code} ({c.country})
              </option>
            ))}
          </select>
        </div>

        {/* Phone Number Input */}
        <div className="flex-1">
          <Input
            id={id}
            name={name}
            type="tel"
            value={number}
            onChange={handleNumberChange}
            onBlur={() => setTouched(true)}
            placeholder={currentCountryObj.placeholder}
            className={cn(activeError && "border-destructive focus-visible:ring-destructive/20")}
          />
        </div>
      </div>

      {/* Hidden input to ensure standard form submission submits formatted phone */}
      <input type="hidden" name={`${name}_formatted`} value={validation.formatted} />

      {activeError && (
        <p className="text-xs text-red-500 font-medium mt-1">{activeError}</p>
      )}
    </div>
  )
}
