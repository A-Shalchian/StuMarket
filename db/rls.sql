-- ============================================================
-- STUMARKET - ROW LEVEL SECURITY POLICIES
-- Run this AFTER db.sql to set up all security policies
-- ============================================================

-- ============================================================
-- HELPER FUNCTIONS (Must be defined BEFORE policies)
-- ============================================================

-- Function to check if user is verified
CREATE OR REPLACE FUNCTION is_verified_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_verified = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is moderator/admin
CREATE OR REPLACE FUNCTION is_moderator()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND account_type IN ('admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update listing view count
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.listings
  SET view_count = view_count + 1
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update event view count
CREATE OR REPLACE FUNCTION increment_event_views(event_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.events
  SET view_count = view_count + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user rating after new review
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET
    rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM public.reviews
      WHERE reviewed_user_id = NEW.reviewed_user_id AND is_visible = true
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE reviewed_user_id = NEW.reviewed_user_id AND is_visible = true
    )
  WHERE id = NEW.reviewed_user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- PROFILES TABLE POLICIES
-- ============================================================

-- Anyone can view profiles (needed for public marketplace)
-- Access control happens at application level for sensitive fields
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (or service role for triggers)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- ============================================================
-- CATEGORIES TABLE POLICIES
-- ============================================================

-- Everyone can view active categories
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
CREATE POLICY "Anyone can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = true OR auth.uid() IS NOT NULL);

-- Only admins can insert categories
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (is_moderator());

-- Only admins can update categories
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  USING (is_moderator());

-- Only admins can delete categories
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  USING (is_moderator());

-- ============================================================
-- LISTINGS TABLE POLICIES
-- ============================================================

-- Anyone can view active listings (public marketplace)
DROP POLICY IF EXISTS "Anyone can view active listings" ON public.listings;
CREATE POLICY "Anyone can view active listings"
  ON public.listings FOR SELECT
  USING (status = 'active');

-- Users can view their own listings (any status)
DROP POLICY IF EXISTS "Users can view own listings" ON public.listings;
CREATE POLICY "Users can view own listings"
  ON public.listings FOR SELECT
  USING (auth.uid() = seller_id);

-- Verified students can create listings
DROP POLICY IF EXISTS "Verified students can create listings" ON public.listings;
CREATE POLICY "Verified students can create listings"
  ON public.listings FOR INSERT
  WITH CHECK (auth.uid() = seller_id AND is_verified_user());

-- Users can update their own listings
DROP POLICY IF EXISTS "Users can update own listings" ON public.listings;
CREATE POLICY "Users can update own listings"
  ON public.listings FOR UPDATE
  USING (auth.uid() = seller_id);

-- Users can delete their own listings
DROP POLICY IF EXISTS "Users can delete own listings" ON public.listings;
CREATE POLICY "Users can delete own listings"
  ON public.listings FOR DELETE
  USING (auth.uid() = seller_id);

-- ============================================================
-- LISTING IMAGES TABLE POLICIES
-- ============================================================

-- Anyone can view images for active listings
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

-- Users can view images for their own listings (any status)
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

-- Sellers can insert images for their own listings
DROP POLICY IF EXISTS "Sellers can insert own listing images" ON public.listing_images;
CREATE POLICY "Sellers can insert own listing images"
  ON public.listing_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_id
      AND listings.seller_id = auth.uid()
    )
  );

-- Sellers can update their own listing images
DROP POLICY IF EXISTS "Sellers can update own listing images" ON public.listing_images;
CREATE POLICY "Sellers can update own listing images"
  ON public.listing_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_id
      AND listings.seller_id = auth.uid()
    )
  );

-- Sellers can delete their own listing images
DROP POLICY IF EXISTS "Sellers can delete own listing images" ON public.listing_images;
CREATE POLICY "Sellers can delete own listing images"
  ON public.listing_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_id
      AND listings.seller_id = auth.uid()
    )
  );

-- ============================================================
-- CONVERSATIONS TABLE POLICIES
-- ============================================================

-- Participants can view their conversations
DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;
CREATE POLICY "Participants can view conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Buyers can create conversations
DROP POLICY IF EXISTS "Buyers can create conversations" ON public.conversations;
CREATE POLICY "Buyers can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Participants can update conversations (for status changes)
DROP POLICY IF EXISTS "Participants can update conversations" ON public.conversations;
CREATE POLICY "Participants can update conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Participants can delete/archive conversations
DROP POLICY IF EXISTS "Participants can delete conversations" ON public.conversations;
CREATE POLICY "Participants can delete conversations"
  ON public.conversations FOR DELETE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- ============================================================
-- MESSAGES TABLE POLICIES
-- ============================================================

-- Conversation participants can view messages
DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
CREATE POLICY "Participants can view messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  );

-- Conversation participants can send messages
DROP POLICY IF EXISTS "Participants can send messages" ON public.messages;
CREATE POLICY "Participants can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  );

-- Users can update their own messages
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
CREATE POLICY "Users can update own messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = sender_id);

-- Users can delete their own messages
DROP POLICY IF EXISTS "Users can delete own messages" ON public.messages;
CREATE POLICY "Users can delete own messages"
  ON public.messages FOR DELETE
  USING (auth.uid() = sender_id);

-- ============================================================
-- EVENTS TABLE POLICIES
-- ============================================================

-- Verified students can view public events
DROP POLICY IF EXISTS "Verified students can view public events" ON public.events;
CREATE POLICY "Verified students can view public events"
  ON public.events FOR SELECT
  USING (
    (is_private = false OR auth.uid() = organizer_id) AND
    is_verified_user()
  );

-- Verified students can create events
DROP POLICY IF EXISTS "Verified students can create events" ON public.events;
CREATE POLICY "Verified students can create events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = organizer_id AND is_verified_user());

-- Organizers can update their own events
DROP POLICY IF EXISTS "Organizers can update own events" ON public.events;
CREATE POLICY "Organizers can update own events"
  ON public.events FOR UPDATE
  USING (auth.uid() = organizer_id);

-- Organizers can delete their own events
DROP POLICY IF EXISTS "Organizers can delete own events" ON public.events;
CREATE POLICY "Organizers can delete own events"
  ON public.events FOR DELETE
  USING (auth.uid() = organizer_id);

-- ============================================================
-- EVENT RSVPS TABLE POLICIES
-- ============================================================

-- Users can view RSVPs for events they can see
DROP POLICY IF EXISTS "Users can view event RSVPs" ON public.event_rsvps;
CREATE POLICY "Users can view event RSVPs"
  ON public.event_rsvps FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_id AND events.organizer_id = auth.uid()
    )
  );

-- Users can create their own RSVPs
DROP POLICY IF EXISTS "Users can create own RSVPs" ON public.event_rsvps;
CREATE POLICY "Users can create own RSVPs"
  ON public.event_rsvps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own RSVPs
DROP POLICY IF EXISTS "Users can update own RSVPs" ON public.event_rsvps;
CREATE POLICY "Users can update own RSVPs"
  ON public.event_rsvps FOR UPDATE
  USING (auth.uid() = user_id);

-- Organizers can update RSVPs for their events (approval)
DROP POLICY IF EXISTS "Organizers can update event RSVPs" ON public.event_rsvps;
CREATE POLICY "Organizers can update event RSVPs"
  ON public.event_rsvps FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_id AND events.organizer_id = auth.uid()
    )
  );

-- Users can delete their own RSVPs
DROP POLICY IF EXISTS "Users can delete own RSVPs" ON public.event_rsvps;
CREATE POLICY "Users can delete own RSVPs"
  ON public.event_rsvps FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- TRANSACTIONS TABLE POLICIES
-- ============================================================

-- Participants can view their transactions
DROP POLICY IF EXISTS "Participants can view transactions" ON public.transactions;
CREATE POLICY "Participants can view transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Buyers can create transactions
DROP POLICY IF EXISTS "Buyers can create transactions" ON public.transactions;
CREATE POLICY "Buyers can create transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Participants can update transactions
DROP POLICY IF EXISTS "Participants can update transactions" ON public.transactions;
CREATE POLICY "Participants can update transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- ============================================================
-- REVIEWS TABLE POLICIES
-- ============================================================

-- Everyone can view visible reviews
DROP POLICY IF EXISTS "Anyone can view visible reviews" ON public.reviews;
CREATE POLICY "Anyone can view visible reviews"
  ON public.reviews FOR SELECT
  USING (is_visible = true OR auth.uid() = reviewer_id);

-- Users can create reviews for transactions they participated in
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.transactions
      WHERE transactions.id = transaction_id
      AND (transactions.buyer_id = auth.uid() OR transactions.seller_id = auth.uid())
      AND transactions.status = 'completed'
    )
  );

-- Users can update their own reviews
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

-- Users can delete their own reviews
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;
CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = reviewer_id);

-- ============================================================
-- OFFERS TABLE POLICIES
-- ============================================================

-- Participants can view offers
DROP POLICY IF EXISTS "Participants can view offers" ON public.offers;
CREATE POLICY "Participants can view offers"
  ON public.offers FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Buyers can create offers
DROP POLICY IF EXISTS "Buyers can create offers" ON public.offers;
CREATE POLICY "Buyers can create offers"
  ON public.offers FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Participants can update offers
DROP POLICY IF EXISTS "Participants can update offers" ON public.offers;
CREATE POLICY "Participants can update offers"
  ON public.offers FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Buyers can delete their own offers
DROP POLICY IF EXISTS "Buyers can delete offers" ON public.offers;
CREATE POLICY "Buyers can delete offers"
  ON public.offers FOR DELETE
  USING (auth.uid() = buyer_id);

-- ============================================================
-- SAVED ITEMS TABLE POLICIES
-- ============================================================

-- Users can view their own saved items
DROP POLICY IF EXISTS "Users can view own saved items" ON public.saved_items;
CREATE POLICY "Users can view own saved items"
  ON public.saved_items FOR SELECT
  USING (auth.uid() = user_id);

-- Users can save items
DROP POLICY IF EXISTS "Users can save items" ON public.saved_items;
CREATE POLICY "Users can save items"
  ON public.saved_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own saved items
DROP POLICY IF EXISTS "Users can delete saved items" ON public.saved_items;
CREATE POLICY "Users can delete saved items"
  ON public.saved_items FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================

-- Users can view their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- System can create notifications (service role)
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Users can update their own notifications (mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- REPORTS TABLE POLICIES
-- ============================================================

-- Users can view their own reports
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Moderators can view all reports
DROP POLICY IF EXISTS "Moderators can view all reports" ON public.reports;
CREATE POLICY "Moderators can view all reports"
  ON public.reports FOR SELECT
  USING (is_moderator());

-- Verified users can create reports
DROP POLICY IF EXISTS "Verified users can create reports" ON public.reports;
CREATE POLICY "Verified users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id AND is_verified_user());

-- Moderators can update reports
DROP POLICY IF EXISTS "Moderators can update reports" ON public.reports;
CREATE POLICY "Moderators can update reports"
  ON public.reports FOR UPDATE
  USING (is_moderator());

-- ============================================================
-- BLOCKED USERS TABLE POLICIES
-- ============================================================

-- Users can view their own blocks
DROP POLICY IF EXISTS "Users can view own blocks" ON public.blocked_users;
CREATE POLICY "Users can view own blocks"
  ON public.blocked_users FOR SELECT
  USING (auth.uid() = blocker_id);

-- Users can block others
DROP POLICY IF EXISTS "Users can block others" ON public.blocked_users;
CREATE POLICY "Users can block others"
  ON public.blocked_users FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

-- Users can unblock others
DROP POLICY IF EXISTS "Users can unblock others" ON public.blocked_users;
CREATE POLICY "Users can unblock others"
  ON public.blocked_users FOR DELETE
  USING (auth.uid() = blocker_id);

-- ============================================================
-- STORAGE POLICIES - AVATARS BUCKET
-- ============================================================

-- Drop existing avatar policies
DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;

-- Users can upload avatars to their own folder
CREATE POLICY "Users can upload own avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Anyone can view avatars (public profiles)
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- Users can update their own avatars
CREATE POLICY "Users can update own avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own avatars
CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- STORAGE POLICIES - LISTING IMAGES BUCKET
-- ============================================================

-- Drop existing listing image policies
DROP POLICY IF EXISTS "Sellers can upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view listing images" ON storage.objects;
DROP POLICY IF EXISTS "Sellers can update listing images" ON storage.objects;
DROP POLICY IF EXISTS "Sellers can delete listing images" ON storage.objects;

-- Sellers can upload images to their listings folder
CREATE POLICY "Sellers can upload listing images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'listing-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Anyone can view listing images (for public marketplace)
CREATE POLICY "Anyone can view listing images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'listing-images');

-- Sellers can update their listing images
CREATE POLICY "Sellers can update listing images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'listing-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Sellers can delete their listing images
CREATE POLICY "Sellers can delete listing images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'listing-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger to update user rating when review is created
DROP TRIGGER IF EXISTS on_review_created ON public.reviews;
CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rating();

-- Trigger to update user rating when review is updated
DROP TRIGGER IF EXISTS on_review_updated ON public.reviews;
CREATE TRIGGER on_review_updated
  AFTER UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rating();

-- ============================================================
-- PERMISSIONS & GRANTS
-- ============================================================

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;

-- Grant table permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant limited permissions to anonymous users (read-only for public data)
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.listings TO anon;
GRANT SELECT ON public.listing_images TO anon;

-- Grant sequence usage
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant function execute permissions
GRANT EXECUTE ON FUNCTION is_verified_user() TO authenticated;
GRANT EXECUTE ON FUNCTION is_moderator() TO authenticated;
GRANT EXECUTE ON FUNCTION increment_listing_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_listing_views(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_event_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_event_views(UUID) TO anon;

-- Grant permissions for trigger functions
GRANT INSERT ON public.profiles TO service_role;
GRANT UPDATE ON public.profiles TO service_role;
