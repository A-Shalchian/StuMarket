-- ============================================================
-- FIX MARKETPLACE RLS POLICIES
-- Run this to allow public browsing of the marketplace
-- ============================================================

-- Allow anyone to view profiles (needed for seller info in marketplace)
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- Allow anyone to view active listings
DROP POLICY IF EXISTS "Verified students can view active listings" ON public.listings;
DROP POLICY IF EXISTS "Anyone can view active listings" ON public.listings;
CREATE POLICY "Anyone can view active listings"
  ON public.listings FOR SELECT
  USING (status = 'active');

-- Allow anyone to view images for active listings
DROP POLICY IF EXISTS "Users can view listing images" ON public.listing_images;
DROP POLICY IF EXISTS "Anyone can view listing images" ON public.listing_images;
CREATE POLICY "Anyone can view listing images"
  ON public.listing_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_id
      AND listings.status = 'active'
    )
  );

-- Users can still view images for their own listings (any status)
DROP POLICY IF EXISTS "Users can view own listing images" ON public.listing_images;
CREATE POLICY "Users can view own listing images"
  ON public.listing_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_id
      AND listings.seller_id = auth.uid()
    )
  );
