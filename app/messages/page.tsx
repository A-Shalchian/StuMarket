import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  status: string;
  last_message_text: string | null;
  last_message_at: string | null;
  buyer_unread_count: number;
  seller_unread_count: number;
  created_at: string;
  listing: {
    id: string;
    title: string;
    price: number;
    status: string;
    listing_images: {
      image_url: string;
      is_primary: boolean;
    }[];
  };
  buyer: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  seller: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export default async function MessagesPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Fetch all conversations where the user is either buyer or seller
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select(`
      *,
      listing:listings(
        id,
        title,
        price,
        status,
        listing_images(image_url, is_primary)
      ),
      buyer:profiles!conversations_buyer_id_fkey(
        id,
        full_name,
        avatar_url
      ),
      seller:profiles!conversations_seller_id_fkey(
        id,
        full_name,
        avatar_url
      )
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
  }

  const conversationsList = (conversations || []) as Conversation[];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text">Messages</h1>
          <p className="text-text/60 mt-2">Chat with buyers and sellers</p>
        </div>

        {conversationsList.length === 0 ? (
          <div className="bg-surface rounded-xl p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-text/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-semibold text-text mb-2">No messages yet</h3>
            <p className="text-text/60 mb-6">Start a conversation by contacting a seller</p>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl font-medium transition-colors"
            >
              Browse Marketplace
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="bg-surface rounded-xl divide-y divide-surface/50 overflow-hidden">
            {conversationsList.map((conversation) => {
              const isUserBuyer = conversation.buyer_id === user.id;
              const otherUser = isUserBuyer ? conversation.seller : conversation.buyer;
              const unreadCount = isUserBuyer 
                ? conversation.buyer_unread_count 
                : conversation.seller_unread_count;
              
              const primaryImage = conversation.listing?.listing_images?.find(img => img.is_primary);
              const listingImage = primaryImage?.image_url || conversation.listing?.listing_images?.[0]?.image_url;

              return (
                <Link
                  key={conversation.id}
                  href={`/messages/${conversation.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-surface/50 transition-colors"
                >
                  {/* Listing Image */}
                  {listingImage && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface">
                      <Image
                        src={listingImage}
                        alt={conversation.listing?.title || 'Listing'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Other User Avatar */}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-accent/10">
                    {otherUser.avatar_url ? (
                      <Image
                        src={otherUser.avatar_url}
                        alt={otherUser.full_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-accent font-bold">
                        {otherUser.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-text truncate">
                        {otherUser.full_name}
                      </h3>
                      {conversation.last_message_at && (
                        <span className="text-xs text-text/60 flex-shrink-0 ml-2">
                          {new Date(conversation.last_message_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text/70 truncate mb-1">
                      {conversation.listing?.title || 'Listing removed'}
                    </p>
                    {conversation.last_message_text && (
                      <p className="text-sm text-text/60 truncate">
                        {conversation.last_message_text}
                      </p>
                    )}
                  </div>

                  {/* Unread Badge */}
                  {unreadCount > 0 && (
                    <div className="flex-shrink-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </div>
                  )}

                  {/* Arrow */}
                  <svg className="w-5 h-5 text-text/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
