"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface User {
  id: string;
  full_name: string;
  avatar_url: string | null;
  college: string | null;
  is_verified: boolean;
  bio?: string;
}

interface Connection {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  requester?: User;
  receiver?: User;
}

export default function ConnectionsPage() {
  const [tab, setTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [friendRequests, setFriendRequests] = useState<Connection[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUserId(user.id);
  };

  const fetchConnections = async () => {
    if (!currentUserId) return;

    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        requester:profiles!connections_requester_id_fkey(id, full_name, avatar_url, college, is_verified),
        receiver:profiles!connections_receiver_id_fkey(id, full_name, avatar_url, college, is_verified)
      `)
      .eq('status', 'accepted')
      .or(`requester_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);

    if (!error && data) {
      setConnections(data as unknown as Connection[]);
    }
  };

  const fetchFriendRequests = async () => {
    if (!currentUserId) return;

    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        requester:profiles!connections_requester_id_fkey(id, full_name, avatar_url, college, is_verified),
        receiver:profiles!connections_receiver_id_fkey(id, full_name, avatar_url, college, is_verified)
      `)
      .eq('receiver_id', currentUserId)
      .eq('status', 'pending');

    if (!error && data) {
      setFriendRequests(data as unknown as Connection[]);
    }
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentUserId) {
      if (tab === 'friends') {
        fetchConnections();
      } else if (tab === 'requests') {
        fetchFriendRequests();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, currentUserId]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    if (!currentUserId) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, college, is_verified')
      .neq('id', currentUserId)
      .or(`full_name.ilike.%${query}%,college.ilike.%${query}%`)
      .limit(10);

    if (!error && data) {
      setSearchResults(data as User[]);
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    if (!currentUserId) return;

    try {
      // Check if connection already exists
      const { data: existing } = await supabase
        .from('connections')
        .select('id')
        .or(`and(requester_id.eq.${currentUserId},receiver_id.eq.${receiverId}),and(requester_id.eq.${receiverId},receiver_id.eq.${currentUserId})`)
        .single();

      if (existing) {
        toast.error('Connection already exists');
        return;
      }

      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: currentUserId,
          receiver_id: receiverId,
          status: 'pending',
        });

      if (error) throw error;

      toast.success('Friend request sent!');
      setSearchResults(prev => prev.filter(u => u.id !== receiverId));
    } catch (err) {
      console.error('Error sending friend request:', err);
      toast.error('Failed to send friend request');
    }
  };

  const respondToRequest = async (requestId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: accept ? 'accepted' : 'blocked' })
        .eq('id', requestId);

      if (error) throw error;

      toast.success(accept ? 'Friend request accepted!' : 'Friend request declined');
      fetchFriendRequests();
    } catch (err) {
      console.error('Error responding to request:', err);
      toast.error('Failed to respond to request');
    }
  };

  const removeFriend = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      toast.success('Friend removed');
      fetchConnections();
    } catch (err) {
      console.error('Error removing friend:', err);
      toast.error('Failed to remove friend');
    }
  };

  const getFriendUser = (connection: Connection): User | null => {
    if (connection.requester?.id === currentUserId) {
      return connection.receiver || null;
    } else {
      return connection.requester || null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">Connections & Friends</h1>
          <p className="text-text/60 mt-2">Connect with other students on campus</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-surface">
          <button
            onClick={() => setTab('friends')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors cursor-pointer ${
              tab === 'friends'
                ? 'border-accent text-accent'
                : 'border-transparent text-text/60 hover:text-text'
            }`}
          >
            Friends ({connections.length})
          </button>
          <button
            onClick={() => setTab('requests')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors cursor-pointer ${
              tab === 'requests'
                ? 'border-accent text-accent'
                : 'border-transparent text-text/60 hover:text-text'
            }`}
          >
            Requests ({friendRequests.length})
          </button>
          <button
            onClick={() => setTab('search')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors cursor-pointer ${
              tab === 'search'
                ? 'border-accent text-accent'
                : 'border-transparent text-text/60 hover:text-text'
            }`}
          >
            Find Friends
          </button>
        </div>

        {/* Friends Tab */}
        {tab === 'friends' && (
          <div className="space-y-3">
            {connections.length === 0 ? (
              <div className="text-center py-12 bg-surface rounded-xl">
                <svg className="w-16 h-16 mx-auto text-text/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.708" />
                </svg>
                <p className="text-text/60 mb-4">No friends yet. Start connecting!</p>
                <button
                  onClick={() => setTab('search')}
                  className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Find Friends
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connections.map(connection => {
                  const friend = getFriendUser(connection);
                  if (!friend) return null;

                  return (
                    <div key={connection.id} className="bg-surface rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-accent/10">
                          {friend.avatar_url ? (
                            <Image
                              src={friend.avatar_url}
                              alt={friend.full_name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-accent font-bold">
                              {friend.full_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-text">{friend.full_name}</h3>
                          {friend.college && (
                            <p className="text-sm text-text/60 truncate">{friend.college}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/messages?user=${friend.id}`}
                          className="px-3 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                        >
                          Message
                        </Link>
                        <button
                          onClick={() => removeFriend(connection.id)}
                          className="px-3 py-2 bg-surface border border-surface hover:border-red-500/50 text-text/60 hover:text-red-500 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Friend Requests Tab */}
        {tab === 'requests' && (
          <div className="space-y-3">
            {friendRequests.length === 0 ? (
              <div className="text-center py-12 bg-surface rounded-xl">
                <svg className="w-16 h-16 mx-auto text-text/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-text/60">No pending friend requests</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friendRequests.map(request => {
                  const requester = request.requester;
                  if (!requester) return null;

                  return (
                    <div key={request.id} className="bg-surface rounded-xl p-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-accent/10">
                          {requester.avatar_url ? (
                            <Image
                              src={requester.avatar_url}
                              alt={requester.full_name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-accent font-bold">
                              {requester.full_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-text">{requester.full_name}</h3>
                          {requester.college && (
                            <p className="text-sm text-text/60 truncate">{requester.college}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => respondToRequest(request.id, true)}
                          className="flex-1 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg font-medium transition-colors cursor-pointer"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => respondToRequest(request.id, false)}
                          className="flex-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg font-medium transition-colors cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Search Tab */}
        {tab === 'search' && (
          <div className="space-y-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for students by name or college..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 pl-11 bg-surface border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text placeholder-text/50"
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

            {searchResults.length === 0 ? (
              <div className="text-center py-12 bg-surface rounded-xl">
                <svg className="w-16 h-16 mx-auto text-text/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-text/60">
                  {searchQuery ? 'No students found' : 'Search for students to connect'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map(user => (
                  <div key={user.id} className="bg-surface rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-accent/10">
                        {user.avatar_url ? (
                          <Image
                            src={user.avatar_url}
                            alt={user.full_name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-accent font-bold">
                            {user.full_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-text">{user.full_name}</h3>
                          {user.is_verified && (
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        {user.college && (
                          <p className="text-sm text-text/60 truncate">{user.college}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => sendFriendRequest(user.id)}
                      className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
