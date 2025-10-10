"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface UserProfile {
  id: string;
  is_verified: boolean;
}

export default function CreateListingPage() {
  const router = useRouter();
  const supabase = createClient();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [condition, setCondition] = useState<'new' | 'like_new' | 'good' | 'fair' | 'poor'>('good');
  const [location, setLocation] = useState('');
  const [campusPickup, setCampusPickup] = useState(true);
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // UI state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    checkAuth();
    fetchCategories();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, is_verified')
      .eq('id', user.id)
      .single();

    if (!profile) {
      setError('Profile not found');
      return;
    }

    setUserProfile(profile);

    if (!profile.is_verified) {
      setError('You must verify your student email before creating a listing.');
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, icon')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }

    setCategories(data || []);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + images.length > 5) {
      setError('You can upload a maximum of 5 images');
      return;
    }

    // Validate file sizes (max 5MB each)
    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setError('Each image must be less than 5MB');
      return;
    }

    setImages(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (listingId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${listingId}/${Date.now()}_${i}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('listing-images')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading image:', error);
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from('listing-images')
        .getPublicUrl(fileName);

      uploadedUrls.push(urlData.publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!userProfile?.is_verified) {
      setError('You must verify your student email before creating a listing.');
      setIsLoading(false);
      return;
    }

    if (!title || !description || !price || !categoryId) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (images.length === 0) {
      setError('Please add at least one image');
      setIsLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create listing
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          seller_id: user.id,
          category_id: categoryId,
          title,
          description,
          price: parseFloat(price),
          condition,
          location: location || null,
          campus_pickup: campusPickup,
          delivery_available: deliveryAvailable,
          status: 'active',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // Upload images
      const imageUrls = await uploadImages(listing.id);

      // Insert listing images
      const listingImages = imageUrls.map((url, index) => ({
        listing_id: listing.id,
        image_url: url,
        display_order: index,
        is_primary: index === 0,
      }));

      const { error: imagesError } = await supabase
        .from('listing_images')
        .insert(listingImages);

      if (imagesError) throw imagesError;

      // Success! Redirect to listing detail page
      router.push(`/listings/${listing.id}`);
    } catch (err) {
      console.error('Error creating listing:', err);
      setError('Failed to create listing. Please try again.');
      setIsLoading(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-text/60 hover:text-accent transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-text">Create New Listing</h1>
          <p className="text-text/60 mt-2">List an item for sale on the marketplace</p>
        </div>

        {/* Verification Warning */}
        {!userProfile.is_verified && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Verification Required
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  You must verify your student email before creating listings.{' '}
                  <Link href="/dashboard" className="underline hover:text-yellow-900 dark:hover:text-yellow-100">
                    Verify now
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-surface rounded-2xl shadow-lg p-6 border border-surface/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-text mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., iPhone 13 Pro - Excellent Condition"
                maxLength={100}
                className="w-full px-4 py-3 bg-background border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-text placeholder-text/50"
                disabled={isLoading || !userProfile.is_verified}
              />
              <p className="text-xs text-text/50 mt-1">{title.length}/100 characters</p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your item in detail..."
                rows={6}
                maxLength={2000}
                className="w-full px-4 py-3 bg-background border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-text placeholder-text/50 resize-none"
                disabled={isLoading || !userProfile.is_verified}
              />
              <p className="text-xs text-text/50 mt-1">{description.length}/2000 characters</p>
            </div>

            {/* Price and Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-text mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-background border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-text placeholder-text/50"
                  disabled={isLoading || !userProfile.is_verified}
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-text mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-text"
                  disabled={isLoading || !userProfile.is_verified}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Condition */}
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-text mb-2">
                Condition *
              </label>
              <select
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value as typeof condition)}
                className="w-full px-4 py-3 bg-background border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-text"
                disabled={isLoading || !userProfile.is_verified}
              >
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-text mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Toronto, ON"
                className="w-full px-4 py-3 bg-background border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-text placeholder-text/50"
                disabled={isLoading || !userProfile.is_verified}
              />
            </div>

            {/* Pickup/Delivery Options */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-text">Pickup & Delivery Options</p>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={campusPickup}
                  onChange={(e) => setCampusPickup(e.target.checked)}
                  className="w-5 h-5 text-accent bg-background border-surface rounded focus:ring-2 focus:ring-accent"
                  disabled={isLoading || !userProfile.is_verified}
                />
                <span className="text-sm text-text">Campus Pickup Available</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deliveryAvailable}
                  onChange={(e) => setDeliveryAvailable(e.target.checked)}
                  className="w-5 h-5 text-accent bg-background border-surface rounded focus:ring-2 focus:ring-accent"
                  disabled={isLoading || !userProfile.is_verified}
                />
                <span className="text-sm text-text">Delivery Available</span>
              </label>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Images * (Max 5 images, 5MB each)
              </label>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-surface"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {images.length < 5 && (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-surface rounded-xl cursor-pointer hover:border-accent transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 text-text/50 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <p className="text-sm text-text/60">Click to upload images</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isLoading || !userProfile.is_verified}
                  />
                </label>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-surface hover:bg-surface/80 text-text font-medium rounded-xl transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !userProfile.is_verified}
                className="flex-1 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Listing...' : 'Create Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
