-- ============================================================
-- MIGRATION: Fix Foreign Key Relationships
-- This script updates all foreign keys to reference profiles instead of auth.users
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Step 1: Drop all dependent tables (in reverse dependency order)
-- This is necessary because we need to change the foreign key relationships

DROP TABLE IF EXISTS public.blocked_users CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.saved_items CASCADE;
DROP TABLE IF EXISTS public.offers CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.event_rsvps CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.listing_images CASCADE;
DROP TABLE IF EXISTS public.listings CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;

-- Step 2: Recreate all tables with correct foreign key relationships

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- emoji or icon name
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LISTINGS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,

  -- Listing details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  condition TEXT CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),

  -- Location
  location TEXT,
  campus_pickup BOOLEAN DEFAULT TRUE,
  delivery_available BOOLEAN DEFAULT FALSE,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'sold', 'expired', 'removed', 'flagged')),
  is_featured BOOLEAN DEFAULT FALSE,

  -- Metrics
  view_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,

  -- Timestamps
  expires_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LISTING IMAGES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.listing_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONVERSATIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),

  -- Last message info (denormalized for performance)
  last_message_text TEXT,
  last_message_at TIMESTAMPTZ,
  last_message_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Unread counts
  buyer_unread_count INTEGER DEFAULT 0,
  seller_unread_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(listing_id, buyer_id, seller_id)
);

-- ============================================================
-- MESSAGES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Message content
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'offer', 'system')),

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EVENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Event details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT CHECK (event_type IN ('party', 'study_group', 'sports', 'club', 'social', 'other')),

  -- Location & time
  location TEXT NOT NULL,
  campus TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,

  -- Event settings
  max_attendees INTEGER,
  is_private BOOLEAN DEFAULT FALSE,
  requires_approval BOOLEAN DEFAULT FALSE,
  cover_image_url TEXT,

  -- Status
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled')),

  -- Metrics
  view_count INTEGER DEFAULT 0,
  attendee_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EVENT RSVPs TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- RSVP status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'going', 'maybe', 'declined')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(event_id, user_id)
);

-- ============================================================
-- TRANSACTIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Transaction details
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  payment_method TEXT CHECK (payment_method IN ('cash', 'venmo', 'zelle', 'paypal', 'other')),

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled', 'disputed')),

  -- Completion tracking
  buyer_confirmed BOOLEAN DEFAULT FALSE,
  seller_confirmed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REVIEWS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewed_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,

  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,

  -- Type
  review_type TEXT CHECK (review_type IN ('buyer', 'seller')),

  -- Status
  is_flagged BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(reviewer_id, reviewed_user_id, transaction_id)
);

-- ============================================================
-- OFFERS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Offer details
  offer_price DECIMAL(10,2) NOT NULL CHECK (offer_price >= 0),
  message TEXT,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'countered', 'expired', 'withdrawn')),

  -- Counter offer
  counter_price DECIMAL(10,2) CHECK (counter_price >= 0),
  counter_message TEXT,

  -- Expiration
  expires_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SAVED ITEMS TABLE (Favorites/Wishlist)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.saved_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, listing_id)
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Notification content
  type TEXT NOT NULL CHECK (type IN ('message', 'offer', 'review', 'transaction', 'event', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Related entities
  related_id UUID, -- ID of related listing, event, message, etc.
  action_url TEXT,

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REPORTS TABLE (User reports/moderation)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- What's being reported
  reported_type TEXT NOT NULL CHECK (reported_type IN ('listing', 'user', 'message', 'event', 'review')),
  reported_id UUID NOT NULL,

  -- Report details
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'scam', 'inappropriate', 'fake', 'harassment', 'other')),
  description TEXT,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),

  -- Moderation
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  action_taken TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BLOCKED USERS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- ============================================================
-- ADD TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS update_listings_updated_at ON public.listings;
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS update_event_rsvps_updated_at ON public.event_rsvps;
CREATE TRIGGER update_event_rsvps_updated_at
  BEFORE UPDATE ON public.event_rsvps
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS update_offers_updated_at ON public.offers;
CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- ============================================================
-- ADD INITIAL DATA (Categories)
-- ============================================================

INSERT INTO public.categories (name, slug, description, icon, display_order) VALUES
  ('Textbooks', 'textbooks', 'Buy and sell course textbooks', '📚', 1),
  ('Electronics', 'electronics', 'Laptops, phones, tablets, and accessories', '💻', 2),
  ('Furniture', 'furniture', 'Dorm and apartment furniture', '🛋️', 3),
  ('Clothing', 'clothing', 'Clothes, shoes, and accessories', '👕', 4),
  ('Sports & Fitness', 'sports-fitness', 'Sports equipment and gym gear', '⚽', 5),
  ('School Supplies', 'school-supplies', 'Notebooks, pens, calculators, etc.', '✏️', 6),
  ('Kitchen & Dining', 'kitchen-dining', 'Cookware, dishes, and appliances', '🍳', 7),
  ('Tickets', 'tickets', 'Event tickets and passes', '🎫', 8),
  ('Services', 'services', 'Tutoring, moving help, etc.', '🤝', 9),
  ('Free Stuff', 'free-stuff', 'Items being given away for free', '🎁', 10),
  ('Other', 'other', 'Everything else', '📦', 99)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================

SELECT 'Migration completed successfully! All foreign key relationships now reference profiles table.' AS status;
