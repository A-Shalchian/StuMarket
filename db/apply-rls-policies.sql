-- ============================================================
-- APPLY RLS POLICIES AFTER MIGRATION
-- Run this AFTER running migration-fix-relationships.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- CATEGORIES POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
CREATE POLICY "Anyone can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = true OR auth.uid() IS NOT NULL);

-- ============================================================
-- LISTINGS POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Verified students can view active listings" ON public.listings;
CREATE POLICY "Verified students can view active listings"
  ON public.listings FOR SELECT
  USING (status = 'active');

DROP POLICY IF EXISTS "Users can view own listings" ON public.listings;
CREATE POLICY "Users can view own listings"
  ON public.listings FOR SELECT
  USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Verified students can create listings" ON public.listings;
CREATE POLICY "Verified students can create listings"
  ON public.listings FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can update own listings" ON public.listings;
CREATE POLICY "Users can update own listings"
  ON public.listings FOR UPDATE
  USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can delete own listings" ON public.listings;
CREATE POLICY "Users can delete own listings"
  ON public.listings FOR DELETE
  USING (auth.uid() = seller_id);

-- ============================================================
-- LISTING IMAGES POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users can view listing images" ON public.listing_images;
CREATE POLICY "Users can view listing images"
  ON public.listing_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_id
      AND (
        listings.status = 'active' OR
        listings.seller_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Sellers can manage own listing images" ON public.listing_images;
CREATE POLICY "Sellers can manage own listing images"
  ON public.listing_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_id
      AND listings.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_id
      AND listings.seller_id = auth.uid()
    )
  );

-- ============================================================
-- BASIC PERMISSIONS
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant table permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant limited permissions to anonymous users (read-only for public data)
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.listings TO anon;
GRANT SELECT ON public.listing_images TO anon;

-- Grant sequence usage
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

SELECT 'RLS policies applied successfully!' AS status;
