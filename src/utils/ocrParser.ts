import { isXsktMienBacDai } from '../services/lotteryApi';

export type ParsedTicket =
  | { type: 'xskt'; ticketNumber: string; dai?: string }
  | { type: 'vietlott_qr'; product: string; numbers?: number[] }
  | { type: 'unknown' };

/** QR / pipe-delimited / JSON Vietlott */
export function parseVietlottQR(raw: string): ParsedTicket {
  if (!raw || !String(raw).trim()) return { type: 'unknown' };

  try {
    const data = JSON.parse(raw);
    if (data.numbers || data.nums) {
      return {
        type: 'vietlott_qr',
        product: String(data.product || 'mega').toLowerCase(),
        numbers: (data.numbers || data.nums).map((n: number | string) => Number(n)).filter((n: number) => !Number.isNaN(n)),
      };
    }
  } catch {
    /* not JSON */
  }

  const parts = raw.split('|');
  if (parts.length >= 3) {
    const numbers = parts[2]
      .split(/[,;\s]+/)
      .map((s) => Number(String(s).trim()))
      .filter((n) => !Number.isNaN(n));
    if (numbers.length >= 3) {
      return {
        type: 'vietlott_qr',
        product: String(parts[0] || 'mega').toLowerCase().replace(/\s+/g, ''),
        numbers,
      };
    }
  }

  const lower = raw.toLowerCase();
  const nums = (raw.match(/\b\d{1,2}\b/g) || []).map((s) => Number(s)).filter((n) => n >= 0 && n <= 80);

  if (/keno/i.test(lower)) return { type: 'vietlott_qr', product: 'keno', numbers: nums.slice(0, 10) };
  if (/mega|6\s*\/\s*45/i.test(lower)) return { type: 'vietlott_qr', product: 'mega', numbers: nums.slice(0, 6) };
  if (/power|6\s*\/\s*55|655/i.test(lower)) return { type: 'vietlott_qr', product: 'power', numbers: nums.slice(0, 6) };
  if (/max\s*3d\s*pro|max3dpro|3d\s*pro/i.test(lower)) return { type: 'vietlott_qr', product: 'max3dpro', numbers: nums.slice(0, 6) };
  if (/max\s*3d|max3d/i.test(lower)) return { type: 'vietlott_qr', product: 'max3d', numbers: nums.slice(0, 3) };
  if (/lotto|5\s*\/\s*35|535/i.test(lower)) return { type: 'vietlott_qr', product: 'lotto535', numbers: nums.slice(0, 6) };

  const pairMatches = raw.match(/\b([0-9]{2})\b/g);
  if (pairMatches && pairMatches.length >= 6) {
    return {
      type: 'vietlott_qr',
      product: 'mega',
      numbers: pairMatches.slice(0, 6).map(Number),
    };
  }

  return { type: 'unknown' };
}

const DAI_LIST = [
  'TP. Hồ Chí Minh',
  'TP.HCM',
  'Đồng Nai',
  'Bình Dương',
  'Vũng Tàu',
  'Long An',
  'Tiền Giang',
  'Bến Tre',
  'Đồng Tháp',
  'Cà Mau',
  'An Giang',
  'Kiên Giang',
  'Cần Thơ',
  'Hậu Giang',
  'Sóc Trăng',
  'Bạc Liêu',
  'Trà Vinh',
  'Vĩnh Long',
  'Tây Ninh',
  'Bình Thuận',
  'Bình Phước',
  'Đà Nẵng',
  'Khánh Hòa',
  'Thừa Thiên Huế',
  'Huế',
  'Quảng Nam',
  'Bình Định',
  'Phú Yên',
  'Quảng Ngãi',
  'Quảng Trị',
  'Quảng Bình',
  'Ninh Thuận',
  'Gia Lai',
  'Đắk Lắk',
  'Đắk Nông',
  'Kon Tum',
  'Hà Nội',
  'Hải Phòng',
  'Quảng Ninh',
  'Bắc Ninh',
  'Nam Định',
  'Thái Bình',
  'Đà Lạt',
];

export function parseXSKTOCR(text: string): ParsedTicket {
  const compactDigits = text.replace(/\D/g, '');
  const normalizedText = text.toLowerCase();
  const foundDai = DAI_LIST.find(
    (d) =>
      normalizedText.includes(d.toLowerCase().replace(/\./g, '')) ||
      normalizedText.includes(d.toLowerCase())
  );
  const daiNorm = foundDai?.replace(/^TP\.HCM$/i, 'TP. Hồ Chí Minh');
  const mb = daiNorm ? isXsktMienBacDai(daiNorm) : false;

  let ticket = '';
  if (mb) {
    const m5 = compactDigits.match(/(\d{5})/);
    if (m5) ticket = m5[1];
    else {
      const spaced = text.match(/\b(\d\s*){5}\b/);
      if (spaced) ticket = spaced[0].replace(/\D/g, '');
    }
    if (ticket.length === 5) {
      return { type: 'xskt', ticketNumber: ticket, dai: daiNorm };
    }
  }

  const m6 = compactDigits.match(/(\d{6})/);
  if (m6) ticket = m6[1];
  else {
    const spaced = text.match(/\b(\d\s*){6}\b/);
    if (spaced) ticket = spaced[0].replace(/\D/g, '');
  }
  if (ticket.length === 6) {
    return {
      type: 'xskt',
      ticketNumber: ticket,
      dai: daiNorm,
    };
  }
  return { type: 'unknown' };
}

export function parseOCRCombined(text: string, channel: 'vietlott' | 'xskt'): ParsedTicket {
  const t = text.replace(/\r/g, '\n').trim();
  if (!t) return { type: 'unknown' };

  if (channel === 'xskt') {
    const xs = parseXSKTOCR(t);
    if (xs.type === 'xskt') return xs;
    const vl = parseVietlottQR(t);
    if (vl.type === 'vietlott_qr') return vl;
  } else {
    const vl = parseVietlottQR(t);
    if (vl.type === 'vietlott_qr') return vl;
    const xs = parseXSKTOCR(t);
    if (xs.type === 'xskt') return xs;
  }
  return { type: 'unknown' };
}

export type OCRProgress = { status: string; progress: number };

/**
 * Đọc chữ từ ảnh (Tesseract). Web (Expo web) hoạt động ổn định; native có thể chậm hoặc cần ML Kit sau.
 */
export async function processImageWithOCR(
  uri: string,
  channel: 'vietlott' | 'xskt',
  onProgress?: (fraction: number) => void
): Promise<ParsedTicket> {
  try {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('vie+eng', undefined, {
      logger: (m: { status?: string; progress?: number }) => {
        if (typeof m?.progress === 'number') onProgress?.(Math.min(1, Math.max(0, m.progress)));
      },
    });
    const { data } = await worker.recognize(uri);
    await worker.terminate();
    const text = data?.text || '';
    return parseOCRCombined(text, channel);
  } catch (e) {
    console.warn('[processImageWithOCR]', e);
    return { type: 'unknown' };
  }
}

export function getConfidence(text: string): number {
  const hasNumbers = /\d{6}/.test(text);
  const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text);
  const length = text.trim().length;
  let score = 0;
  if (hasNumbers) score += 0.5;
  if (hasVietnamese) score += 0.2;
  if (length > 20) score += 0.3;
  return Math.min(score, 1.0);
}
