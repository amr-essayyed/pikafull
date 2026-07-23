-- Fix infinite recursion between customers and bookings policies

-- Create SECURITY DEFINER functions to break the RLS evaluation loop
CREATE OR REPLACE FUNCTION is_employee_for_customer(c_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM bookings b
    JOIN employees e ON e.id = b.employee_id
    WHERE b.customer_id = c_id AND e.profile_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_customer_owner(c_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM customers WHERE id = c_id AND profile_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_employee_owner(e_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM employees WHERE id = e_id AND profile_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Drop existing circular policies
DROP POLICY IF EXISTS "customers_select" ON customers;
DROP POLICY IF EXISTS "bookings_select" ON bookings;
DROP POLICY IF EXISTS "bookings_insert" ON bookings;
DROP POLICY IF EXISTS "bookings_update" ON bookings;
DROP POLICY IF EXISTS "addresses_select" ON addresses;
DROP POLICY IF EXISTS "addresses_insert" ON addresses;
DROP POLICY IF EXISTS "addresses_update" ON addresses;
DROP POLICY IF EXISTS "addresses_delete" ON addresses;

-- Recreate customers policy using the helper
CREATE POLICY "customers_select" ON customers
  FOR SELECT USING (
    profile_id = auth.uid()
    OR is_admin_or_staff()
    OR (get_user_role() = 'employee' AND is_employee_for_customer(id))
  );

-- Recreate bookings policies using the helpers
CREATE POLICY "bookings_select" ON bookings
  FOR SELECT USING (
    is_customer_owner(customer_id)
    OR is_employee_owner(employee_id)
    OR is_admin_or_staff()
  );

CREATE POLICY "bookings_insert" ON bookings
  FOR INSERT WITH CHECK (
    is_customer_owner(customer_id)
    OR is_admin_or_staff()
  );

CREATE POLICY "bookings_update" ON bookings
  FOR UPDATE USING (
    is_employee_owner(employee_id)
    OR is_admin_or_staff()
  );

-- Recreate addresses policies using the helpers
CREATE POLICY "addresses_select" ON addresses
  FOR SELECT USING (
    is_customer_owner(customer_id)
    OR is_admin_or_staff()
  );

CREATE POLICY "addresses_insert" ON addresses
  FOR INSERT WITH CHECK (
    is_customer_owner(customer_id)
    OR is_admin_or_staff()
  );

CREATE POLICY "addresses_update" ON addresses
  FOR UPDATE USING (
    is_customer_owner(customer_id)
    OR is_admin_or_staff()
  );

CREATE POLICY "addresses_delete" ON addresses
  FOR DELETE USING (
    is_customer_owner(customer_id)
    OR is_admin_or_staff()
  );
