export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          avatar_url: string | null
          role: 'owner' | 'staff' | 'employee' | 'customer'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          role?: 'owner' | 'staff' | 'employee' | 'customer'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          role?: 'owner' | 'staff' | 'employee' | 'customer'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          profile_id: string
          notes: string | null
          lifetime_value: number
          total_bookings: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          notes?: string | null
          lifetime_value?: number
          total_bookings?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          notes?: string | null
          lifetime_value?: number
          total_bookings?: number
          created_at?: string
          updated_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          profile_id: string
          skills: string[] | null
          hourly_rate: number | null
          bio: string | null
          avg_rating: number
          total_jobs: number
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          skills?: string[] | null
          hourly_rate?: number | null
          bio?: string | null
          avg_rating?: number
          total_jobs?: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          skills?: string[] | null
          hourly_rate?: number | null
          bio?: string | null
          avg_rating?: number
          total_jobs?: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // I will expand these as needed during development
      // For now, these are the core types needed for Auth
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'owner' | 'staff' | 'employee' | 'customer'
      booking_status: 'pending' | 'confirmed' | 'assigned' | 'on_the_way' | 'in_progress' | 'completed' | 'cancelled' | 'paid'
      property_type: 'apartment' | 'house' | 'office' | 'studio' | 'villa' | 'other'
      payment_method: 'cash' | 'card' | 'bank_transfer' | 'online'
      payment_status: 'pending' | 'paid' | 'refunded' | 'failed'
      day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
      blog_status: 'draft' | 'published' | 'archived'
      discount_type: 'percentage' | 'fixed'
    }
  }
}
