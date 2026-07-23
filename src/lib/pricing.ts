import { Database } from "@/types/database"

type PricingRule = Database["public"]["Tables"]["pricing_rules"]["Row"]
type Service = Database["public"]["Tables"]["services"]["Row"]
type ExtraService = Database["public"]["Tables"]["extra_services"]["Row"]

export interface PricingInput {
  service: Service
  bedrooms: number
  bathrooms: number
  propertyType: string
  extras: ExtraService[]
  isWeekend: boolean
  isHoliday: boolean
  rules: PricingRule[]
}

export interface PricingResult {
  basePrice: number
  bedroomsPrice: number
  bathroomsPrice: number
  extrasPrice: number
  subtotal: number
  weekendSurcharge: number
  holidaySurcharge: number
  total: number
  estimatedDurationMinutes: number
}

export function calculatePricing(input: PricingInput): PricingResult {
  const {
    service,
    bedrooms,
    bathrooms,
    extras,
    isWeekend,
    isHoliday,
    rules,
  } = input

  let basePrice = Number(service.base_price)
  let estimatedDurationMinutes = service.duration_minutes

  // Calculate bedroom modifier
  const bedRule = rules.find(
    r => r.min_bedrooms !== null && r.max_bedrooms !== null && 
         bedrooms >= r.min_bedrooms && bedrooms <= r.max_bedrooms
  )
  const bedroomsPrice = bedRule ? Number(bedRule.price_modifier) : 0

  // Calculate bathroom modifier
  const bathRule = rules.find(
    r => r.min_bathrooms !== null && r.max_bathrooms !== null && 
         bathrooms >= r.min_bathrooms && bathrooms <= r.max_bathrooms
  )
  const bathroomsPrice = bathRule ? Number(bathRule.price_modifier) : 0

  // Calculate extras
  let extrasPrice = 0
  extras.forEach(extra => {
    extrasPrice += Number(extra.price)
    estimatedDurationMinutes += extra.duration_minutes
  })

  // Basic subtotal
  const subtotal = basePrice + bedroomsPrice + bathroomsPrice + extrasPrice

  // Weekend and holiday rules
  const weekendRule = rules.find(r => r.is_weekend === true)
  const holidayRule = rules.find(r => r.is_holiday === true)

  let weekendSurcharge = 0
  if (isWeekend && weekendRule) {
    if (Number(weekendRule.multiplier) > 1) {
      weekendSurcharge = subtotal * (Number(weekendRule.multiplier) - 1)
    } else {
      weekendSurcharge = Number(weekendRule.price_modifier)
    }
  }

  let holidaySurcharge = 0
  if (isHoliday && holidayRule) {
    if (Number(holidayRule.multiplier) > 1) {
      holidaySurcharge = subtotal * (Number(holidayRule.multiplier) - 1)
    } else {
      holidaySurcharge = Number(holidayRule.price_modifier)
    }
  }

  const total = subtotal + weekendSurcharge + holidaySurcharge

  return {
    basePrice,
    bedroomsPrice,
    bathroomsPrice,
    extrasPrice,
    subtotal,
    weekendSurcharge,
    holidaySurcharge,
    total,
    estimatedDurationMinutes
  }
}
