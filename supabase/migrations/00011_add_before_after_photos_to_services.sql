-- Add before_image_url and after_image_url to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS before_image_url TEXT DEFAULT '';
ALTER TABLE services ADD COLUMN IF NOT EXISTS after_image_url TEXT DEFAULT '';

-- Create storage bucket for services if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('services', 'services', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for services bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'services_public_read' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "services_public_read" ON storage.objects
      FOR SELECT USING (bucket_id = 'services');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'services_authenticated_upload' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "services_authenticated_upload" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'services' AND auth.uid() IS NOT NULL);
  END IF;
END
$$;

-- Update existing services with stock Before & After images from Unsplash
UPDATE services 
SET 
  before_image_url = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
  after_image_url = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'
WHERE slug = 'regular-cleaning' OR slug = 'regular';

UPDATE services 
SET 
  before_image_url = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=80',
  after_image_url = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80'
WHERE slug = 'deep-cleaning' OR slug = 'deep';

UPDATE services 
SET 
  before_image_url = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
  after_image_url = 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80'
WHERE slug = 'end-of-tenancy';

UPDATE services 
SET 
  before_image_url = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80',
  after_image_url = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80'
WHERE slug = 'office-cleaning' OR slug = 'office';

UPDATE services 
SET 
  before_image_url = 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80',
  after_image_url = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80'
WHERE slug = 'after-party-cleaning';

UPDATE services 
SET 
  before_image_url = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80',
  after_image_url = 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1000&q=80'
WHERE slug = 'carpet-cleaning';
