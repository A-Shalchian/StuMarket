export type Item = {
  id: string;
  title: string;
  description: string;
  price: number;
  seller: string;
  imageUrl?: string;
  createdAt: string;
};

export type Message = {
  id: string;
  itemId: string;
  sender: string;
  text: string;
  createdAt: string;
};

export type User = {
  id: string;
  name: string;
  createdAt: string;
};

export type Friend = {
  user: string;
  friend: string;
  createdAt: string;
};

export type PublicChatMessage = {
  id: string;
  sender: string;
  text: string;
  createdAt: string;
};

export type DirectMessage = {
  id: string;
  from: string;
  to: string;
  text: string;
  createdAt: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date/time
  location: string;
  organizer: string; // name
  createdAt: string;
};

export type EventRSVP = {
  id: string;
  eventId: string;
  userId: string;
  createdAt: string;
};


