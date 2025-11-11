"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  condition: string;
  status: string;
  created_at: string;
  seller: {
    full_name: string;
    avatar_url: string | null;
  };
  category: {
    name: string;
    icon: string;
  } | null;
  images: {
    image_url: string;
  }[];
}

interface RawListing {
  id: string;
  title: string;
  price: number;
  condition: string;
  status: string;
  created_at: string;
  seller: {
    full_name: string;
    avatar_url: string | null;
  } | {
    full_name: string;
    avatar_url: string | null;
  }[];
  category: {
    name: string;
    icon: string;
  } | {
    name: string;
    icon: string;
  }[] | null;
  images: {
    image_url: string;
  }[];
}

export default function MarketplacePage() {
  const supabase = createClient();

  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  const checkVerification = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setIsVerified(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_verified')
      .eq('id', user.id)
      .single();

    setIsVerified(profile?.is_verified || false);
  }, [supabase]);

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name, icon, slug')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    setCategories(data || []);
  }, [supabase]);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);

    try {
      let query = supabase
        .from('listings')
        .select(`
          id,
          title,
          price,
          condition,
          status,
          created_at,
          seller:profiles!seller_id (
            full_name,
            avatar_url
          ),
          category:categories (
            name,
            icon
          ),
          images:listing_images!listing_id (
            image_url
          )
        `)
        .eq('status', 'active');

      // Filter by category
      if (selectedCategory !== 'all') {
        const category = categories.find(c => c.slug === selectedCategory);
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      // Sort
      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'price_low') {
        query = query.order('price', { ascending: true });
      } else if (sortBy === 'price_high') {
        query = query.order('price', { ascending: false });
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Error fetching listings:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        setListings([]);
      } else {
        console.log('Fetched listings:', data?.length ?? 0);
        // Transform the data to match our Listing type
        const transformedData = (data ?? []).map((item: RawListing): Listing => ({
          ...item,
          seller: Array.isArray(item.seller) ? item.seller[0] : item.seller,
          category: item.category && Array.isArray(item.category) ? item.category[0] : item.category,
        }));
        setListings(transformedData);
      }
    } catch (err) {
      console.error('Exception fetching listings:', err);
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, selectedCategory, sortBy, categories]);

  useEffect(() => {
    checkVerification();
    fetchCategories();
  }, [checkVerification, fetchCategories]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.seller.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const conditionLabels: Record<string, string> = {
    new: 'New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Marketplace</h1>
          <p className="text-text/60">Browse items from verified students</p>
        </div>

        {/* Verification Warning */}
        {!isVerified && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Verify to create listings
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Verify your student email to start selling.{' '}
                  <Link href="/dashboard" className="underline hover:text-yellow-900 dark:hover:text-yellow-100">
                    Verify now
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-11 bg-surface border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-text placeholder-text/50"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Category Filter */}
            <div className="flex-1">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-text"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-4 py-3 bg-surface border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-text"
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin h-10 w-10 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-text/60">Loading listings...</p>
            </div>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-text/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-xl font-semibold text-text mb-2">No listings found</h3>
            <p className="text-text/60">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map(listing => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="group bg-surface rounded-2xl overflow-hidden border border-surface/50 hover:border-accent/50 transition-all hover:shadow-lg"
              >
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

                  <div className="flex items-center gap-2 text-sm text-text/60">
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                      {listing.seller.full_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{listing.seller.full_name}</span>
                  </div>

                  <p className="text-xs text-text/50 mt-2">
                    {new Date(listing.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
