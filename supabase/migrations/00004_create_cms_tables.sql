-- ============================================
-- CMS & System Tables
-- ============================================

-- ----------------------------------------
-- Reviews
-- ----------------------------------------
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_customer ON reviews(customer_id);
CREATE INDEX idx_reviews_employee ON reviews(employee_id);

-- ----------------------------------------
-- Gallery Images
-- ----------------------------------------
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  before_image_url TEXT DEFAULT '',
  after_image_url TEXT DEFAULT '',
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------
-- Testimonials
-- ----------------------------------------
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  customer_avatar TEXT DEFAULT '',
  content TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  service_name TEXT DEFAULT '',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------
-- Blog Posts
-- ----------------------------------------
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT DEFAULT '',
  content TEXT DEFAULT '',
  cover_image_url TEXT DEFAULT '',
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status blog_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);

CREATE TRIGGER set_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ----------------------------------------
-- FAQ Items
-- ----------------------------------------
CREATE TABLE faq_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------
-- Invoices
-- ----------------------------------------
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status payment_status NOT NULL DEFAULT 'pending',
  due_date DATE,
  paid_at TIMESTAMPTZ,
  pdf_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_booking ON invoices(booking_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);

CREATE TRIGGER set_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  month_count INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO month_count
  FROM invoices
  WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE);

  NEW.invoice_number := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-' || LPAD(month_count::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
  EXECUTE FUNCTION generate_invoice_number();

-- ----------------------------------------
-- Payments
-- ----------------------------------------
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method payment_method NOT NULL DEFAULT 'cash',
  transaction_id TEXT DEFAULT '',
  signature_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);

-- ----------------------------------------
-- Notifications
-- ----------------------------------------
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  action_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ----------------------------------------
-- Company Settings (singleton)
-- ----------------------------------------
CREATE TABLE company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL DEFAULT 'SparkleClean Pro',
  logo_url TEXT DEFAULT '',
  email TEXT DEFAULT 'info@sparkleclean.com',
  phone TEXT DEFAULT '+44 20 1234 5678',
  whatsapp TEXT DEFAULT '+442012345678',
  address TEXT DEFAULT '123 Clean Street',
  city TEXT DEFAULT 'London',
  country TEXT DEFAULT 'United Kingdom',
  currency TEXT NOT NULL DEFAULT 'GBP',
  currency_symbol TEXT NOT NULL DEFAULT '£',
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  booking_lead_hours INTEGER NOT NULL DEFAULT 24,
  cancellation_hours INTEGER NOT NULL DEFAULT 48,
  service_areas TEXT[] DEFAULT ARRAY['London', 'Westminster', 'Camden', 'Kensington', 'Chelsea'],
  business_hours JSONB DEFAULT '{"monday":{"open":"08:00","close":"18:00"},"tuesday":{"open":"08:00","close":"18:00"},"wednesday":{"open":"08:00","close":"18:00"},"thursday":{"open":"08:00","close":"18:00"},"friday":{"open":"08:00","close":"18:00"},"saturday":{"open":"09:00","close":"16:00"},"sunday":{"open":"closed","close":"closed"}}',
  social_links JSONB DEFAULT '{"facebook":"","instagram":"","twitter":"","linkedin":""}',
  seo_metadata JSONB DEFAULT '{"title":"SparkleClean Pro - Professional Cleaning Services","description":"Premium cleaning services in London. Book your professional cleaning today.","keywords":["cleaning","house cleaning","office cleaning","London"]}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_company_settings_updated_at
  BEFORE UPDATE ON company_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ----------------------------------------
-- Audit Logs
-- ----------------------------------------
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
