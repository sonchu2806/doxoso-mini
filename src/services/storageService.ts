import AsyncStorage from '@react-native-async-storage/async-storage';

export type SavedTicket = {
  channel: 'vietlott' | 'xskt';
  product: string;
  label: string;
  numbers?: number[];
  ticketNumber?: string;
  dai?: string;
  drawDate?: string;
  drawId?: string;
  frequency?: 'once' | 'every';
  kenoTextChoice?: string;
  createdAt?: string;
};

const KEY = 'doxoso_saved_tickets';

export async function saveTicket(ticket: SavedTicket): Promise<void> {
  const current = await getSavedTickets();
  const next = [{ ...ticket, createdAt: new Date().toISOString() }, ...current].slice(0, 200);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

export async function getSavedTickets(): Promise<SavedTicket[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SavedTicket = {
  channel: 'vietlott' | 'xskt';
  product: string;
  label: string;
  numbers?: number[];
  ticketNumber?: string;
  dai?: string;
  drawDate?: string;
  drawId?: string;
  frequency?: 'once' | 'every';
  kenoTextChoice?: string;
  createdAt?: string;
};

const KEY = 'doxoso_saved_tickets';

export async function saveTicket(ticket: SavedTicket): Promise<void> {
  const current = await getSavedTickets();
  const next = [{ ...ticket, createdAt: new Date().toISOString() }, ...current].slice(0, 200);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

export async function getSavedTickets(): Promise<SavedTicket[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SavedTicket = {
  channel: 'vietlott' | 'xskt';
  product: string;
  label: string;
  numbers?: number[];
  ticketNumber?: string;
  dai?: string;
  drawDate?: string;
  drawId?: string;
  frequency?: 'once' | 'every';
  kenoTextChoice?: string;
  createdAt?: string;
};

const KEY = 'doxoso_saved_tickets';

export async function saveTicket(ticket: SavedTicket): Promise<void> {
  const current = await getSavedTickets();
  const next = [{ ...ticket, createdAt: new Date().toISOString() }, ...current].slice(0, 200);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

export async function getSavedTickets(): Promise<SavedTicket[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SavedTicket = {
  id: string;
  channel: 'vietlott' | 'xskt';
  product: string;
  label: string;
  numbers?: number[];
  kenoTextChoice?: 'chan' | 'le' | 'lon' | 'nho';
  ticketNumber?: string;
  dai?: string;
  drawDate?: string;
  drawId?: string;
  frequency: 'every' | 'once';
  createdAt: string;
  lastResult?: {
    prize: string;
    amount: number;
    matched: boolean;
    date: string;
  };
};

const KEY = 'saved_tickets_v1';

function normalizeNums(nums?: number[]) {
  if (!nums || nums.length === 0) return '';
  return [...nums].map((n) => Number(n)).filter((n) => Number.isFinite(n)).sort((a, b) => a - b).join(',');
}

function ticketSignature(ticket: {
  channel: SavedTicket['channel'];
  product: SavedTicket['product'];
  label: SavedTicket['label'];
  numbers?: SavedTicket['numbers'];
  kenoTextChoice?: SavedTicket['kenoTextChoice'];
  ticketNumber?: SavedTicket['ticketNumber'];
  dai?: SavedTicket['dai'];
  drawDate?: SavedTicket['drawDate'];
  drawId?: SavedTicket['drawId'];
  frequency: SavedTicket['frequency'];
}) {
  const base = [
    ticket.channel,
    ticket.product,
    (ticket.label || '').trim(),
    normalizeNums(ticket.numbers),
    (ticket.kenoTextChoice || '').trim(),
    (ticket.ticketNumber || '').replace(/\D/g, ''),
    (ticket.dai || '').trim().toLowerCase(),
    (ticket.drawDate || '').trim(),
    (ticket.drawId || '').trim(),
    ticket.frequency,
  ];
  return base.join('|');
}

export async function getSavedTickets(): Promise<SavedTicket[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveTicket(ticket: Omit<SavedTicket, 'id' | 'createdAt'>): Promise<SavedTicket> {
  const tickets = await getSavedTickets();
  const sig = ticketSignature(ticket);
  const existing = tickets.find((t) => {
    const tSig = ticketSignature({
      channel: t.channel,
      product: t.product,
      label: t.label,
      numbers: t.numbers,
      kenoTextChoice: t.kenoTextChoice,
      ticketNumber: t.ticketNumber,
      dai: t.dai,
      drawDate: t.drawDate,
      drawId: t.drawId,
      frequency: t.frequency,
    });
    return tSig === sig;
  });
  if (existing) return existing;

  const newTicket: SavedTicket = {
    ...ticket,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(KEY, JSON.stringify([newTicket, ...tickets]));
  return newTicket;
}

export async function deleteTicket(id: string): Promise<void> {
  const tickets = await getSavedTickets();
  await AsyncStorage.setItem(KEY, JSON.stringify(tickets.filter((t) => t.id !== id)));
}

export async function updateTicketResult(id: string, result: SavedTicket['lastResult']): Promise<void> {
  const tickets = await getSavedTickets();
  const updated = tickets.map((t) => (t.id === id ? { ...t, lastResult: result } : t));
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}
