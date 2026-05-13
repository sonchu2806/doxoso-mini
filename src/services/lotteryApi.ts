export const API_BASE = 'https://web-production-d8605.up.railway.app';

/** Hiển thị ngày quay thống nhất dd/mm/yyyy (từ ISO yyyy-mm-dd hoặc chuỗi dd/mm/yyyy). */
export function formatVietlottKyRowDateVi(raw: string): string {
  const t = String(raw || '').trim();
  if (!t || t === '—') return t || '—';
  const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  const slash = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) return `${slash[1].padStart(2, '0')}/${slash[2].padStart(2, '0')}/${slash[3]}`;
  return t;
}

export async function fetchVietlottResult(product: string, kyso?: string) {
  const url = kyso
    ? `${API_BASE}/vietlott/${product}?kyso=${kyso}`
    : `${API_BASE}/vietlott/${product}`;

  console.log('[fetchVietlottResult] URL:', url);

  try {
    const res = await fetch(url);
    console.log('[fetchVietlottResult] Status:', res.status);
    if (!res.ok) throw new Error(`Server lỗi: ${res.status}`);
    const json = await res.json();
    console.log('[fetchVietlottResult] Data:', JSON.stringify(json).slice(0, 100));
    if (!json.success) throw new Error(json.error || 'Lỗi không xác định');
    return json.data;
  } catch (e) {
    console.error('[fetchVietlottResult] ERROR:', e);
    throw e;
  }
}

export async function fetchXSKTResult(dai: string, date?: string) {
  const normalizedDate = date ? date.replace(/\//g, '-') : '';
  const url = normalizedDate
    ? `${API_BASE}/xskt?dai=${encodeURIComponent(dai)}&date=${encodeURIComponent(normalizedDate)}`
    : `${API_BASE}/xskt?dai=${encodeURIComponent(dai)}`;
  console.log('[API] Calling:', url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Server lỗi: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Lỗi không xác định');
  return json.data;
}

export function checkVietlottTicket(myNumbers: number[], result: { numbers: number[]; powerNumber?: number }, product: string) {
  const mainNumbers = product === 'lotto535' ? myNumbers.slice(0, 5) : myNumbers;
  const matched = mainNumbers.filter((n) => result?.numbers?.includes(n));
  const hasPower = result?.powerNumber !== undefined && myNumbers.includes(result.powerNumber);
  let prize = '';
  let amount = 0;
  if (product === 'mega') {
    if (matched.length === 6) { prize = 'Jackpot'; amount = 0; }
    else if (matched.length === 5) { prize = 'Giải nhất'; amount = 10000000; }
    else if (matched.length === 4) { prize = 'Giải nhì'; amount = 300000; }
    else if (matched.length === 3) { prize = 'Giải ba'; amount = 30000; }
  } else if (product === 'power') {
    if (matched.length === 6 && hasPower) { prize = 'Jackpot 1'; amount = 0; }
    else if (matched.length === 6) { prize = 'Jackpot 2'; amount = 0; }
    else if (matched.length === 5 && hasPower) { prize = 'Giải nhất'; amount = 40000000; }
    else if (matched.length === 5) { prize = 'Giải nhì'; amount = 500000; }
    else if (matched.length === 4) { prize = 'Giải ba'; amount = 50000; }
    else if (matched.length === 3) { prize = 'Giải tư'; amount = 20000; }
  } else if (product === 'keno') {
    const n = mainNumbers.length;
    if (n === 10) {
      const prizeMap: Record<number, { prize: string; amount: number }> = {
        10: { prize: 'Keno 10/10', amount: 0 },
        9: { prize: 'Keno 9/10', amount: 0 },
        8: { prize: 'Keno 8/10', amount: 0 },
        7: { prize: 'Keno 7/10', amount: 0 },
        6: { prize: 'Keno 6/10', amount: 0 },
        5: { prize: 'Keno 5/10', amount: 0 },
        0: { prize: 'Keno 0/10', amount: 0 },
      };
      const hit = prizeMap[matched.length];
      if (hit) {
        prize = hit.prize;
        amount = hit.amount;
      }
    } else if (n >= 1 && n <= 10) {
      const k = matched.length;
      if (k === n) { prize = `Keno trúng ${k}/${n} số (trùng hết)`; amount = 0; }
      else if (k >= 5) { prize = `Keno trúng ${k}/${n} số`; amount = 0; }
      else if (k >= 3) { prize = `Keno trúng ${k}/${n} số (xem bảng giải)`; amount = 0; }
    }
  } else if (product === 'lotto535') {
    if (matched.length === 5 && hasPower) { prize = 'Jackpot'; amount = 0; }
    else if (matched.length === 5) { prize = 'Giải nhất'; amount = 2000000; }
    else if (matched.length === 4) { prize = 'Giải nhì'; amount = 0; }
    else if (matched.length === 3) { prize = 'Giải ba'; amount = 0; }
  }
  return { matched, prize, amount };
}

export function checkXSKTTicket(ticketNumber: string, result: { specialPrize: string; prizes: { label: string; numbers: string[] }[] }) {
  for (const p of result?.prizes || []) {
    for (const num of p.numbers || []) {
      if (num === ticketNumber) return { matched: true, prize: p.label, amount: 0 };
      if (ticketNumber.length >= 4 && num.endsWith(ticketNumber.slice(-4))) return { matched: true, prize: `${p.label} (4 số đuôi)`, amount: 0 };
      if (ticketNumber.length >= 2 && num.endsWith(ticketNumber.slice(-2))) return { matched: true, prize: 'Giải tám (2 số đuôi)', amount: 100000 };
    }
  }
  return { matched: false, prize: '', amount: 0 };
}
