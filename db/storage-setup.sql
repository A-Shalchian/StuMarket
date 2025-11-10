-- SUPABASE STORAGE SETUP
-- Run this in Supabase SQL Editor after creating buckets manually

-- IMPORTANT: You must create these buckets manually in Supabase Storage UI:
-- 1. listing-images (public bucket)
-- 2. avatars (public bucket)

-- Then run this SQL to set up RLS policies

-- LISTING IMAGES BUCKET POLICIES

-- Allow authenticated users to upload images to their own listing folders
CREATE POLICY "Users can upload listing images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'listing-images' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.listings WHERE seller_id = auth.uid()
  )
);

-- Allow anyone to view listing images (public bucket)
CREATE POLICY "Anyone can view listing images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'listing-images');

-- Allow users to delete their own listing images
CREATE POLICY "Users can delete their own listing images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'listing-images' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.listings WHERE seller_id = auth.uid()
  )
);

-- AVATARS BUCKET POLICIES

-- Allow users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  name = auth.uid()::text || '.jpg' OR
  name = auth.uid()::text || '.png' OR
  name = auth.uid()::text || '.jpeg'
);

-- Allow anyone to view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (
    name = auth.uid()::text || '.jpg' OR
    name = auth.uid()::text || '.png' OR
    name = auth.uid()::text || '.jpeg'
  )
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (
    name = auth.uid()::text || '.jpg' OR
    name = auth.uid()::text || '.png' OR
    name = auth.uid()::text || '.jpeg'
  )
);
