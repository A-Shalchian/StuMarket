import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { DirectMessage, Event, EventRSVP, Friend, Item, Message, PublicChatMessage, User } from "./types";

const dataRoot = path.join(process.cwd(), "data");
const itemsFile = path.join(dataRoot, "items.json");
const messagesDir = path.join(dataRoot, "messages");
const usersFile = path.join(dataRoot, "users.json");
const friendsFile = path.join(dataRoot, "friends.json");
const publicChatFile = path.join(dataRoot, "publicChat.json");
const eventsFile = path.join(dataRoot, "events.json");
const rsvpFile = path.join(dataRoot, "rsvps.json");

async function ensureDataLayout(): Promise<void> {
  await fs.mkdir(dataRoot, { recursive: true });
  await fs.mkdir(messagesDir, { recursive: true });
  try {
    await fs.access(itemsFile);
  } catch {
    await fs.writeFile(itemsFile, JSON.stringify([], null, 2), "utf-8");
  }
  try {
    await fs.access(usersFile);
  } catch {
    await fs.writeFile(usersFile, JSON.stringify([], null, 2), "utf-8");
  }
  try {
    await fs.access(friendsFile);
  } catch {
    await fs.writeFile(friendsFile, JSON.stringify([], null, 2), "utf-8");
  }
  try {
    await fs.access(publicChatFile);
  } catch {
    await fs.writeFile(publicChatFile, JSON.stringify([], null, 2), "utf-8");
  }
  try {
    await fs.access(eventsFile);
  } catch {
    await fs.writeFile(eventsFile, JSON.stringify([], null, 2), "utf-8");
  }
  try {
    await fs.access(rsvpFile);
  } catch {
    await fs.writeFile(rsvpFile, JSON.stringify([], null, 2), "utf-8");
  }
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// Items
export async function getAllItems(): Promise<Item[]> {
  await ensureDataLayout();
  return readJsonFile<Item[]>(itemsFile, []);
}

export async function getItemById(itemId: string): Promise<Item | undefined> {
  const items = await getAllItems();
  return items.find((it) => it.id === itemId);
}

export async function addItem(partial: Omit<Item, "id" | "createdAt">): Promise<Item> {
  const items = await getAllItems();
  const newItem: Item = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...partial,
  };
  items.unshift(newItem);
  await writeJsonFile(itemsFile, items);
  return newItem;
}

// Messages per item
function itemMessagesFile(itemId: string): string {
  return path.join(messagesDir, `${itemId}.json`);
}

export async function getMessages(itemId: string): Promise<Message[]> {
  await ensureDataLayout();
  const file = itemMessagesFile(itemId);
  return readJsonFile<Message[]>(file, []);
}

export async function addMessage(itemId: string, payload: Omit<Message, "id" | "itemId" | "createdAt">): Promise<Message> {
  await ensureDataLayout();
  const file = itemMessagesFile(itemId);
  const existing = await readJsonFile<Message[]>(file, []);
  const msg: Message = {
    id: randomUUID(),
    itemId,
    createdAt: new Date().toISOString(),
    ...payload,
  };
  existing.push(msg);
  await writeJsonFile(file, existing);
  return msg;
}

// Users
export async function listUsers(): Promise<User[]> {
  await ensureDataLayout();
  return readJsonFile<User[]>(usersFile, []);
}

export async function createUser(name: string): Promise<User> {
  const users = await listUsers();
  const existing = users.find((u) => u.name.toLowerCase() === name.toLowerCase());
  if (existing) return existing;
  const user: User = { id: randomUUID(), name, createdAt: new Date().toISOString() };
  users.push(user);
  await writeJsonFile(usersFile, users);
  return user;
}

// Friends
export async function listFriends(userId: string): Promise<User[]> {
  await ensureDataLayout();
  const users = await listUsers();
  const friendships = await readJsonFile<Friend[]>(friendsFile, []);
  const friendIds = new Set(
    friendships
      .filter((f) => f.user === userId)
      .map((f) => f.friend)
  );
  return users.filter((u) => friendIds.has(u.id));
}

export async function addFriend(userId: string, friendId: string): Promise<void> {
  const friendships = await readJsonFile<Friend[]>(friendsFile, []);
  const exists = friendships.some((f) => f.user === userId && f.friend === friendId);
  if (!exists) {
    friendships.push({ user: userId, friend: friendId, createdAt: new Date().toISOString() });
    await writeJsonFile(friendsFile, friendships);
  }
}

// Public chat
export async function listPublicChat(): Promise<PublicChatMessage[]> {
  await ensureDataLayout();
  return readJsonFile<PublicChatMessage[]>(publicChatFile, []);
}

export async function postPublicChat(sender: string, text: string): Promise<PublicChatMessage> {
  const msgs = await listPublicChat();
  const m: PublicChatMessage = { id: randomUUID(), sender, text, createdAt: new Date().toISOString() };
  msgs.push(m);
  await writeJsonFile(publicChatFile, msgs);
  return m;
}

// Direct messages
function dmFileFor(a: string, b: string): string {
  const [x, y] = [a, b].sort();
  return path.join(dataRoot, "dms", `${x}__${y}.json`);
}

export async function listDM(a: string, b: string): Promise<DirectMessage[]> {
  await ensureDataLayout();
  const file = dmFileFor(a, b);
  return readJsonFile<DirectMessage[]>(file, []);
}

export async function postDM(from: string, to: string, text: string): Promise<DirectMessage> {
  await ensureDataLayout();
  const file = dmFileFor(from, to);
  const msgs = await readJsonFile<DirectMessage[]>(file, []);
  const m: DirectMessage = { id: randomUUID(), from, to, text, createdAt: new Date().toISOString() };
  msgs.push(m);
  await writeJsonFile(file, msgs);
  return m;
}

// Events
export async function listEvents(): Promise<Event[]> {
  await ensureDataLayout();
  return readJsonFile<Event[]>(eventsFile, []);
}

export async function getEventById(id: string): Promise<Event | undefined> {
  const events = await listEvents();
  return events.find((e) => e.id === id);
}

export async function createEvent(payload: Omit<Event, "id" | "createdAt">): Promise<Event> {
  const events = await listEvents();
  const event: Event = { id: randomUUID(), createdAt: new Date().toISOString(), ...payload };
  events.unshift(event);
  await writeJsonFile(eventsFile, events);
  return event;
}

// RSVPs
export async function listRSVPs(eventId: string): Promise<EventRSVP[]> {
  await ensureDataLayout();
  const all = await readJsonFile<EventRSVP[]>(rsvpFile, []);
  return all.filter((r) => r.eventId === eventId);
}

export async function userHasRSVP(eventId: string, userId: string): Promise<boolean> {
  const all = await readJsonFile<EventRSVP[]>(rsvpFile, []);
  return all.some((r) => r.eventId === eventId && r.userId === userId);
}

export async function createRSVP(eventId: string, userId: string): Promise<EventRSVP> {
  const all = await readJsonFile<EventRSVP[]>(rsvpFile, []);
  const existing = all.find((r) => r.eventId === eventId && r.userId === userId);
  if (existing) return existing;
  const r: EventRSVP = { id: randomUUID(), eventId, userId, createdAt: new Date().toISOString() };
  all.push(r);
  await writeJsonFile(rsvpFile, all);
  return r;
}


