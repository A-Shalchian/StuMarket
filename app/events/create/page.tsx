"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';

const eventTypes = [
  { value: 'party', label: 'Party' },
  { value: 'study_group', label: 'Study Group' },
  { value: 'sports', label: 'Sports' },
  { value: 'club', label: 'Club Meeting' },
  { value: 'social', label: 'Social' },
  { value: 'other', label: 'Other' },
];

export default function CreateEventPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'party',
    location: '',
    campus: '',
    starts_at: '',
    ends_at: '',
    max_attendees: '',
    ticket_price: '',
    is_private: false,
    requires_approval: false,
  });

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUserId(user.id);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setPosterFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPosterPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadPoster = async (): Promise<string | null> => {
    if (!posterFile || !currentUserId) return null;

    const fileExt = posterFile.name.split('.').pop();
    const fileName = `${currentUserId}-${Date.now()}.${fileExt}`;
    const filePath = `event-posters/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('listings')
      .upload(filePath, posterFile);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('listings')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUserId) {
      toast.error('Please log in to create an event');
      return;
    }

    // Validation
    if (!formData.title || !formData.description || !formData.location || !formData.starts_at) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate dates
    const startDate = new Date(formData.starts_at);
    const now = new Date();
    if (startDate < now) {
      toast.error('Event start time must be in the future');
      return;
    }

    if (formData.ends_at) {
      const endDate = new Date(formData.ends_at);
      if (endDate <= startDate) {
        toast.error('Event end time must be after start time');
        return;
      }
    }

    setIsLoading(true);

    try {
      // Upload poster if provided
      let posterUrl = null;
      if (posterFile) {
        posterUrl = await uploadPoster();
        if (!posterUrl) {
          toast.error('Failed to upload poster');
          setIsLoading(false);
          return;
        }
      }

      // Create event
      const { data: event, error } = await supabase
        .from('events')
        .insert({
          organizer_id: currentUserId,
          title: formData.title,
          description: formData.description,
          event_type: formData.event_type,
          location: formData.location,
          campus: formData.campus || null,
          starts_at: formData.starts_at,
          ends_at: formData.ends_at || null,
          max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
          cover_image_url: posterUrl,
          is_private: formData.is_private,
          requires_approval: formData.requires_approval,
          status: 'upcoming',
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Event created successfully!');
      router.push(`/events/${event.id}`);
    } catch (err) {
      console.error('Error creating event:', err);
      toast.error('Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8">
      <div className="max-w-3xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text">Create Event</h1>
          <p className="text-sm sm:text-base text-text/60 mt-2">Share your event with the campus community</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl p-4 sm:p-6 space-y-6">
          {/* Event Poster */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Event Poster / Cover Image
            </label>
            <div className="space-y-4">
              {posterPreview ? (
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-background">
                  <Image
                    src={posterPreview}
                    alt="Event poster preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPosterPreview(null);
                      setPosterFile(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="block aspect-[16/9] border-2 border-dashed border-surface rounded-xl cursor-pointer hover:border-accent hover:bg-accent/5 transition-all">
                  <div className="h-full flex flex-col items-center justify-center text-text/60 p-4">
                    <svg className="w-10 sm:w-12 h-10 sm:h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-medium">Click to upload event poster</p>
                    <p className="text-xs mt-1 text-text/50">PNG, JPG up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Event Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text mb-2">
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., End of Semester Party"
              className="w-full px-4 py-3 bg-background border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text placeholder-text/50"
            />
          </div>

          {/* Event Type */}
          <div>
            <label htmlFor="event_type" className="block text-sm font-medium text-text mb-2">
              Event Type *
            </label>
            <select
              id="event_type"
              name="event_type"
              value={formData.event_type}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-background border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text"
            >
              {eventTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
              placeholder="Describe your event, what to expect, dress code, etc..."
              className="w-full px-4 py-3 bg-background border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text placeholder-text/50 resize-none"
            />
          </div>

          {/* Location and Campus */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-text mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g., Casa Loma Campus"
                className="w-full px-4 py-3 bg-background border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text placeholder-text/50"
              />
            </div>
            <div>
              <label htmlFor="campus" className="block text-sm font-medium text-text mb-2">
                Campus (Optional)
              </label>
              <input
                type="text"
                id="campus"
                name="campus"
                value={formData.campus}
                onChange={handleChange}
                placeholder="e.g., Casa Loma"
                className="w-full px-4 py-3 bg-background border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text placeholder-text/50"
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="starts_at" className="block text-sm font-medium text-text mb-2">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                id="starts_at"
                name="starts_at"
                value={formData.starts_at}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-background border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text"
              />
            </div>
            <div>
              <label htmlFor="ends_at" className="block text-sm font-medium text-text mb-2">
                End Date & Time (Optional)
              </label>
              <input
                type="datetime-local"
                id="ends_at"
                name="ends_at"
                value={formData.ends_at}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-background border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text"
              />
            </div>
          </div>

          {/* Max Attendees */}
          <div>
            <label htmlFor="max_attendees" className="block text-sm font-medium text-text mb-2">
              Maximum Attendees (Optional)
            </label>
            <input
              type="number"
              id="max_attendees"
              name="max_attendees"
              value={formData.max_attendees}
              onChange={handleChange}
              min="1"
              placeholder="Leave empty for unlimited"
              className="w-full px-4 py-3 bg-background border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-text placeholder-text/50"
            />
          </div>

          {/* Event Settings */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_private"
                checked={formData.is_private}
                onChange={handleChange}
                className="w-5 h-5 rounded border-surface text-accent focus:ring-accent"
              />
              <div>
                <p className="text-sm font-medium text-text">Private Event</p>
                <p className="text-xs text-text/60">Only visible to invited people</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="requires_approval"
                checked={formData.requires_approval}
                onChange={handleChange}
                className="w-5 h-5 rounded border-surface text-accent focus:ring-accent"
              />
              <div>
                <p className="text-sm font-medium text-text">Requires Approval</p>
                <p className="text-xs text-text/60">You&apos;ll approve each attendee</p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-surface hover:bg-surface/60 text-text font-medium rounded-xl transition-all duration-200 cursor-pointer border border-transparent hover:border-accent/30 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-accent to-accent-hover hover:shadow-lg text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:scale-105 text-sm sm:text-base"
            >
              {isLoading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
