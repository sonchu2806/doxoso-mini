import { ThemeProvider } from '@shopify/restyle';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Alert, Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ScanModal from './src/components/ScanModal';
import WinFireworksOverlay from './src/components/WinFireworksOverlay';
import type { ParsedTicket } from './src/utils/ocrParser';
import {
  ActionRow,
  DrawDatePicker,
  KenoTextMode,
  KySoPicker,
  Max3DProInput,
  NumberPicker,
  ProductInfoBanner,
  ProductStrip,
  ResultCard,
  SavedList,
  saveTicket,
  SlotInput,
  type ProductKey,
  type KenoTextValue,
  type KenoTab,
  theme,
  XSKTInput,
  API_BASE,
  checkVietlottTicket,
  checkXSKTTicket,
  fetchVietlottResult,
  fetchXSKTResult,
  getRecentDrawDates,
  haptics,
  xsktExpectedTicketDigitCount,
} from './recovered';

const TAB_ICON_XSKT = require('./assets/tab-xskt.png');
const TAB_ICON_SCAN = require('./assets/tab-scan.png');
const TAB_ICON_VIETLOTT = require('./assets/tab-vietlott.png');

const SF_PRO_TEXT = Platform.select({ ios: 'SF Pro Text', default: 'System' });
const MOMO_TRUST = 'MoMo Trust';

const XSKT_MIEN_BAC_DAIS = ['Hà Nội', 'Hải Phòng', 'Quảng Ninh', 'Bắc Ninh', 'Nam Định', 'Thái Bình'] as const;
const XSKT_MIEN_TRUNG_DAIS = [
  'Đà Nẵng',
  'Khánh Hòa',
  'Huế',
  'Quảng Nam',
  'Bình Định',
  'Phú Yên',
  'Ninh Thuận',
  'Gia Lai',
  'Đắk Lắk',
] as const;

function parseViDateToLocalDate(raw: string): Date | null {
  const m = String(raw || '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const d = new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10), 0, 0, 0, 0);
  return Number.isNaN(d.getTime()) ? null : d;
}

function sameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function xsktDrawTimeForDai(dai: string): { hour: number; minute: number } {
  if ((XSKT_MIEN_BAC_DAIS as readonly string[]).includes(dai)) return { hour: 18, minute: 15 };
  if ((XSKT_MIEN_TRUNG_DAIS as readonly string[]).includes(dai)) return { hour: 17, minute: 15 };
  return { hour: 16, minute: 15 };
}

function formatTwoDigits(n: number): string {
  return String(Math.max(0, n)).padStart(2, '0');
}

function getXsktNotYetDrawnNotice(dai: string, drawDateVi: string): string | null {
  const drawDate = parseViDateToLocalDate(drawDateVi);
  if (!drawDate) return null;
  const now = new Date();
  if (!sameLocalDay(now, drawDate)) return null;
  const drawTime = xsktDrawTimeForDai(dai);
  const drawAt = new Date(drawDate);
  drawAt.setHours(drawTime.hour, drawTime.minute, 0, 0);
  if (now >= drawAt) return null;
  const dd = formatTwoDigits(drawAt.getDate());
  const mon = formatTwoDigits(drawAt.getMonth() + 1);
  const yyyy = drawAt.getFullYear();
  const hh = formatTwoDigits(drawAt.getHours());
  const mm = formatTwoDigits(drawAt.getMinutes());
  return `Chưa có kết quả quay số. Kết quả sẽ có sau ${hh}:${mm} ${dd}/${mon}/${yyyy}.`;
}

const withFontFamily = (baseStyle: any) => {
  const fontWeight = baseStyle?.fontWeight;
  const useMoMoTrust =
    fontWeight === '700' ||
    fontWeight === '800' ||
    fontWeight === '900' ||
    fontWeight === 'bold';
  return {
    ...baseStyle,
    fontFamily: useMoMoTrust ? MOMO_TRUST : SF_PRO_TEXT,
  };
};

const GlobalText: any = Text;
const GlobalTextInput: any = TextInput;

if (!GlobalText.defaultProps) GlobalText.defaultProps = {};
GlobalText.defaultProps.style = withFontFamily(GlobalText.defaultProps.style || {});

if (!GlobalTextInput.defaultProps) GlobalTextInput.defaultProps = {};
GlobalTextInput.defaultProps.style = withFontFamily(GlobalTextInput.defaultProps.style || {});

const PRODUCT_CONFIG: Record<
  ProductKey,
  {
    count: number;
    maxValue: number;
    isDigit: boolean;
    accentColor: string;
    pickCount?: number;
  }
> = {
  keno: { count: 10, maxValue: 80, isDigit: false, accentColor: theme.colors.accentKeno },
  mega: { count: 6, maxValue: 45, isDigit: false, accentColor: theme.colors.accentMega, pickCount: 6 },
  power: { count: 6, maxValue: 55, isDigit: false, accentColor: theme.colors.accentPower, pickCount: 6 },
  max3d: { count: 3, maxValue: 9, isDigit: true, accentColor: theme.colors.accentMax3D },
  max3dpro: { count: 6, maxValue: 9, isDigit: true, accentColor: theme.colors.accentMax3DPro },
  lotto535: { count: 5, maxValue: 35, isDigit: false, accentColor: theme.colors.accentLotto535, pickCount: 5 },
};

export default function App() {
  const [channel, setChannel] = useState<'vietlott' | 'xskt'>('vietlott');
  const [tab, setTab] = useState<'do' | 'luu'>('do');
  const [product, setProduct] = useState<ProductKey>('keno');
  const [kenoTab, setKenoTab] = useState<KenoTab>('so');
  const [kenoTextValue, setKenoTextValue] = useState<KenoTextValue>(null);
  const [slotValues, setSlotValues] = useState<string[]>(Array(10).fill(''));
  const [pickerValues, setPickerValues] = useState<number[]>([]);
  const [max3dProValues, setMax3dProValues] = useState<[string[], string[]]>([Array(3).fill(''), Array(3).fill('')]);
  const [xsktNum, setXsktNum] = useState('');
  const [xsktDai, setXsktDai] = useState('TP. Hồ Chí Minh');
  const [xsktDate, setXsktDate] = useState(new Date().toLocaleDateString('vi-VN'));
  const [kyNumber, setKyNumber] = useState<string>('');
  const kyNumberRef = useRef('');
  const scrollRef = useRef<ScrollView | null>(null);
  const resultCardYRef = useRef(0);
  const actionRowYRef = useRef(0);
  const [showWinFx, setShowWinFx] = useState(false);
  const [drawDate, setDrawDate] = useState<string>('');
  const [lotto535Special, setLotto535Special] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);
  const [apiResult, setApiResult] = useState<any>(null);
  const [scanVisible, setScanVisible] = useState(false);
  const [savedRefreshKey, setSavedRefreshKey] = useState(0);

  const config = PRODUCT_CONFIG[product];
  void getRecentDrawDates;
  const clearResultState = () => {
    setCheckResult(null);
    setApiResult(null);
  };

  useEffect(() => {
    clearResultState();
  }, [channel, product, tab, kenoTab, kenoTextValue, slotValues, pickerValues, max3dProValues, xsktNum, xsktDai, xsktDate, kyNumber, lotto535Special]);

  useEffect(() => {
    setKyNumber('');
    kyNumberRef.current = '';
  }, [product]);

  useEffect(() => {
    kyNumberRef.current = kyNumber;
  }, [kyNumber]);

  useEffect(() => {
    if (tab !== 'do') return;
    if (isLoading) return;
    if (!checkResult || !apiResult) return;
    const delay = checkResult.prize ? 480 : 0;
    const id = setTimeout(() => {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          y: Math.max(0, resultCardYRef.current - 12),
          animated: true,
        });
      });
    }, delay);
    return () => clearTimeout(id);
  }, [isLoading, checkResult, apiResult, tab]);

  useEffect(() => {
    if (!checkResult?.prize || !apiResult) {
      setShowWinFx(false);
      return;
    }
    setShowWinFx(true);
    const t = setTimeout(() => setShowWinFx(false), 2800);
    return () => clearTimeout(t);
  }, [checkResult?.prize, apiResult]);

  const vietlottSelectionComplete =
    channel === 'vietlott' &&
    tab === 'do' &&
    (product === 'mega' || product === 'power'
      ? pickerValues.length === 6
      : product === 'lotto535'
        ? pickerValues.length === 5 && lotto535Special.length === 1
        : product === 'keno' && kenoTab === 'so'
          ? pickerValues.length === 10
          : product === 'keno' && kenoTab === 'text'
            ? kenoTextValue !== null
            : product === 'max3d'
              ? slotValues.filter((v) => v && String(v).trim() !== '').length === 3
              : product === 'max3dpro'
                ? max3dProValues[0].every((v) => v && String(v).trim() !== '') &&
                  max3dProValues[1].every((v) => v && String(v).trim() !== '')
                : false);

  useEffect(() => {
    if (!vietlottSelectionComplete) return;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, actionRowYRef.current - 16),
        animated: true,
      });
    });
  }, [vietlottSelectionComplete, product, pickerValues, slotValues, max3dProValues, kenoTab, kenoTextValue, lotto535Special]);

  const handleResetForm = () => {
    haptics.selection();
    clearResultState();
    setDrawDate('');
    setKyNumber('');
    kyNumberRef.current = '';
    setKenoTab('so');
    setKenoTextValue(null);
    setPickerValues([]);
    setSlotValues(Array(10).fill(''));
    setMax3dProValues([Array(3).fill(''), Array(3).fill('')]);
    setLotto535Special([]);
    if (channel === 'xskt') {
      setXsktNum('');
    }
  };

  const handleProductChange = (p: ProductKey) => {
    haptics.selection();
    clearResultState();
    setProduct(p);
    setDrawDate('');
    setKenoTab('so');
    setKenoTextValue(null);

    if (p === 'keno' || p === 'max3d') {
      setSlotValues(Array(PRODUCT_CONFIG[p].count).fill(''));
      return;
    }

    if (p === 'mega' || p === 'power' || p === 'lotto535') {
      setPickerValues([]);
      if (p !== 'lotto535') setLotto535Special([]);
      return;
    }

    setMax3dProValues([Array(3).fill(''), Array(3).fill('')]);
  };

  const evaluateKenoTextResult = (
    choice: Exclude<KenoTextValue, null>,
    numbers: number[]
  ): { isWin: boolean; prize: string; amount: number; summary: string } => {
    const evenCount = numbers.filter((n) => n % 2 === 0).length;
    const oddCount = numbers.length - evenCount;
    const highCount = numbers.filter((n) => n > 40).length;
    const lowCount = numbers.length - highCount;

    const chooseMap = {
      chan: { isWin: evenCount >= 13, title: 'Chẵn', summary: `Chẵn ${evenCount} / Lẻ ${oddCount}` },
      chan1112: { isWin: evenCount === 11 || evenCount === 12, title: 'Chẵn 11-12', summary: `Chẵn ${evenCount} / Lẻ ${oddCount}` },
      hoachanle: { isWin: evenCount === 10 && oddCount === 10, title: 'Hòa Chẵn/Lẻ', summary: `Chẵn ${evenCount} / Lẻ ${oddCount}` },
      le1112: { isWin: oddCount === 11 || oddCount === 12, title: 'Lẻ 11-12', summary: `Lẻ ${oddCount} / Chẵn ${evenCount}` },
      le: { isWin: oddCount >= 13, title: 'Lẻ', summary: `Lẻ ${oddCount} / Chẵn ${evenCount}` },
      lon: { isWin: highCount >= 11, title: 'Lớn', summary: `Lớn ${highCount} (41-80) / Nhỏ ${lowCount} (01-40)` },
      hoalonnho: {
        isWin: highCount === 10 && lowCount === 10,
        title: 'Hòa Lớn/Nhỏ',
        summary: `Lớn ${highCount} (41-80) / Nhỏ ${lowCount} (01-40)`,
      },
      nho: { isWin: lowCount >= 11, title: 'Nhỏ', summary: `Nhỏ ${lowCount} (01-40) / Lớn ${highCount} (41-80)` },
    } as const;

    const selected = chooseMap[choice];
    return {
      isWin: selected.isWin,
      prize: selected.isWin ? `Keno ${selected.title}` : '',
      amount: selected.isWin ? 20000 : 0,
      summary: selected.summary,
    };
  };

  const getVietlottTicketNumbers = () => {
    if (product === 'lotto535') {
      return lotto535Special.length === 1 ? [...pickerValues, lotto535Special[0]] : pickerValues;
    }
    if (product === 'mega' || product === 'power') return pickerValues;
    if (product === 'keno' && kenoTab !== 'text') return pickerValues;
    if (product === 'max3d') {
      const digits = slotValues.map((v) => v.trim()).filter((v) => /^\d$/.test(v));
      return digits.length === 3 ? [Number(digits.join(''))] : [];
    }
    if (product === 'max3dpro') {
      const first = max3dProValues[0].map((v) => v.trim());
      const second = max3dProValues[1].map((v) => v.trim());
      const tickets: number[] = [];
      if (first.every((v) => /^\d$/.test(v))) tickets.push(Number(first.join('')));
      if (second.every((v) => /^\d$/.test(v))) tickets.push(Number(second.join('')));
      return tickets;
    }
    return [];
  };

  const handleCheck = async () => {
    console.log('Đang dò product:', product, 'channel:', channel);
    console.log('API_BASE:', API_BASE);

    let valid = false;
    let msg = '';

    if (channel === 'vietlott' && product === 'lotto535' && lotto535Special.length !== 1) {
      valid = false;
      msg = 'Vui lòng nhập số đặc biệt cho Lotto 5/35!';
    } else if (channel === 'xskt') {
      const xsktDigits = (xsktNum || '').replace(/\D/g, '');
      const need = xsktExpectedTicketDigitCount(xsktDai);
      valid = xsktDigits.length === need;
      msg =
        xsktDigits.length === 0
          ? 'Vui lòng nhập số vé!'
          : `Vui lòng nhập đủ ${need} số vé (${need === 5 ? 'miền Bắc' : 'miền Nam / Trung'})!`;
    } else if (product === 'keno') {
      if (kenoTab === 'text') {
        valid = kenoTextValue !== null;
        msg = 'Vui lòng chọn kiểu chơi Keno (Chẵn/Lẻ/Lớn/Nhỏ)!';
      } else {
        const filled = pickerValues.length;
        valid = filled >= 1 && filled <= PRODUCT_CONFIG.keno.count;
        msg = `Vui lòng chọn từ 1 đến ${PRODUCT_CONFIG.keno.count} số!`;
      }
    } else if (product === 'mega' || product === 'power' || product === 'lotto535') {
      valid = pickerValues.length === config.pickCount;
      msg = `Vui lòng chọn đủ ${config.pickCount} số!`;
    } else if (product === 'max3d') {
      valid = slotValues.filter((v) => v).length === 3;
      msg = 'Vui lòng nhập đủ 3 chữ số!';
    } else if (product === 'max3dpro') {
      valid = max3dProValues[0].every((v) => v) && max3dProValues[1].every((v) => v);
      msg = 'Vui lòng nhập đủ cả 2 bộ số!';
    }

    if (!valid) {
      Alert.alert('Chưa đủ số', msg || 'Vui lòng nhập/chọn đủ thông tin trước khi Dò kết quả.');
      return;
    }
    if (channel === 'xskt') {
      const notice = getXsktNotYetDrawnNotice(xsktDai, xsktDate);
      if (notice) {
        Alert.alert('Thông báo', notice);
        return;
      }
    }

    setIsLoading(true);
    setCheckResult(null);

    try {
      if (channel === 'xskt') {
        const result = await fetchXSKTResult(xsktDai, xsktDate);
        if (!result) throw new Error('No result');
        const check = checkXSKTTicket(xsktNum, result, xsktDai);
        setApiResult(result);
        setCheckResult(check);
        await handleSave(false, check);
        if (check.prize) {
          haptics.success();
        } else {
          haptics.light();
        }
      } else {
        // Xử lý max3d và max3dpro
        if (product === 'max3d' || product === 'max3dpro') {
          const kyForApi = kyNumberRef.current.trim() || undefined;
          console.log('[handleCheck] Bắt đầu fetch, product:', product, 'kyso:', kyNumberRef.current);
          const result = await fetchVietlottResult(product, kyForApi);
          console.log('[handleCheck] Fetch xong, result:', JSON.stringify(result).slice(0, 100));
          setApiResult(result);
          const userTickets =
            product === 'max3d'
              ? [slotValues.filter((v: string) => v !== '').join('')]
              : max3dProValues.map((arr) => arr.filter((v) => v !== '').join(''));
          const validTickets = userTickets.filter((t) => t.length === 3);
          const sets = Array.isArray(result.sets) ? result.sets : [];

          const byPrize = { db: [] as string[], n1: [] as string[], n2: [] as string[], n3: [] as string[] };
          sets.forEach((s: any) => {
            const label = String(s?.label || '').toLowerCase();
            const num = String(s?.numbers?.join('') || '');
            if (!num) return;
            if (label.includes('đặc biệt')) byPrize.db.push(num);
            else if (label.includes('nhất')) byPrize.n1.push(num);
            else if (label.includes('nhì')) byPrize.n2.push(num);
            else if (label.includes('ba')) byPrize.n3.push(num);
          });

          const countHits = (pool: string[]) => validTickets.filter((t) => pool.includes(t)).length;
          const topPool = [...byPrize.db, ...byPrize.n1, ...byPrize.n2, ...byPrize.n3];
          const matchedTicketNums = validTickets
            .filter((t) => topPool.includes(t))
            .map((t) => Number(t))
            .filter((n) => !Number.isNaN(n));

          let prize = '';
          let amount = 0;
          if (product === 'max3d') {
            const matchedSet = sets.find((s: any) => validTickets.includes(String(s?.numbers?.join('') || '')));
            const label = String(matchedSet?.label || '').toLowerCase();
            if (matchedSet) {
              if (label.includes('đặc biệt')) { prize = 'Giải Đặc biệt'; amount = 1000000; }
              else if (label.includes('nhất')) { prize = 'Giải Nhất'; amount = 350000; }
              else if (label.includes('nhì')) { prize = 'Giải Nhì'; amount = 210000; }
              else if (label.includes('ba')) { prize = 'Giải Ba'; amount = 100000; }
            }
          } else {
            const t1 = validTickets[0];
            const t2 = validTickets[1];
            const hitDbOrdered = byPrize.db.length >= 2 && t1 === byPrize.db[0] && t2 === byPrize.db[1];
            const hitDbReverse = byPrize.db.length >= 2 && t1 === byPrize.db[1] && t2 === byPrize.db[0];

            if (hitDbOrdered) prize = 'Giải Đặc biệt';
            else if (hitDbReverse) prize = 'Giải Phụ Đặc biệt';
            else if (countHits(byPrize.n1) >= 2) prize = 'Giải Nhất';
            else if (countHits(byPrize.n2) >= 2) prize = 'Giải Nhì';
            else if (countHits(byPrize.n3) >= 2) prize = 'Giải Ba';
            else if (countHits(topPool) >= 2) prize = 'Giải Tư';
            else if (countHits(byPrize.db) >= 1) prize = 'Giải Năm';
            else if (countHits([...byPrize.n1, ...byPrize.n2, ...byPrize.n3]) >= 1) prize = 'Giải Sáu';
          }
          setCheckResult({
            matched: matchedTicketNums,
            prize,
            amount,
          });
          setIsLoading(false);
          return;
        }

        const kyForApi = kyNumberRef.current.trim() || undefined;
        console.log('[handleCheck] Bắt đầu fetch, product:', product, 'kyso:', kyNumberRef.current);
        const result = await fetchVietlottResult(product, kyForApi);
        console.log('[handleCheck] Fetch xong, result:', JSON.stringify(result).slice(0, 100));
        console.log('API result:', JSON.stringify(result));
        setApiResult(result);
        console.log('checkResult sau khi set:', JSON.stringify(checkResult));
        if (!result) throw new Error('No result');

        const kyTrim = kyNumberRef.current.trim();
        const resultWithDraw = {
          ...result,
          kySo: result.kySo || kyTrim,
        };
        if (product === 'keno' && kenoTab === 'text' && kenoTextValue) {
          const kenoTextResult = evaluateKenoTextResult(kenoTextValue, resultWithDraw.numbers || []);
          const textCheck = {
            matched: kenoTextResult.isWin ? [1] : [],
            prize: kenoTextResult.prize,
            amount: kenoTextResult.amount,
            textMode: true,
            textSummary: kenoTextResult.summary,
            textChoice: kenoTextValue,
            drawId: resultWithDraw.kySo || kyTrim,
          };
          setApiResult(resultWithDraw);
          setCheckResult(textCheck);
          await handleSave(false, textCheck);
          if (kenoTextResult.isWin) {
            haptics.success();
          } else {
            haptics.light();
          }
          return;
        }

        const myNums = product === 'lotto535' ? [...pickerValues, ...lotto535Special] :
          product === 'mega' ? pickerValues :
          product === 'power' ? pickerValues :
          product === 'keno' && kenoTab !== 'text' ? pickerValues :
          [];
        const check = checkVietlottTicket(myNums, result, product);
        const checkWithDraw = {
          ...check,
          drawId: resultWithDraw.kySo || kyTrim,
        };
        if (product === 'lotto535' && typeof resultWithDraw?.powerNumber === 'number' && lotto535Special.length === 1) {
          const hasPickedPower = lotto535Special[0] === resultWithDraw.powerNumber;
          console.log('Lotto535 special selected hits power number:', hasPickedPower);
        }
        setApiResult(resultWithDraw);
        setCheckResult(checkWithDraw);
        await handleSave(false, checkWithDraw);
        if (checkWithDraw.prize) {
          haptics.success();
        } else {
          haptics.light();
        }
      }
    } catch (e) {
      haptics.error();
      const errMsg = e instanceof Error ? e.message : String(e);
      Alert.alert('Lỗi', `${errMsg}\nKiểm tra kết nối mạng và thử lại`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (showSuccessAlert = true, outcome?: { prize?: string; matched?: any; drawId?: string }) => {
    try {
      if (channel === 'xskt') {
        await saveTicket({
          channel: 'xskt',
          product: 'xskt',
          label: `XSKT · ${xsktDai}`,
          ticketNumber: xsktNum,
          dai: xsktDai,
          drawDate: xsktDate,
          frequency: 'once',
          prize: outcome?.prize || '',
          matched: outcome?.matched || [],
        });
      } else if (product === 'keno' && kenoTab === 'text') {
        const kenoTextLabelMap: Record<string, string> = {
          chan: 'Chẵn',
          chan1112: 'Chẵn 11-12',
          hoachanle: 'Hòa Chẵn/Lẻ',
          le1112: 'Lẻ 11-12',
          le: 'Lẻ',
          lon: 'Lớn',
          hoalonnho: 'Hòa Lớn/Nhỏ',
          nho: 'Nhỏ',
        };
        await saveTicket({
          channel: 'vietlott',
          product: 'keno',
          label: `Keno · ${kenoTextLabelMap[String(kenoTextValue)] || kenoTextValue}`,
          kenoTextChoice: kenoTextValue ?? undefined,
          drawId: outcome?.drawId || kyNumberRef.current.trim(),
          frequency: 'every',
          prize: outcome?.prize || '',
          matched: outcome?.matched || [],
        });
      } else {
        await saveTicket({
          channel: 'vietlott',
          product,
          label: `${product.toUpperCase()} · Bộ A`,
          numbers: getVietlottTicketNumbers(),
          drawId: outcome?.drawId || kyNumberRef.current.trim(),
          frequency: 'every',
          prize: outcome?.prize || '',
          matched: outcome?.matched || [],
        });
      }
      haptics.success();
      setSavedRefreshKey((prev) => prev + 1);
      if (showSuccessAlert) {
        Alert.alert('✅ Đã lưu!', 'Vé đã được lưu. Mở tab "Đã lưu" để xem.');
      }
    } catch (e) {
      haptics.error();
      if (showSuccessAlert) {
        Alert.alert('Lỗi', 'Không thể lưu vé. Vui lòng thử lại.');
      }
    }
  };

  const handleScanResult = (ticket: ParsedTicket) => {
    if (ticket.type === 'xskt') {
      haptics.selection();
      setChannel('xskt');
      setTab('do');
      setXsktNum(ticket.ticketNumber);
      if (ticket.dai) setXsktDai(ticket.dai);
      return;
    }

    if (ticket.type === 'vietlott_qr') {
      haptics.selection();
      setChannel('vietlott');
      setTab('do');
      setKenoTab('so');
      const nextProduct = ticket.product as ProductKey;
      if (nextProduct in PRODUCT_CONFIG) {
        setProduct(nextProduct);
      }
      if (ticket.numbers) {
        setPickerValues(ticket.numbers);
      }
    }
  };

  const shouldShowKySoPicker =
    channel === 'vietlott' &&
    ['keno', 'mega', 'power', 'max3d', 'max3dpro', 'lotto535'].includes(product);

  return (
    <ThemeProvider theme={theme}>
      <View style={{ flex: 1, backgroundColor: theme.colors.bgSecondary }}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: 16, paddingTop: 52, paddingBottom: 124 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '800',
                color: theme.colors.textPrimary,
                letterSpacing: -0.5,
                flex: 1,
              }}
            >
              Dò Số
            </Text>
            {tab === 'do' ? (
              <TouchableOpacity
                onPress={handleResetForm}
                hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                style={{ paddingVertical: 4, paddingHorizontal: 8 }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.colors.textBrand }}>Đặt lại</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={{ flexDirection: 'row', gap: 4, marginBottom: 16 }}>
            {(['do', 'luu'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => {
                  haptics.selection();
                  setTab(t);
                }}
                style={{
                  flex: 1,
                  height: 36,
                  borderRadius: 10,
                  borderWidth: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: tab === t ? theme.colors.bgPrimary : theme.colors.transparent,
                  borderColor: tab === t ? theme.colors.borderDefault : theme.colors.transparent,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: tab === t ? theme.colors.textPrimary : theme.colors.textDisable,
                  }}
                >
                  {t === 'do' ? 'Dò số' : 'Lịch sử dò'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {tab === 'do' && (
            <>
              {channel === 'vietlott' && (
                <>
                  <ProductStrip value={product} onChange={handleProductChange} />
                  {shouldShowKySoPicker ? (
                    <View style={{ marginBottom: 12 }}>
                      <KySoPicker
                        product={product}
                        value={kyNumber}
                        onChange={(kyso) => {
                          kyNumberRef.current = kyso;
                          setKyNumber(kyso);
                        }}
                        accentColor={config.accentColor}
                      />
                    </View>
                  ) : null}
                  <View style={{ height: 14 }} />
                  <ProductInfoBanner product={product} />
                  <View style={{ height: 12 }} />

                  {product === 'keno' && (
                    <>
                      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
                        {([
                          { key: 'picker', label: 'Chọn số' },
                          { key: 'text', label: 'Chẵn/Lẻ/Lớn/Nhỏ' },
                        ] as const).map((item) => (
                          <TouchableOpacity
                            key={item.key}
                            onPress={() => {
                              if (item.key === 'text') {
                                haptics.light();
                                setKenoTab('text');
                                return;
                              }

                              haptics.light();
                              setKenoTab('so');
                            }}
                            style={{
                              flex: 1,
                              height: 30,
                              paddingHorizontal: 8,
                              borderRadius: 20,
                              borderWidth: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor:
                                (item.key === 'text' && kenoTab === 'text') ||
                                (kenoTab === 'so' && item.key !== 'text')
                                  ? theme.colors.accentKenoSoftStrong
                                  : theme.colors.bgSecondary,
                              borderColor:
                                (item.key === 'text' && kenoTab === 'text') ||
                                (kenoTab === 'so' && item.key !== 'text')
                                  ? theme.colors.accentKeno
                                  : theme.colors.borderDefault,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 11,
                                fontWeight:
                                  (item.key === 'text' && kenoTab === 'text') ||
                                  (kenoTab === 'so' && item.key !== 'text')
                                    ? '700'
                                    : '600',
                                color:
                                  (item.key === 'text' && kenoTab === 'text') ||
                                  (kenoTab === 'so' && item.key !== 'text')
                                    ? theme.colors.accentKeno
                                    : theme.colors.textHint,
                              }}
                            >
                              {item.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      {kenoTab === 'text' ? (
                        <KenoTextMode value={kenoTextValue} onChange={setKenoTextValue} />
                      ) : (
                        <NumberPicker
                          total={80}
                          pickCount={10}
                          accentColor={theme.colors.accentKeno}
                          values={pickerValues}
                          onChange={setPickerValues}
                          showSelectionHint={false}
                        />
                      )}
                    </>
                  )}

                  {product === 'max3d' && (
                    <SlotInput
                      count={3}
                      maxValue={9}
                      isDigit
                      allowDuplicates
                      accentColor={theme.colors.accentMax3D}
                      values={slotValues}
                      onChange={setSlotValues}
                    />
                  )}
                  {product === 'max3dpro' && (
                    <Max3DProInput
                      accentColor={theme.colors.accentMax3DPro}
                      values={max3dProValues}
                      onChange={setMax3dProValues}
                    />
                  )}
                  {product === 'mega' && (
                    <NumberPicker
                      total={45}
                      pickCount={6}
                      accentColor={theme.colors.accentMega}
                      values={pickerValues}
                      onChange={setPickerValues}
                    />
                  )}
                  {product === 'power' && (
                    <NumberPicker
                      total={55}
                      pickCount={6}
                      accentColor={theme.colors.accentPower}
                      values={pickerValues}
                      onChange={setPickerValues}
                    />
                  )}
                  {product === 'lotto535' && (
                    <View>
                      <Text
                        style={{
                          marginBottom: 6,
                          fontSize: 13,
                          color: '#666C76',
                          textAlign: 'center',
                          fontFamily: SF_PRO_TEXT,
                        }}
                      >
                        Chọn 5 số (01-35)
                      </Text>
                      <NumberPicker
                        total={35}
                        pickCount={5}
                        accentColor={theme.colors.accentLotto535}
                        values={pickerValues}
                        onChange={setPickerValues}
                        specialValues={lotto535Special}
                        onSpecialChange={setLotto535Special}
                        specialTotal={12}
                        specialPickCount={1}
                        specialLabel="⭐ Số đặc biệt (01-12)"
                      />
                      <Text
                        style={{
                          marginTop: 10,
                          fontSize: 12,
                          fontWeight: '600',
                          color:
                            pickerValues.length === 5 && lotto535Special.length === 1 ? '#24A972' : '#A16B00',
                          textAlign: 'center',
                          fontFamily: SF_PRO_TEXT,
                        }}
                      >
                        {pickerValues.length === 5 && lotto535Special.length === 1
                          ? 'Đã chọn đủ số, bạn có thể Dò kết quả.'
                          : 'Vui lòng chọn 5 số và 1 số đặc biệt để dò kết quả.'}
                      </Text>
                    </View>
                  )}

                  <View
                    onLayout={(e) => {
                      actionRowYRef.current = e.nativeEvent.layout.y;
                    }}
                  >
                    <ActionRow onCheck={handleCheck} accentColor={config.accentColor} isLoading={isLoading} />
                  </View>
                  {checkResult && apiResult && (
                    <View
                      onLayout={(e) => {
                        resultCardYRef.current = e.nativeEvent.layout.y;
                      }}
                    >
                      <ResultCard
                        product={product}
                        channel={channel}
                        myNumbers={
                          getVietlottTicketNumbers()
                        }
                        myTicket={xsktNum}
                        result={apiResult}
                        checkResult={checkResult}
                        onBuyNext={() => {
                          setCheckResult(null);
                          setApiResult(null);
                        }}
                        onSave={() => Alert.alert('Đã lưu!', 'Vé đã được lưu vào danh sách.')}
                      />
                    </View>
                  )}
                </>
              )}

              {channel === 'xskt' && (
                <>
                  <XSKTInput
                    onCheck={(num: string, dai: string, date: string) => {
                      setXsktNum(num);
                      setXsktDai(dai);
                      setXsktDate(date);
                    }}
                    onValueChange={(ticketNum: string, dai: string, date: string) => {
                      setXsktNum(ticketNum);
                      setXsktDai(dai);
                      setXsktDate(date);
                    }}
                    showActionRow={false}
                  />
                  <View
                    onLayout={(e) => {
                      actionRowYRef.current = e.nativeEvent.layout.y;
                    }}
                  >
                    <ActionRow onCheck={handleCheck} accentColor={theme.colors.accentLotto535} isLoading={isLoading} />
                  </View>
                  {checkResult && apiResult && (
                    <View
                      onLayout={(e) => {
                        resultCardYRef.current = e.nativeEvent.layout.y;
                      }}
                    >
                      <ResultCard
                        product="xskt"
                        channel={channel}
                        myTicket={xsktNum}
                        result={apiResult}
                        checkResult={checkResult}
                        onBuyNext={() => {
                          setCheckResult(null);
                          setApiResult(null);
                        }}
                        onSave={() => Alert.alert('Đã lưu!', 'Vé đã được lưu vào danh sách.')}
                      />
                    </View>
                  )}
                </>
              )}
            </>
          )}

          {tab === 'luu' && <SavedList channel={channel} refreshKey={savedRefreshKey} />}
        </ScrollView>

        <WinFireworksOverlay visible={showWinFx && tab === 'do'} />

        <ScanModal
          visible={scanVisible}
          onClose={() => setScanVisible(false)}
          onResult={handleScanResult}
          onManualEntry={() => setTab('do')}
          channel={channel}
        />

        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 106,
            borderTopWidth: 1,
            borderTopColor: theme.colors.borderDefault,
            backgroundColor: theme.colors.bgPrimary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 760,
              height: '100%',
              position: 'relative',
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              borderTopWidth: 1,
              borderTopColor: theme.colors.borderDefault,
              backgroundColor: theme.colors.bgPrimary,
              overflow: 'hidden',
            }}
          >
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row' }}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  haptics.selection();
                  setChannel('xskt');
                  setTab('do');
                }}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 14, paddingHorizontal: 4 }}
              >
                {channel === 'xskt' ? (
                  <View
                    style={{
                      width: 40,
                      height: 3,
                      borderRadius: 2,
                      backgroundColor: '#EB2F98',
                      position: 'absolute',
                      top: 10,
                    }}
                  />
                ) : null}
                <Image source={TAB_ICON_XSKT} style={{ width: 40, height: 40, marginBottom: 4 }} resizeMode="contain" />
                <Text
                  style={{
                    fontSize: 11,
                    textAlign: 'center',
                    color: channel === 'xskt' ? '#EB2F98' : theme.colors.textHint,
                    fontWeight: channel === 'xskt' ? '700' : '600',
                    lineHeight: 14,
                  }}
                >
                  Xổ số{'\n'}kiến thiết
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  haptics.selection();
                  setScanVisible(true);
                }}
                style={{ width: 168, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 10 }}
              >
                <Image
                  source={TAB_ICON_SCAN}
                  style={{
                    width: 72,
                    height: 72,
                    marginTop: -32,
                  }}
                  resizeMode="contain"
                />
                <View style={{ marginTop: 2, backgroundColor: '#EB2F98', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
                  <Text style={{ fontSize: 10, color: '#fff', fontWeight: '700' }}>Scan vé số</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  haptics.selection();
                  setChannel('vietlott');
                  setTab('do');
                }}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 14, paddingHorizontal: 4 }}
              >
                {channel === 'vietlott' ? (
                  <View
                    style={{
                      width: 40,
                      height: 3,
                      borderRadius: 2,
                      backgroundColor: '#EB2F98',
                      position: 'absolute',
                      top: 10,
                    }}
                  />
                ) : null}
                <Image source={TAB_ICON_VIETLOTT} style={{ width: 40, height: 40, marginBottom: 4 }} resizeMode="contain" />
                <Text
                  style={{
                    fontSize: 12,
                    color: channel === 'vietlott' ? '#EB2F98' : theme.colors.textHint,
                    fontWeight: channel === 'vietlott' ? '700' : '600',
                  }}
                >
                  Vietlott
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <StatusBar style="auto" />
      </View>
    </ThemeProvider>
  );
}