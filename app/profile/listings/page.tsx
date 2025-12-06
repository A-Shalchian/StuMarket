import { getUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function MyListingsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("listings")
    .select(`
      id,
      title,
      price,
      status,
      condition,
      view_count,
      save_count,
      created_at,
      images:listing_images(image_url)
    `)
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const conditionLabels: Record<string, string> = {
    new: 'New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    sold: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    expired: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    inactive: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-surface rounded-xl border border-surface/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text">My Listings</h1>
            <p className="text-text/60 mt-1">Manage your marketplace listings</p>
          </div>
          <Link
            href="/listings/new"
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-accent-text rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Listing
          </Link>
        </div>
      </div>

      {/* Listings Grid */}
      {!listings || listings.length === 0 ? (
        <div className="bg-surface rounded-xl border border-surface/50 p-12 text-center">
          <svg className="w-16 h-16 text-text/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-xl font-semibold text-text mb-2">No listings yet</h3>
          <p className="text-text/60 mb-6">Create your first listing to start selling</p>
          <Link
            href="/listings/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-accent-text rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              className="group bg-surface rounded-xl overflow-hidden border border-surface/50 hover:border-accent/50 transition-all hover:shadow-lg"
            >
              {/* Image */}
              <div className="aspect-square relative bg-background">
                {listing.images && listing.images.length > 0 ? (
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
                {/* Status Badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium border ${statusColors[listing.status] || statusColors.inactive}`}>
                  {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                </div>
              </div>

              {/* Details */}
              <div className="p-4">
                <h3 className="font-semibold text-text mb-1 line-clamp-2 group-hover:text-accent transition-colors">
                  {listing.title}
                </h3>

                <div className="flex items-center justify-between mb-2">
                  <p className="text-xl font-bold text-accent">${listing.price.toFixed(2)}</p>
                  <span className="text-xs text-text/60 bg-background px-2 py-1 rounded">
                    {conditionLabels[listing.condition] || listing.condition}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-text/60">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{listing.view_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span>{listing.save_count}</span>
                  </div>
                </div>

                <p className="text-xs text-text/50 mt-2">
                  Listed {new Date(listing.created_at).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
