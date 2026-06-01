export const API_BASE = 'https://web-production-d8605.up.railway.app';

/** Đài XSKT miền Bắc: số vé 5 chữ số; miền Nam / Trung: 6 chữ số. */
export const XSKT_MIEN_BAC_DAIS = [
  'Hà Nội',
  'Hải Phòng',
  'Quảng Ninh',
  'Bắc Ninh',
  'Nam Định',
  'Thái Bình',
] as const;

export function isXsktMienBacDai(dai: string): boolean {
  const d = (dai || '').trim();
  return (XSKT_MIEN_BAC_DAIS as readonly string[]).includes(d);
}

export function xsktExpectedTicketDigitCount(dai: string): 5 | 6 {
  return isXsktMienBacDai(dai) ? 5 : 6;
}

function normalizePrizeLabelKey(label: string): string {
  return String(label || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Số chữ số mỗi giải (MN/MT); MB: đặc biệt 5, các giải khác theo bảng MB. */
export function xsktDigitsPerPrizeLabel(label: string, mienBac = false): number {
  const l = normalizePrizeLabelKey(label);
  if (l.includes('dac biet')) return mienBac ? 5 : 6;
  if (l.includes('tam') || l.includes('giai 8')) return 2;
  if (l.includes('bay') || l.includes('giai 7')) return 3;
  if (l.includes('nam') || l.includes('giai 5') || l.includes('sau') || l.includes('giai 6')) return 4;
  if (l.includes('nhat') || l.includes('nhi') || l.includes('ba') || l.includes('tu')) return 5;
  return 6;
}

/**
 * Tách chuỗi số dính (vd. giải ba 10 số → 2×5, giải tư 35 số → 7×5) khi API/DB lưu một phần tử.
 */
export function expandXsktPrizeNumbers(
  label: string,
  numbers: string[] | undefined,
  opts?: { mienBac?: boolean }
): string[] {
  const mb = !!opts?.mienBac;
  const len = xsktDigitsPerPrizeLabel(label, mb);
  const arr = (numbers || []).map((n) => String(n).trim()).filter(Boolean);
  const flat: string[] = [];
  for (const item of arr) {
    const raw = item.replace(/\D/g, '');
    if (!raw) continue;
    if (raw.length > len && raw.length % len === 0 && raw.length / len <= 30) {
      for (let i = 0; i < raw.length; i += len) flat.push(raw.slice(i, i + len));
    } else {
      flat.push(raw);
    }
  }
  return flat;
}

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

export function checkXSKTTicket(
  ticketNumber: string,
  result: { specialPrize?: string; prizes: { label: string; numbers: string[] }[] },
  dai?: string
) {
  const ticket = String(ticketNumber || '').replace(/\D/g, '');
  if (!ticket) return { matched: false, prize: '', amount: 0 };
  const mb = isXsktMienBacDai(dai || '');

  const normalize = (s: string) =>
    String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const getPrizeMeta = (label: string) => {
    const l = normalize(label);
    if (l.includes('dac biet')) return { digits: mb ? 5 : 6, rank: 0 };
    if (l.includes('nhat') || l.includes('giai 1')) return { digits: 5, rank: 1 };
    if (l.includes('nhi') || l.includes('giai 2')) return { digits: 5, rank: 2 };
    if (l.includes('ba') || l.includes('giai 3')) return { digits: 5, rank: 3 };
    if (l.includes('tu') || l.includes('giai 4')) return { digits: 5, rank: 4 };
    if (l.includes('nam') || l.includes('giai 5')) return { digits: 4, rank: 5 };
    if (l.includes('sau') || l.includes('giai 6')) return { digits: 4, rank: 6 };
    if (l.includes('bay') || l.includes('giai 7')) return { digits: 3, rank: 7 };
    if (l.includes('tam') || l.includes('giai 8')) return { digits: 2, rank: 8 };
    return { digits: 6, rank: 99 };
  };

  let best: { prize: string; rank: number } | null = null;
  for (const p of result?.prizes || []) {
    const { digits, rank } = getPrizeMeta(p?.label || '');
    for (const num of expandXsktPrizeNumbers(p?.label || '', p?.numbers, { mienBac: mb })) {
      const win = String(num || '').replace(/\D/g, '');
      if (!win) continue;
      const tailLen = Math.min(digits, ticket.length, win.length);
      if (tailLen <= 0) continue;
      if (ticket.slice(-tailLen) === win.slice(-tailLen)) {
        if (!best || rank < best.rank) {
          best = { prize: p.label, rank };
        }
      }
    }
  }

  if (best) return { matched: true, prize: best.prize, amount: 0 };
  return { matched: false, prize: '', amount: 0 };
}
