"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  icon: string;
}


export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;
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

  // Image state
  const [existingImages, setExistingImages] = useState<{ image_url: string; id: string; display_order: number }[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  // UI state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListing = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: listing, error: fetchError } = await supabase
        .from('listings')
        .select(`
          *,
          images:listing_images(id, image_url, display_order)
        `)
        .eq('id', listingId)
        .single();

      if (fetchError) throw fetchError;

      if (listing.seller_id !== user.id) {
        toast.error('You do not have permission to edit this listing');
        router.push('/profile/listings');
        return;
      }

      // Populate form
      setTitle(listing.title);
      setDescription(listing.description);
      setPrice(listing.price.toString());
      setCategoryId(listing.category_id);
      setCondition(listing.condition);
      setLocation(listing.location || '');
      setCampusPickup(listing.campus_pickup);
      setDeliveryAvailable(listing.delivery_available);
      setExistingImages(listing.images.sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order));
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching listing:', err);
      toast.error('Failed to load listing');
      router.push('/profile/listings');
    }
  }, [listingId, router, supabase]);

  const fetchCategories = useCallback(async () => {
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
  }, [supabase]);

  useEffect(() => {
    fetchListing();
    fetchCategories();
  }, [fetchListing, fetchCategories]);

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length - imagesToDelete.length + newImages.length + files.length;

    if (totalImages > 5) {
      setError('You can have a maximum of 5 images');
      return;
    }

    // Validate file sizes (max 5MB each)
    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setError('Each image must be less than 5MB');
      return;
    }

    setNewImages(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (imageId: string) => {
    setImagesToDelete(prev => [...prev, imageId]);
  };

  const undoRemoveExistingImage = (imageId: string) => {
    setImagesToDelete(prev => prev.filter(id => id !== imageId));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadNewImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (let i = 0; i < newImages.length; i++) {
      const file = newImages[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${listingId}/${Date.now()}_${i}.${fileExt}`;

      const { error } = await supabase.storage
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
    setIsSaving(true);
    setError(null);

    if (!title || !description || !price || !categoryId) {
      setError('Please fill in all required fields');
      setIsSaving(false);
      return;
    }

    const remainingImages = existingImages.length - imagesToDelete.length + newImages.length;
    if (remainingImages === 0) {
      setError('Please keep at least one image');
      setIsSaving(false);
      return;
    }

    try {
      // Update listing
      const { error: updateError } = await supabase
        .from('listings')
        .update({
          title,
          description,
          price: parseFloat(price),
          category_id: categoryId,
          condition,
          location: location || null,
          campus_pickup: campusPickup,
          delivery_available: deliveryAvailable,
          updated_at: new Date().toISOString(),
        })
        .eq('id', listingId);

      if (updateError) throw updateError;

      // Delete marked images
      if (imagesToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('listing_images')
          .delete()
          .in('id', imagesToDelete);

        if (deleteError) throw deleteError;
      }

      // Upload new images
      if (newImages.length > 0) {
        const imageUrls = await uploadNewImages();
        const currentMaxOrder = Math.max(...existingImages.map(img => img.display_order), -1);

        const listingImages = imageUrls.map((url, index) => ({
          listing_id: listingId,
          image_url: url,
          display_order: currentMaxOrder + 1 + index,
          is_primary: existingImages.length === 0 && index === 0,
        }));

        const { error: imagesError } = await supabase
          .from('listing_images')
          .insert(listingImages);

        if (imagesError) throw imagesError;
      }

      toast.success('Listing updated successfully!');
      router.push(`/listings/${listingId}`);
    } catch (err) {
      console.error('Error updating listing:', err);
      setError('Failed to update listing. Please try again.');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text/60">Loading listing...</p>
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
            href={`/listings/${listingId}`}
            className="inline-flex items-center text-text/60 hover:text-accent transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Listing
          </Link>
          <h1 className="text-3xl font-bold text-text">Edit Listing</h1>
          <p className="text-text/60 mt-2">Update your listing details</p>
        </div>

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
                disabled={isSaving}
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
                disabled={isSaving}
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
                  disabled={isSaving}
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
                  disabled={isSaving}
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
                disabled={isSaving}
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
                disabled={isSaving}
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
                  disabled={isSaving}
                />
                <span className="text-sm text-text">Campus Pickup Available</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deliveryAvailable}
                  onChange={(e) => setDeliveryAvailable(e.target.checked)}
                  className="w-5 h-5 text-accent bg-background border-surface rounded focus:ring-2 focus:ring-accent"
                  disabled={isSaving}
                />
                <span className="text-sm text-text">Delivery Available</span>
              </label>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Images * (Max 5 images, 5MB each)
              </label>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {existingImages.map((image, index) => (
                    <div key={image.id} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.image_url}
                        alt={`Image ${index + 1}`}
                        className={`w-full h-32 object-cover rounded-lg border-2 ${
                          imagesToDelete.includes(image.id)
                            ? 'border-red-500 opacity-50'
                            : 'border-surface'
                        }`}
                      />
                      {!imagesToDelete.includes(image.id) ? (
                        <button
                          type="button"
                          onClick={() => removeExistingImage(image.id)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => undoRemoveExistingImage(image.id)}
                          className="absolute top-2 right-2 bg-green-500 text-white p-1.5 rounded-full"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      )}
                      {index === 0 && !imagesToDelete.includes(image.id) && (
                        <div className="absolute bottom-2 left-2 bg-accent text-accent-text text-xs px-2 py-1 rounded">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* New Images */}
              {newImagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {newImagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt={`New image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-green-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        New
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload new images */}
              {(existingImages.length - imagesToDelete.length + newImages.length) < 5 && (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-surface rounded-xl cursor-pointer hover:border-accent transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 text-text/50 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <p className="text-sm text-text/60">Click to add more images</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleNewImageChange}
                    className="hidden"
                    disabled={isSaving}
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

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-surface hover:bg-surface/80 text-text font-medium rounded-xl transition-colors border border-surface"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-accent hover:bg-accent-hover text-accent-text font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
