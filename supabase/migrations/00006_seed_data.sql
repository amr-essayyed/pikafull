-- ============================================
-- Seed Data
-- ============================================

-- ----------------------------------------
-- Company Settings (singleton)
-- ----------------------------------------
INSERT INTO company_settings (
  company_name, email, phone, whatsapp, address, city, country,
  currency, currency_symbol, tax_rate, booking_lead_hours, cancellation_hours
) VALUES (
  'SparkleClean Pro',
  'info@sparklecleanpro.com',
  '+44 20 1234 5678',
  '+442012345678',
  '123 Clean Street, Mayfair',
  'London',
  'United Kingdom',
  'GBP',
  '£',
  20.00,
  24,
  48
);

-- ----------------------------------------
-- Services
-- ----------------------------------------
INSERT INTO services (name, slug, description, short_description, icon, base_price, duration_minutes, sort_order) VALUES
(
  'Regular Cleaning',
  'regular-cleaning',
  'Our standard cleaning service covers all essential areas of your home. Includes dusting, vacuuming, mopping, kitchen cleaning, and bathroom sanitization. Perfect for maintaining a clean and healthy living environment.',
  'Thorough cleaning of all rooms including kitchen and bathrooms',
  'sparkles',
  80.00,
  120,
  1
),
(
  'Deep Cleaning',
  'deep-cleaning',
  'An intensive top-to-bottom cleaning that reaches every corner. Includes inside oven cleaning, behind appliances, inside cupboards, window sills, skirting boards, and detailed bathroom descaling. Recommended every 3-6 months.',
  'Intensive cleaning including hard-to-reach areas and appliances',
  'zap',
  150.00,
  240,
  2
),
(
  'End of Tenancy',
  'end-of-tenancy',
  'Professional cleaning designed to meet landlord and letting agent standards. Covers every room in detail with special attention to kitchens and bathrooms. Helps ensure you get your deposit back.',
  'Meet landlord standards and get your deposit back',
  'home',
  200.00,
  360,
  3
),
(
  'Office Cleaning',
  'office-cleaning',
  'Keep your workspace pristine with our commercial cleaning service. Includes desk sanitization, floor cleaning, kitchen area, restrooms, and reception areas. Available for offices of all sizes.',
  'Professional cleaning for offices and commercial spaces',
  'building',
  120.00,
  180,
  4
),
(
  'After Party Cleaning',
  'after-party-cleaning',
  'Had a great party? Let us handle the aftermath. We will take care of all the mess, from spills and stains to rubbish removal and kitchen deep clean. Your home will be back to normal in no time.',
  'Post-event cleanup to restore your home to pristine condition',
  'party-popper',
  130.00,
  180,
  5
),
(
  'Carpet Cleaning',
  'carpet-cleaning',
  'Professional carpet and upholstery cleaning using state-of-the-art equipment. Removes deep-seated dirt, stains, allergens, and odours. Available for residential and commercial properties.',
  'Professional carpet and upholstery deep cleaning',
  'layers',
  100.00,
  120,
  6
);

-- ----------------------------------------
-- Extra Services
-- ----------------------------------------
INSERT INTO extra_services (name, description, price, duration_minutes, icon, sort_order) VALUES
('Inside Oven Cleaning', 'Deep clean inside your oven, removing grease and burnt-on food', 35.00, 45, 'flame', 1),
('Inside Fridge Cleaning', 'Thorough cleaning and sanitization of your refrigerator', 25.00, 30, 'thermometer-snowflake', 2),
('Inside Windows', 'Interior window cleaning including frames and sills', 30.00, 40, 'square', 3),
('Laundry & Ironing', 'Washing, drying, and ironing of your laundry', 25.00, 60, 'shirt', 4),
('Balcony Cleaning', 'Sweep, mop, and wipe down your balcony area', 20.00, 30, 'sun', 5),
('Wall Spot Cleaning', 'Remove marks and stains from walls', 15.00, 20, 'paintbrush', 6),
('Cabinet Interior Cleaning', 'Wipe down inside all kitchen and bathroom cabinets', 30.00, 45, 'archive', 7),
('Garage Cleaning', 'Sweep, organize, and clean your garage space', 45.00, 60, 'warehouse', 8);

-- ----------------------------------------
-- Pricing Rules
-- ----------------------------------------
-- Bedroom-based modifiers
INSERT INTO pricing_rules (property_type, min_bedrooms, max_bedrooms, price_modifier, label) VALUES
(NULL, 1, 1, 0, '1 Bedroom'),
(NULL, 2, 2, 20, '2 Bedrooms'),
(NULL, 3, 3, 40, '3 Bedrooms'),
(NULL, 4, 4, 60, '4 Bedrooms'),
(NULL, 5, 99, 80, '5+ Bedrooms');

-- Bathroom-based modifiers
INSERT INTO pricing_rules (property_type, min_bathrooms, max_bathrooms, price_modifier, label) VALUES
(NULL, 1, 1, 0, '1 Bathroom'),
(NULL, 2, 2, 15, '2 Bathrooms'),
(NULL, 3, 3, 30, '3 Bathrooms'),
(NULL, 4, 99, 45, '4+ Bathrooms');

-- Weekend surcharge
INSERT INTO pricing_rules (is_weekend, multiplier, price_modifier, label) VALUES
(TRUE, 1.0, 20, 'Weekend Surcharge');

-- ----------------------------------------
-- FAQ Items
-- ----------------------------------------
INSERT INTO faq_items (question, answer, category, sort_order) VALUES
('كيف أحجز خدمة تنظيف؟', 'يمكنك الحجز عبر الإنترنت من خلال موقعنا، أو الاتصال بنا، أو إرسال رسالة عبر واتساب. نظام الحجز متاح على مدار الساعة.', 'Booking', 1),
('ما هي منتجات التنظيف المستخدمة؟', 'نستخدم منتجات احترافية وصديقة للبيئة آمنة للأطفال والحيوانات الأليفة. يرجى إعلامنا إذا كان لديك أي حساسية.', 'Service', 2),
('هل يجب أن أكون في المنزل أثناء التنظيف؟', 'لا، الكثير من عملائنا يتركون لنا المفتاح. نحن مؤمنون بالكامل ويتم فحص خلفية جميع عمالنا.', 'Service', 3),
('ما هي سياسة الإلغاء؟', 'نطلب إشعاراً مسبقاً قبل 48 ساعة على الأقل للإلغاء. قد يتم خصم 50% من قيمة الحجز عند الإلغاء المتأخر.', 'Booking', 4),
('هل عمال النظافة مؤمن عليهم؟', 'نعم، جميع عمالنا مؤمن عليهم بالكامل بتأمين مسؤولية يصل إلى 5 ملايين جنيه إسترليني.', 'Trust', 5),
('كم من الوقت يستغرق التنظيف العادي؟', 'يستغرق التنظيف العادي لشقة من غرفتي نوم حوالي 2-3 ساعات. التنظيف العميق ونهاية الإيجار يستغرق وقتاً أطول.', 'Service', 6),
('هل تحضرون معداتكم الخاصة؟', 'نعم، يأتي عمالنا مجهزين بالكامل بكافة أدوات التنظيف. لكن نطلب منك توفير مكنسة كهربائية تعمل.', 'Service', 7),
('ما هي المناطق التي تغطونها؟', 'نحن نغطي جميع أنحاء لندن الكبرى بما في ذلك وستمنستر وكامدن وكينسينغتون وتشيلسي وغيرها.', 'General', 8),
('هل يمكنني طلب نفس عامل النظافة كل مرة؟', 'بالتأكيد! يمكنك طلب عامل نظافة مفضل عند الحجز لبناء علاقة موثوقة.', 'Service', 9),
('ما هي طرق الدفع المتاحة؟', 'نقبل الدفع النقدي، التحويل البنكي، وبطاقات الائتمان. الدفع مستحق في يوم التنظيف.', 'Payment', 10);

-- ----------------------------------------
-- Testimonials
-- ----------------------------------------
INSERT INTO testimonials (customer_name, content, rating, service_name, is_featured, sort_order) VALUES
('سارة ميتشل', 'سباركل كلين برو حوّلوا شقتي بالكامل! كان الفريق محترفاً وترك كل شيء نظيفاً ولامعاً.', 5, 'تنظيف عادي', TRUE, 1),
('جيمس طومسون', 'استخدمت خدمة نهاية الإيجار واستعدت وديعتي بالكامل. الاهتمام بالتفاصيل كان رائعاً!', 5, 'نهاية الإيجار', TRUE, 2),
('إيما ريتشاردسون', 'لم يبدُ مكتبنا أفضل من قبل. الفريق موثوق وفعال ويسعى دائماً لتقديم الأفضل.', 5, 'تنظيف المكاتب', TRUE, 3),
('ديفيد تشن', 'خدمة التنظيف العميق كانت تستحق التجربة. أزالوا بقعاً ظننا أنها دائمة.', 5, 'تنظيف عميق', TRUE, 4),
('ليزا أوكافور', 'بعد حفلنا، أنقذتنا سباركل كلين. أتوا في الصباح وأعادوا كل شيء لطبيعته خلال ساعات.', 5, 'تنظيف بعد الحفلات', TRUE, 5),
('مايكل بيترز', 'ودودون، محترفون، وقيمة ممتازة مقابل المال. لم يخذلوني أبداً.', 4, 'تنظيف عادي', TRUE, 6);

-- ----------------------------------------
-- Gallery Images (placeholder URLs)
-- ----------------------------------------
INSERT INTO gallery_images (title, description, is_featured, sort_order) VALUES
('تنظيف عميق للمطبخ', 'تحول كامل للمطبخ مع إزالة الدهون والتعقيم', TRUE, 1),
('تجديد الحمام', 'إزالة الترسبات الكلسية والتنظيف العميق للحمام', TRUE, 2),
('تجديد غرفة المعيشة', 'تنظيف عميق لغرفة المعيشة بما في ذلك السجاد والأثاث', TRUE, 3),
('تنظيف المساحات المكتبية', 'تنظيف المساحات المكتبية التجارية وفقاً للمعايير المهنية', FALSE, 4),
('نتيجة نهاية الإيجار', 'تنظيف العقار وفقاً للمعايير المعتمدة من الملاك', TRUE, 5),
('تحويل السجاد', 'تنظيف احترافي للسجاد يزيل البقع العميقة', FALSE, 6);
