-- ============================================
-- Booking & Service Tables
-- ============================================

-- ----------------------------------------
-- Services
-- ----------------------------------------
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  short_description TEXT DEFAULT '',
  icon TEXT DEFAULT 'sparkles',
  image_url TEXT DEFAULT '',
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 120,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ----------------------------------------
-- Extra Services
-- ----------------------------------------
CREATE TABLE extra_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  icon TEXT DEFAULT 'plus',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------
-- Pricing Rules
-- ----------------------------------------
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  property_type property_type,
  min_bedrooms INTEGER DEFAULT 0,
  max_bedrooms INTEGER DEFAULT 99,
  min_bathrooms INTEGER DEFAULT 0,
  max_bathrooms INTEGER DEFAULT 99,
  price_modifier DECIMAL(10,2) NOT NULL DEFAULT 0,
  multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.0,
  is_weekend BOOLEAN NOT NULL DEFAULT FALSE,
  is_holiday BOOLEAN NOT NULL DEFAULT FALSE,
  label TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pricing_rules_service ON pricing_rules(service_id);

-- ----------------------------------------
-- Coupons
-- ----------------------------------------
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  discount_type discount_type NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  used_count INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------
-- Bookings
-- ----------------------------------------
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  address_id UUID NOT NULL REFERENCES addresses(id) ON DELETE RESTRICT,
  status booking_status NOT NULL DEFAULT 'pending',
  property_type property_type NOT NULL DEFAULT 'apartment',
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  property_size_sqft INTEGER,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  estimated_duration INTEGER NOT NULL DEFAULT 120,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  extras_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  customer_notes TEXT DEFAULT '',
  employee_notes TEXT DEFAULT '',
  coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_employee ON bookings(employee_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(scheduled_date);
CREATE INDEX idx_bookings_number ON bookings(booking_number);

CREATE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-generate booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
DECLARE
  today_count INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO today_count
  FROM bookings
  WHERE DATE(created_at) = CURRENT_DATE;

  NEW.booking_number := 'BK-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(today_count::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_booking_number
  BEFORE INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.booking_number IS NULL OR NEW.booking_number = '')
  EXECUTE FUNCTION generate_booking_number();

-- ----------------------------------------
-- Booking Extras (junction table)
-- ----------------------------------------
CREATE TABLE booking_extras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  extra_service_id UUID NOT NULL REFERENCES extra_services(id) ON DELETE RESTRICT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_booking_extras_booking ON booking_extras(booking_id);

-- ----------------------------------------
-- Booking Photos
-- ----------------------------------------
CREATE TABLE booking_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('before', 'after')),
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_booking_photos_booking ON booking_photos(booking_id);

-- ----------------------------------------
-- Booking History (audit trail)
-- ----------------------------------------
CREATE TABLE booking_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  old_status booking_status,
  new_status booking_status NOT NULL,
  changed_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_booking_history_booking ON booking_history(booking_id);

-- ----------------------------------------
-- Employee Availability
-- ----------------------------------------
CREATE TABLE employee_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  day_of_week day_of_week NOT NULL,
  start_time TIME NOT NULL DEFAULT '08:00',
  end_time TIME NOT NULL DEFAULT '18:00',
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(employee_id, day_of_week)
);

CREATE INDEX idx_availability_employee ON employee_availability(employee_id);
