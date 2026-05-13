export function getRecentDrawDates(_product: string, limit = 15): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 0; i < limit; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    out.push(`${dd}-${mm}-${yyyy}`);
  }
  return out;
}

export function formatDrawDate(date: string): string {
  return date || 'Mới nhất';
}
export function getRecentDrawDates(_product: string, limit = 15): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 0; i < limit; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    out.push(`${dd}-${mm}-${yyyy}`);
  }
  return out;
}

export function formatDrawDate(date: string): string {
  return date || 'Mới nhất';
}
export function getRecentDrawDates(_product: string, limit = 15): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 0; i < limit; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    out.push(`${dd}-${mm}-${yyyy}`);
  }
  return out;
}

export function formatDrawDate(date: string): string {
  return date || 'Mới nhất';
}
// Lịch quay thưởng Vietlott
const DRAW_DAYS: Record<string, number[]> = {
  mega: [0, 3, 5], // CN, T4, T6
  power: [2, 4, 6], // T3, T5, T7
  keno: [0, 1, 2, 3, 4, 5, 6], // Mỗi ngày
  max3d: [1, 3, 5], // T2, T4, T6
  max3dpro: [1, 3, 5], // T2, T4, T6
  lotto535: [0, 1, 2, 3, 4, 5, 6], // Mỗi ngày
};

// Tạo danh sách 30 ngày gần nhất có quay thưởng
export function getRecentDrawDates(product: string, limit = 10): string[] {
  const days = DRAW_DAYS[product];
  if (!days) return [];

  const dates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const current = new Date(today);
  let count = 0;

  while (count < limit) {
    const dayOfWeek = current.getDay();
    if (days.includes(dayOfWeek)) {
      const dd = String(current.getDate()).padStart(2, '0');
      const mm = String(current.getMonth() + 1).padStart(2, '0');
      const yyyy = current.getFullYear();
      dates.push(`${dd}-${mm}-${yyyy}`);
      count++;
    }
    current.setDate(current.getDate() - 1);
  }

  return dates;
}

// Format ngày để hiển thị
export function formatDrawDate(dateStr: string): string {
  // dateStr: DD-MM-YYYY
  const [dd, mm, yyyy] = dateStr.split('-');
  const date = new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const dayName = days[date.getDay()];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.getTime() === today.getTime()) return 'Hôm nay';
  if (date.getTime() === yesterday.getTime()) return 'Hôm qua';
  return `${dayName} ${dd}/${mm}`;
}
