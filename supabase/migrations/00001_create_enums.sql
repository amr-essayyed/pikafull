-- ============================================
-- Cleaning Company Platform - Enum Types
-- ============================================

-- User roles
CREATE TYPE user_role AS ENUM (
  'owner',
  'staff',
  'employee',
  'customer'
);

-- Booking lifecycle statuses
CREATE TYPE booking_status AS ENUM (
  'pending',
  'confirmed',
  'assigned',
  'on_the_way',
  'in_progress',
  'completed',
  'cancelled',
  'paid'
);

-- Property types
CREATE TYPE property_type AS ENUM (
  'apartment',
  'house',
  'office',
  'studio',
  'villa',
  'other'
);

-- Payment methods
CREATE TYPE payment_method AS ENUM (
  'cash',
  'card',
  'bank_transfer',
  'online'
);

-- Payment statuses
CREATE TYPE payment_status AS ENUM (
  'pending',
  'paid',
  'refunded',
  'failed'
);

-- Days of the week
CREATE TYPE day_of_week AS ENUM (
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
);

-- Blog post statuses
CREATE TYPE blog_status AS ENUM (
  'draft',
  'published',
  'archived'
);

-- Discount types
CREATE TYPE discount_type AS ENUM (
  'percentage',
  'fixed'
);
