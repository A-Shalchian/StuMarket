import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ListingDetailClient from './listing-detail-client';

interface ListingImage {
  id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
}

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  location: string | null;
  campus_pickup: boolean;
  delivery_available: boolean;
  status: string;
  view_count: number;
  save_count: number;
  created_at: string;
  seller: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    rating: number;
    college: string | null;
  };
  category: {
    id: string;
    name: string;
    icon: string;
  } | null;
  images: ListingImage[];
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  // Fetch listing with seller and category info
  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      *,
      seller:profiles!seller_id (
        id,
        full_name,
        avatar_url,
        rating,
        college
      ),
      category:categories (
        id,
        name,
        icon
      ),
      images:listing_images (
        id,
        image_url,
        display_order,
        is_primary
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !listing) {
    notFound();
  }

  // Increment view count
  await supabase
    .from('listings')
    .update({ view_count: (listing.view_count || 0) + 1 })
    .eq('id', params.id);

  // Sort images by display order
  const sortedImages = listing.images.sort((a: ListingImage, b: ListingImage) => a.display_order - b.display_order);

  const conditionLabels: Record<string, string> = {
    new: 'New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href="/marketplace"
          className="inline-flex items-center text-text/60 hover:text-accent transition-colors mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div>
            {sortedImages.length > 0 ? (
              <div className="space-y-4">
                {/* Main Image */}
                <div className="aspect-square relative rounded-2xl overflow-hidden border-2 border-surface">
                  <Image
                    src={sortedImages[0].image_url}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Thumbnail Gallery */}
                {sortedImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {sortedImages.slice(1, 5).map((image: ListingImage) => (
                      <div key={image.id} className="aspect-square relative rounded-lg overflow-hidden border border-surface cursor-pointer hover:border-accent transition-colors">
                        <Image
                          src={image.image_url}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square bg-surface rounded-2xl flex items-center justify-center">
                <p className="text-text/50">No images available</p>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Category Badge */}
            {listing.category && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
                <span>{listing.category.icon}</span>
                <span>{listing.category.name}</span>
              </div>
            )}

            {/* Title and Price */}
            <div>
              <h1 className="text-3xl font-bold text-text mb-2">{listing.title}</h1>
              <p className="text-4xl font-bold text-accent">${listing.price.toFixed(2)}</p>
            </div>

            {/* Condition and Status */}
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-surface rounded-lg">
                <span className="text-sm text-text/70">Condition: </span>
                <span className="text-sm font-medium text-text">{conditionLabels[listing.condition] || listing.condition}</span>
              </div>

              {listing.status === 'active' ? (
                <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded-lg text-sm font-medium">
                  Available
                </div>
              ) : listing.status === 'sold' ? (
                <div className="px-3 py-1 bg-red-500/10 text-red-500 rounded-lg text-sm font-medium">
                  Sold
                </div>
              ) : null}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-text mb-2">Description</h2>
              <p className="text-text/70 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
            </div>

            {/* Pickup & Delivery */}
            <div>
              <h2 className="text-lg font-semibold text-text mb-2">Pickup & Delivery</h2>
              <div className="space-y-2">
                {listing.campus_pickup && (
                  <div className="flex items-center gap-2 text-text/70">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Campus Pickup Available</span>
                  </div>
                )}
                {listing.delivery_available && (
                  <div className="flex items-center gap-2 text-text/70">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Delivery Available</span>
                  </div>
                )}
                {listing.location && (
                  <div className="flex items-center gap-2 text-text/70">
                    <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{listing.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Seller Info */}
            <div className="border-t border-surface pt-6">
              <h2 className="text-lg font-semibold text-text mb-3">Seller Information</h2>
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-accent/10">
                  {listing.seller.avatar_url ? (
                    <Image
                      src={listing.seller.avatar_url}
                      alt={listing.seller.full_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-accent font-bold">
                      {listing.seller.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-text">{listing.seller.full_name}</p>
                  {listing.seller.college && (
                    <p className="text-sm text-text/60">{listing.seller.college}</p>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm text-text/70">{listing.seller.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Client-side interactions (Contact, Save, Report) */}
            <ListingDetailClient
              listingId={listing.id}
              sellerId={listing.seller.id}
              isActive={listing.status === 'active'}
            />

            {/* Listing Stats */}
            <div className="flex items-center gap-6 text-sm text-text/60 pt-4 border-t border-surface">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{listing.view_count} views</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>{listing.save_count} saved</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Listed {new Date(listing.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
