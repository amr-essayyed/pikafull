export interface CountryCode {
  code: string
  flag: string
  country: string
  name: string
  placeholder: string
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: "+20", flag: "🇪🇬", country: "Egypt", name: "Egypt (+20)", placeholder: "1012345678" },
  { code: "+966", flag: "🇸🇦", country: "Saudi Arabia", name: "Saudi Arabia (+966)", placeholder: "512345678" },
  { code: "+971", flag: "🇦🇪", country: "UAE", name: "UAE (+971)", placeholder: "501234567" },
  { code: "+965", flag: "🇰🇼", country: "Kuwait", name: "Kuwait (+965)", placeholder: "51234567" },
  { code: "+974", flag: "🇶🇦", country: "Qatar", name: "Qatar (+974)", placeholder: "55123456" },
  { code: "+968", flag: "🇴🇲", country: "Oman", name: "Oman (+968)", placeholder: "91234567" },
  { code: "+973", flag: "🇧🇭", country: "Bahrain", name: "Bahrain (+973)", placeholder: "31234567" },
  { code: "+962", flag: "🇯🇴", country: "Jordan", name: "Jordan (+962)", placeholder: "791234567" },
  { code: "+961", flag: "🇱🇧", country: "Lebanon", name: "Lebanon (+961)", placeholder: "71234567" },
  { code: "+44", flag: "🇬🇧", country: "United Kingdom", name: "UK (+44)", placeholder: "7123456789" },
  { code: "+1", flag: "🇺🇸", country: "United States", name: "USA (+1)", placeholder: "2025550123" },
]

export function parsePhoneWithCountryCode(fullPhone: string | undefined | null) {
  if (!fullPhone) return { countryCode: "+20", number: "" }
  const trimmed = fullPhone.trim()
  
  // Try to match standard "+20..." prefix first
  for (const item of COUNTRY_CODES) {
    if (trimmed.startsWith(item.code)) {
      const numberPart = trimmed.slice(item.code.length).trim()
      return { countryCode: item.code, number: numberPart }
    }
  }
  
  // Default to +20 (Egypt) if no country code prefix is present
  return { countryCode: "+20", number: trimmed }
}

export function validatePhoneNumber(
  countryCode: string, 
  number: string, 
  required = false
): { isValid: boolean; error?: string; formatted: string } {
  const cleanNumber = number.trim().replace(/[\s\-\(\)]/g, "")
  
  if (!cleanNumber) {
    if (required) {
      return { isValid: false, error: "Phone number is required", formatted: "" }
    }
    return { isValid: true, formatted: "" }
  }

  // Ensure digit characters only
  if (!/^\d+$/.test(cleanNumber)) {
    return { isValid: false, error: "Phone number must contain numbers only", formatted: "" }
  }

  if (countryCode === "+20") {
    // Egypt validation:
    // Mobile numbers in Egypt start with 010, 011, 012, or 015 followed by 8 digits (total 11 digits with 0, or 10 digits without 0)
    if (/^0?1[0125]\d{8}$/.test(cleanNumber)) {
      const stripped = cleanNumber.startsWith("0") ? cleanNumber.slice(1) : cleanNumber
      return { isValid: true, formatted: `${countryCode}${stripped}` }
    }
    return { 
      isValid: false, 
      error: "Invalid Egyptian phone number. Must start with 010, 011, 012, or 015 followed by 8 digits.",
      formatted: ""
    }
  }

  // General validation for other country codes (7 to 14 digits)
  if (cleanNumber.length >= 7 && cleanNumber.length <= 14) {
    return { isValid: true, formatted: `${countryCode}${cleanNumber}` }
  }

  return { isValid: false, error: "Invalid phone number length for selected country", formatted: "" }
}
