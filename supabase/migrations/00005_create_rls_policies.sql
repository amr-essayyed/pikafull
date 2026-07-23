-- ============================================
-- Row Level Security Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE extra_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Helper function to get current user's role
-- ============================================
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if current user is owner or staff
CREATE OR REPLACE FUNCTION is_admin_or_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('owner', 'staff')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if current user is owner
CREATE OR REPLACE FUNCTION is_owner()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'owner'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- PROFILES
-- ============================================
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid() OR is_admin_or_staff());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid() OR is_owner());

CREATE POLICY "profiles_insert_admin" ON profiles
  FOR INSERT WITH CHECK (is_owner());

CREATE POLICY "profiles_delete_admin" ON profiles
  FOR DELETE USING (is_owner());

-- ============================================
-- CUSTOMERS
-- ============================================
CREATE POLICY "customers_select" ON customers
  FOR SELECT USING (
    profile_id = auth.uid()
    OR is_admin_or_staff()
    OR (get_user_role() = 'employee' AND EXISTS (
      SELECT 1 FROM bookings b
      JOIN employees e ON e.id = b.employee_id
      WHERE b.customer_id = customers.id AND e.profile_id = auth.uid()
    ))
  );

CREATE POLICY "customers_insert" ON customers
  FOR INSERT WITH CHECK (profile_id = auth.uid() OR is_admin_or_staff());

CREATE POLICY "customers_update" ON customers
  FOR UPDATE USING (profile_id = auth.uid() OR is_admin_or_staff());

CREATE POLICY "customers_delete" ON customers
  FOR DELETE USING (is_owner());

-- ============================================
-- EMPLOYEES
-- ============================================
CREATE POLICY "employees_select" ON employees
  FOR SELECT USING (profile_id = auth.uid() OR is_admin_or_staff());

CREATE POLICY "employees_update" ON employees
  FOR UPDATE USING (profile_id = auth.uid() OR is_owner());

CREATE POLICY "employees_insert" ON employees
  FOR INSERT WITH CHECK (is_owner());

CREATE POLICY "employees_delete" ON employees
  FOR DELETE USING (is_owner());

-- ============================================
-- ADDRESSES
-- ============================================
CREATE POLICY "addresses_select" ON addresses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM customers WHERE customers.id = addresses.customer_id AND customers.profile_id = auth.uid())
    OR is_admin_or_staff()
    OR (get_user_role() = 'employee' AND EXISTS (
      SELECT 1 FROM bookings b
      JOIN employees e ON e.id = b.employee_id
      WHERE b.address_id = addresses.id AND e.profile_id = auth.uid()
    ))
  );

CREATE POLICY "addresses_insert" ON addresses
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM customers WHERE customers.id = addresses.customer_id AND customers.profile_id = auth.uid())
    OR is_admin_or_staff()
  );

CREATE POLICY "addresses_update" ON addresses
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM customers WHERE customers.id = addresses.customer_id AND customers.profile_id = auth.uid())
    OR is_admin_or_staff()
  );

CREATE POLICY "addresses_delete" ON addresses
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM customers WHERE customers.id = addresses.customer_id AND customers.profile_id = auth.uid())
    OR is_admin_or_staff()
  );

-- ============================================
-- SERVICES (public read for active ones)
-- ============================================
CREATE POLICY "services_select" ON services
  FOR SELECT USING (is_active = TRUE OR is_admin_or_staff());

CREATE POLICY "services_insert" ON services
  FOR INSERT WITH CHECK (is_owner());

CREATE POLICY "services_update" ON services
  FOR UPDATE USING (is_owner());

CREATE POLICY "services_delete" ON services
  FOR DELETE USING (is_owner());

-- Allow anonymous read of active services (for public website)
CREATE POLICY "services_public_read" ON services
  FOR SELECT TO anon USING (is_active = TRUE);

-- ============================================
-- EXTRA SERVICES
-- ============================================
CREATE POLICY "extra_services_select" ON extra_services
  FOR SELECT USING (is_active = TRUE OR is_admin_or_staff());

CREATE POLICY "extra_services_insert" ON extra_services
  FOR INSERT WITH CHECK (is_owner());

CREATE POLICY "extra_services_update" ON extra_services
  FOR UPDATE USING (is_owner());

CREATE POLICY "extra_services_public_read" ON extra_services
  FOR SELECT TO anon USING (is_active = TRUE);

-- ============================================
-- PRICING RULES
-- ============================================
CREATE POLICY "pricing_rules_select" ON pricing_rules
  FOR SELECT USING (TRUE);

CREATE POLICY "pricing_rules_insert" ON pricing_rules
  FOR INSERT WITH CHECK (is_owner());

CREATE POLICY "pricing_rules_update" ON pricing_rules
  FOR UPDATE USING (is_owner());

CREATE POLICY "pricing_rules_delete" ON pricing_rules
  FOR DELETE USING (is_owner());

-- ============================================
-- BOOKINGS
-- ============================================
CREATE POLICY "bookings_select" ON bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM customers WHERE customers.id = bookings.customer_id AND customers.profile_id = auth.uid())
    OR EXISTS (SELECT 1 FROM employees WHERE employees.id = bookings.employee_id AND employees.profile_id = auth.uid())
    OR is_admin_or_staff()
  );

CREATE POLICY "bookings_insert" ON bookings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM customers WHERE customers.id = bookings.customer_id AND customers.profile_id = auth.uid())
    OR is_admin_or_staff()
  );

CREATE POLICY "bookings_update" ON bookings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM employees WHERE employees.id = bookings.employee_id AND employees.profile_id = auth.uid())
    OR is_admin_or_staff()
  );

CREATE POLICY "bookings_delete" ON bookings
  FOR DELETE USING (is_owner());

-- ============================================
-- BOOKING EXTRAS
-- ============================================
CREATE POLICY "booking_extras_select" ON booking_extras
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = booking_extras.booking_id AND (
        EXISTS (SELECT 1 FROM customers c WHERE c.id = b.customer_id AND c.profile_id = auth.uid())
        OR EXISTS (SELECT 1 FROM employees e WHERE e.id = b.employee_id AND e.profile_id = auth.uid())
        OR is_admin_or_staff()
      )
    )
  );

CREATE POLICY "booking_extras_insert" ON booking_extras
  FOR INSERT WITH CHECK (is_admin_or_staff() OR EXISTS (
    SELECT 1 FROM bookings b
    JOIN customers c ON c.id = b.customer_id
    WHERE b.id = booking_extras.booking_id AND c.profile_id = auth.uid()
  ));

-- ============================================
-- BOOKING PHOTOS
-- ============================================
CREATE POLICY "booking_photos_select" ON booking_photos
  FOR SELECT USING (
    uploaded_by = auth.uid() OR is_admin_or_staff()
    OR EXISTS (
      SELECT 1 FROM bookings b
      JOIN customers c ON c.id = b.customer_id
      WHERE b.id = booking_photos.booking_id AND c.profile_id = auth.uid()
    )
  );

CREATE POLICY "booking_photos_insert" ON booking_photos
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() OR is_admin_or_staff()
  );

-- ============================================
-- BOOKING HISTORY
-- ============================================
CREATE POLICY "booking_history_select" ON booking_history
  FOR SELECT USING (is_admin_or_staff() OR changed_by = auth.uid());

CREATE POLICY "booking_history_insert" ON booking_history
  FOR INSERT WITH CHECK (changed_by = auth.uid() OR is_admin_or_staff());

-- ============================================
-- EMPLOYEE AVAILABILITY
-- ============================================
CREATE POLICY "availability_select" ON employee_availability
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM employees WHERE employees.id = employee_availability.employee_id AND employees.profile_id = auth.uid())
    OR is_admin_or_staff()
  );

CREATE POLICY "availability_manage" ON employee_availability
  FOR ALL USING (
    EXISTS (SELECT 1 FROM employees WHERE employees.id = employee_availability.employee_id AND employees.profile_id = auth.uid())
    OR is_owner()
  );

-- ============================================
-- COUPONS
-- ============================================
CREATE POLICY "coupons_select" ON coupons
  FOR SELECT USING (is_admin_or_staff() OR (is_active = TRUE AND valid_until > NOW()));

CREATE POLICY "coupons_manage" ON coupons
  FOR ALL USING (is_owner());

CREATE POLICY "coupons_public_validate" ON coupons
  FOR SELECT TO anon USING (is_active = TRUE AND valid_until > NOW());

-- ============================================
-- REVIEWS
-- ============================================
CREATE POLICY "reviews_select" ON reviews
  FOR SELECT USING (
    is_approved = TRUE
    OR EXISTS (SELECT 1 FROM customers WHERE customers.id = reviews.customer_id AND customers.profile_id = auth.uid())
    OR is_admin_or_staff()
  );

CREATE POLICY "reviews_insert" ON reviews
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM customers WHERE customers.id = reviews.customer_id AND customers.profile_id = auth.uid())
  );

CREATE POLICY "reviews_update" ON reviews
  FOR UPDATE USING (is_admin_or_staff());

CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT TO anon USING (is_approved = TRUE);

-- ============================================
-- GALLERY IMAGES (public read)
-- ============================================
CREATE POLICY "gallery_select" ON gallery_images
  FOR SELECT USING (TRUE);

CREATE POLICY "gallery_manage" ON gallery_images
  FOR ALL USING (is_admin_or_staff());

-- ============================================
-- TESTIMONIALS (public read)
-- ============================================
CREATE POLICY "testimonials_select" ON testimonials
  FOR SELECT USING (TRUE);

CREATE POLICY "testimonials_manage" ON testimonials
  FOR ALL USING (is_admin_or_staff());

-- ============================================
-- BLOG POSTS
-- ============================================
CREATE POLICY "blog_select" ON blog_posts
  FOR SELECT USING (status = 'published' OR is_admin_or_staff());

CREATE POLICY "blog_manage" ON blog_posts
  FOR ALL USING (is_admin_or_staff());

CREATE POLICY "blog_public_read" ON blog_posts
  FOR SELECT TO anon USING (status = 'published');

-- ============================================
-- FAQ ITEMS (public read)
-- ============================================
CREATE POLICY "faq_select" ON faq_items
  FOR SELECT USING (TRUE);

CREATE POLICY "faq_manage" ON faq_items
  FOR ALL USING (is_admin_or_staff());

-- ============================================
-- INVOICES
-- ============================================
CREATE POLICY "invoices_select" ON invoices
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM customers WHERE customers.id = invoices.customer_id AND customers.profile_id = auth.uid())
    OR is_admin_or_staff()
  );

CREATE POLICY "invoices_manage" ON invoices
  FOR ALL USING (is_admin_or_staff());

-- ============================================
-- PAYMENTS
-- ============================================
CREATE POLICY "payments_select" ON payments
  FOR SELECT USING (
    is_admin_or_staff()
    OR EXISTS (
      SELECT 1 FROM invoices i
      JOIN customers c ON c.id = i.customer_id
      WHERE i.id = payments.invoice_id AND c.profile_id = auth.uid()
    )
  );

CREATE POLICY "payments_insert" ON payments
  FOR INSERT WITH CHECK (is_admin_or_staff() OR get_user_role() = 'employee');

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE POLICY "notifications_select" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT WITH CHECK (is_admin_or_staff());

-- ============================================
-- COMPANY SETTINGS
-- ============================================
CREATE POLICY "settings_select" ON company_settings
  FOR SELECT USING (TRUE);

CREATE POLICY "settings_manage" ON company_settings
  FOR ALL USING (is_owner());

-- ============================================
-- AUDIT LOGS
-- ============================================
CREATE POLICY "audit_select" ON audit_logs
  FOR SELECT USING (is_owner());

CREATE POLICY "audit_insert" ON audit_logs
  FOR INSERT WITH CHECK (TRUE);

-- ============================================
-- Storage Buckets
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('gallery', 'gallery', TRUE),
  ('avatars', 'avatars', TRUE),
  ('booking-photos', 'booking-photos', FALSE),
  ('invoices', 'invoices', FALSE),
  ('company', 'company', TRUE);

-- Storage policies
CREATE POLICY "gallery_public_read" ON storage.objects
  FOR SELECT TO anon USING (bucket_id = 'gallery');

CREATE POLICY "gallery_admin_manage" ON storage.objects
  FOR ALL USING (bucket_id = 'gallery' AND is_admin_or_staff());

CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_user_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "booking_photos_access" ON storage.objects
  FOR SELECT USING (bucket_id = 'booking-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "booking_photos_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'booking-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "company_public_read" ON storage.objects
  FOR SELECT TO anon USING (bucket_id = 'company');

CREATE POLICY "company_admin_manage" ON storage.objects
  FOR ALL USING (bucket_id = 'company' AND is_owner());

-- ============================================
-- Enable Realtime for key tables
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE booking_history;
