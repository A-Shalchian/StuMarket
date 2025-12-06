"use client";

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_text: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  sender: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

interface Listing {
  id: string;
  title: string;
  price: number;
  status: string;
  listing_images: {
    image_url: string;
    is_primary: boolean;
  }[];
}

interface OtherUser {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface ChatClientProps {
  conversationId: string;
  currentUserId: string;
  otherUser: OtherUser;
  listing: Listing;
  initialMessages: Message[];
  isUserBuyer: boolean;
}

export default function ChatClient({
  conversationId,
  currentUserId,
  otherUser,
  listing,
  initialMessages,
  isUserBuyer,
}: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch the full message with sender info
          const { data: newMsg } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!messages_sender_id_fkey(
                id,
                full_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (newMsg) {
            setMessages((prev) => [...prev, newMsg as unknown as Message]);

            // Mark as read if not sent by current user
            if (newMsg.sender_id !== currentUserId) {
              await supabase
                .from('messages')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('id', newMsg.id);

              // Reset unread count
              if (isUserBuyer) {
                await supabase
                  .from('conversations')
                  .update({ buyer_unread_count: 0 })
                  .eq('id', conversationId);
              } else {
                await supabase
                  .from('conversations')
                  .update({ seller_unread_count: 0 })
                  .eq('id', conversationId);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, isUserBuyer, supabase]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || isSending) return;

    setIsSending(true);

    try {
      // Insert new message
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          message_text: newMessage.trim(),
          message_type: 'text',
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation's last message info
      await supabase
        .from('conversations')
        .update({
          last_message_text: newMessage.trim(),
          last_message_at: new Date().toISOString(),
          last_message_by: currentUserId,
          // Increment unread count for the other user
          ...(isUserBuyer
            ? { seller_unread_count: supabase.rpc('increment', { x: 1 }) }
            : { buyer_unread_count: supabase.rpc('increment', { x: 1 }) }
          ),
        })
        .eq('id', conversationId);

      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const primaryImage = listing?.listing_images?.find(img => img.is_primary);
  const listingImage = primaryImage?.image_url || listing?.listing_images?.[0]?.image_url;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-surface border-b border-surface/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/messages')}
              className="p-2 hover:bg-surface/50 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Other User Info */}
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-accent/10">
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
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-text truncate">{otherUser.full_name}</h2>
              <p className="text-sm text-text/60 truncate">{listing?.title || 'Listing removed'}</p>
            </div>

            {/* Listing Link */}
            {listing && (
              <Link
                href={`/listings/${listing.id}`}
                className="text-sm text-accent hover:text-accent-hover font-medium"
              >
                View Listing
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Listing Card */}
      {listing && (
        <div className="bg-surface border-b border-surface/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Link href={`/listings/${listing.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              {listingImage && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface">
                  <Image
                    src={listingImage}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-text truncate">{listing.title}</h3>
                <p className="text-lg font-bold text-accent">${listing.price.toFixed(2)}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                listing.status === 'active' 
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}>
                {listing.status === 'active' ? 'Available' : 'Sold'}
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-text/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-text/60">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender_id === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-accent/10">
                    {message.sender.avatar_url ? (
                      <Image
                        src={message.sender.avatar_url}
                        alt={message.sender.full_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-accent text-xs font-bold">
                        {message.sender.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwnMessage
                          ? 'bg-accent text-white rounded-br-sm'
                          : 'bg-surface text-text rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.message_text}</p>
                    </div>
                    <span className="text-xs text-text/60 mt-1 px-2">
                      {new Date(message.created_at).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-surface border-t border-surface/50 sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={isSending}
              className="flex-1 px-4 py-3 bg-background border border-surface/50 rounded-xl text-text placeholder-text/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  Send
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
