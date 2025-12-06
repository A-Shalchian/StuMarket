"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    price: number;
    condition: string;
    status: string;
    created_at: string;
    seller_id: string;
    seller: {
      id: string;
      full_name: string;
      avatar_url: string | null;
    } | null;
    category: {
      name: string;
      icon: string;
    } | null;
    images: {
      image_url: string;
    }[];
  };
  currentUserId: string | null;
}

const conditionLabels: Record<string, string> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

export default function ListingCard({ listing, currentUserId }: ListingCardProps) {
  const [isMessaging, setIsMessaging] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleMessageSeller = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) {
      router.push('/login');
      return;
    }

    if (currentUserId === listing.seller_id) {
      alert('You cannot message yourself');
      return;
    }

    setIsMessaging(true);

    try {
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listing.id)
        .eq('buyer_id', currentUserId)
        .eq('seller_id', listing.seller_id)
        .single();

      if (existingConv) {
        router.push(`/messages/${existingConv.id}`);
        return;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          listing_id: listing.id,
          buyer_id: currentUserId,
          seller_id: listing.seller_id,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      router.push(`/messages/${newConv.id}`);
    } catch (err) {
      console.error('Error creating conversation:', err);
      alert('Failed to start conversation. Please try again.');
    } finally {
      setIsMessaging(false);
    }
  };

  const isOwnListing = currentUserId === listing.seller_id;

  return (
    <div className="group bg-surface rounded-2xl overflow-hidden border border-surface/50 hover:border-accent/50 transition-all hover:shadow-lg">
      <Link href={`/listings/${listing.id}`}>
        {/* Image */}
        <div className="aspect-square relative bg-background">
          {listing.images.length > 0 ? (
            <Image
              src={listing.images[0].image_url}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-16 h-16 text-text/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Category Badge */}
          {listing.category && (
            <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium text-text">
              {listing.category.icon} {listing.category.name}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-4">
          <h3 className="font-semibold text-text mb-1 line-clamp-2 group-hover:text-accent transition-colors">
            {listing.title}
          </h3>

          <div className="flex items-center justify-between mb-2">
            <p className="text-2xl font-bold text-accent">${listing.price.toFixed(2)}</p>
            <span className="text-xs text-text/60 bg-background px-2 py-1 rounded">
              {conditionLabels[listing.condition] || listing.condition}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-text/60 mb-3">
            <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
              {(listing.seller?.full_name || 'U').charAt(0).toUpperCase()}
            </div>
            <span className="truncate">{listing.seller?.full_name || 'Unknown User'}</span>
          </div>

          <p className="text-xs text-text/50 mb-3">
            {new Date(listing.created_at).toLocaleDateString()}
          </p>
        </div>
      </Link>

      {/* Message Button */}
      {!isOwnListing && currentUserId && (
        <div className="px-4 pb-4">
          <button
            onClick={handleMessageSeller}
            disabled={isMessaging}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMessaging ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Message Seller</span>
              </>
            )}
          </button>
        </div>
      )}

      {isOwnListing && (
        <div className="px-4 pb-4">
          <div className="text-center py-2 text-xs text-text/60 bg-background rounded-lg">
            Your Listing
          </div>
        </div>
      )}
    </div>
  );
}
