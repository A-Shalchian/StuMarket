"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  location: string;
  campus: string | null;
  starts_at: string;
  ends_at: string | null;
  max_attendees: number | null;
  cover_image_url: string | null;
  status: string;
  attendee_count: number;
  organizer: {
    full_name: string;
    avatar_url: string | null;
  };
}

const eventTypes = [
  { value: 'party', label: 'Party', icon: 'party' },
  { value: 'study_group', label: 'Study Group', icon: 'study' },
  { value: 'sports', label: 'Sports', icon: 'sports' },
  { value: 'club', label: 'Club Meeting', icon: 'club' },
  { value: 'social', label: 'Social', icon: 'social' },
  { value: 'other', label: 'Other', icon: 'other' },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType]);

  const fetchEvents = async () => {
    setIsLoading(true);
    let query = supabase
      .from('events')
      .select(`
        *,
        organizer:profiles!organizer_id(full_name, avatar_url)
      `)
      .in('status', ['upcoming', 'ongoing'])
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true });

    if (filterType !== 'all') {
      query = query.eq('event_type', filterType);
    }

    const { data, error } = await query;

    if (!error && data) {
      setEvents(data as unknown as Event[]);
    }
    setIsLoading(false);
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text">Events & Parties</h1>
            <p className="text-sm sm:text-base text-text/60 mt-2">Discover and join campus events</p>
          </div>
          <Link
            href="/events/create"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all duration-200 cursor-pointer hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden xs:inline">Create Event</span>
            <span className="inline xs:hidden">Create</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 sm:py-3 pl-10 sm:pl-11 bg-background border-2 border-accent/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all text-text placeholder-text/60 text-sm sm:text-base hover:border-accent/50"
            />
            <svg
              className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Event Type Filter */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 sm:px-5 py-2.5 text-sm sm:text-base rounded-lg font-bold transition-all duration-200 cursor-pointer whitespace-nowrap border-2 ${
                filterType === 'all'
                  ? 'bg-purple-600 text-white shadow-xl border-purple-600 scale-105'
                  : 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600 hover:border-gray-500'
              }`}
            >
              All Events
            </button>
            {eventTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setFilterType(type.value)}
                className={`px-4 sm:px-5 py-2.5 text-sm sm:text-base rounded-lg font-bold transition-all duration-200 cursor-pointer whitespace-nowrap border-2 ${
                  filterType === type.value
                    ? 'bg-purple-600 text-white shadow-xl border-purple-600 scale-105'
                    : 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600 hover:border-gray-500'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <div className="text-center">
              <div className="animate-spin h-10 w-10 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-text/60 text-sm sm:text-base">Loading events...</p>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <svg className="w-12 sm:w-16 h-12 sm:h-16 text-text/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg sm:text-xl font-semibold text-text mb-2">No events found</h3>
            <p className="text-text/60 text-sm sm:text-base mb-6">Try adjusting your filters or create a new event</p>
            <Link
              href="/events/create"
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all duration-200 cursor-pointer hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              Create Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredEvents.map(event => {
              const eventType = eventTypes.find(t => t.value === event.event_type);
              const startDate = new Date(event.starts_at);
              const spotsLeft = event.max_attendees ? event.max_attendees - event.attendee_count : null;

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group bg-surface rounded-2xl overflow-hidden border border-surface/50 hover:border-accent/30 transition-all duration-200 hover:shadow-xl hover:shadow-accent/10"
                >
                  {/* Event Image */}
                  <div className="aspect-[16/9] relative bg-background overflow-hidden">
                    {event.cover_image_url ? (
                      <Image
                        src={event.cover_image_url}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent-hover/20 text-4xl sm:text-6xl">
                        {eventType?.icon || '🎯'}
                      </div>
                    )}
                    {/* Event Type Badge */}
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-gradient-to-r from-accent to-accent-hover backdrop-blur-md px-3 py-1 rounded-lg text-xs sm:text-sm font-medium text-white shadow-lg">
                      {eventType?.label.split(' ').slice(1).join(' ')}
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="p-3 sm:p-4">
                    <h3 className="font-bold text-base sm:text-lg text-text mb-2 line-clamp-2 group-hover:text-accent transition-colors duration-200">
                      {event.title}
                    </h3>

                    {/* Date & Time */}
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-text/70 mb-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">
                        {startDate.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric'
                        })} at {startDate.toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-text/70 mb-3">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{event.location}</span>
                    </div>

                    {/* Attendees */}
                    <div className="flex items-center justify-between pt-3 border-t border-surface/50">
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {event.organizer.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-text/60 truncate">{event.organizer.full_name}</span>
                      </div>
                      {spotsLeft !== null && (
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap ${
                          spotsLeft > 10 
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : spotsLeft > 0
                            ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        }`}>
                          {spotsLeft > 0 ? `${spotsLeft} left` : 'Full'}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
