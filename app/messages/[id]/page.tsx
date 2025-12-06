import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import ChatClient from './chat-client';

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

interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  status: string;
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

export default async function ChatPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Fetch conversation details
  const { data: conversation, error: convError } = await supabase
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
    .eq('id', params.id)
    .single();

  if (convError || !conversation) {
    notFound();
  }

  const conv = conversation as unknown as Conversation;

  // Check if user is part of this conversation
  if (conv.buyer_id !== user.id && conv.seller_id !== user.id) {
    redirect('/messages');
  }

  // Fetch messages
  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('conversation_id', params.id)
    .order('created_at', { ascending: true });

  if (msgError) {
    console.error('Error fetching messages:', msgError);
  }

  const messagesList = (messages || []) as unknown as Message[];

  // Mark messages as read
  const isUserBuyer = conv.buyer_id === user.id;
  await supabase
    .from('messages')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('conversation_id', params.id)
    .neq('sender_id', user.id)
    .eq('is_read', false);

  // Reset unread count
  if (isUserBuyer) {
    await supabase
      .from('conversations')
      .update({ buyer_unread_count: 0 })
      .eq('id', params.id);
  } else {
    await supabase
      .from('conversations')
      .update({ seller_unread_count: 0 })
      .eq('id', params.id);
  }

  const otherUser = isUserBuyer ? conv.seller : conv.buyer;

  return (
    <ChatClient
      conversationId={params.id}
      currentUserId={user.id}
      otherUser={otherUser}
      listing={conv.listing}
      initialMessages={messagesList}
      isUserBuyer={isUserBuyer}
    />
  );
}
