"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface ListingDetailClientProps {
  listingId: string;
  sellerId: string;
  isActive: boolean;
}

export default function ListingDetailClient({ listingId, sellerId, isActive }: ListingDetailClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkAuth = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  }, [supabase]);

  const checkIfSaved = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('saved_items')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .single();

    setIsSaved(!!data);
  }, [supabase, listingId]);

  useEffect(() => {
    checkAuth();
    checkIfSaved();
  }, [checkAuth, checkIfSaved]);

  const handleContactSeller = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.id === sellerId) {
      alert('You cannot message yourself');
      return;
    }

    setIsLoading(true);

    try {
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listingId)
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId)
        .single();

      if (existingConv) {
        router.push(`/messages/${existingConv.id}`);
        return;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          listing_id: listingId,
          buyer_id: user.id,
          seller_id: sellerId,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      router.push(`/messages/${newConv.id}`);
    } catch (err) {
      console.error('Error creating conversation:', err);
      alert('Failed to contact seller. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToggle = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    setIsLoading(true);

    try {
      if (isSaved) {
        // Unsave
        await supabase
          .from('saved_items')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId);

        // Decrement save count
        await supabase.rpc('decrement_save_count', { listing_id: listingId });

        setIsSaved(false);
      } else {
        // Save
        await supabase
          .from('saved_items')
          .insert({
            user_id: user.id,
            listing_id: listingId,
          });

        // Increment save count
        await supabase.rpc('increment_save_count', { listing_id: listingId });

        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      alert('Failed to save listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakeOffer = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.id === sellerId) {
      alert('You cannot make an offer on your own listing');
      return;
    }

    // TODO: Implement offer modal
    alert('Make Offer feature coming soon!');
  };

  const isOwnListing = currentUserId === sellerId;

  return (
    <div className="space-y-3">
      {isActive && !isOwnListing && (
        <>
          {/* Contact Seller Button */}
          <button
            onClick={handleContactSeller}
            disabled={isLoading}
            className="w-full bg-accent hover:bg-accent-hover text-accent-text font-medium py-4 px-6 rounded-xl transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Contact Seller'}
          </button>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Save Button */}
            <button
              onClick={handleSaveToggle}
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors ${
                isSaved
                  ? 'bg-accent/10 text-accent border-2 border-accent'
                  : 'bg-surface hover:bg-surface/80 text-text border-2 border-surface'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill={isSaved ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              {isSaved ? 'Saved' : 'Save'}
            </button>

            {/* Make Offer Button */}
            <button
              onClick={handleMakeOffer}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-surface hover:bg-surface/80 text-text rounded-xl font-medium transition-colors border-2 border-surface"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Make Offer
            </button>
          </div>
        </>
      )}

      {isOwnListing && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-center">
          <p className="text-sm text-accent font-medium">This is your listing</p>
          <button
            onClick={() => router.push('/profile/listings')}
            className="mt-2 text-sm text-accent hover:text-accent-hover underline"
          >
            Manage my listings
          </button>
        </div>
      )}

      {!isActive && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
          <p className="text-sm text-red-500 font-medium">This listing is no longer available</p>
        </div>
      )}
    </div>
  );
}
