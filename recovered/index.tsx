import { createTheme } from '@shopify/restyle';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Modal, PanResponder, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { API_BASE } from '../src/services/lotteryApi';

export type ProductKey = 'keno' | 'mega' | 'power' | 'max3d' | 'max3dpro' | 'lotto535';
export type KenoTab = 'so' | 'text';
export type KenoTextValue =
  | 'chan'
  | 'chan1112'
  | 'hoachanle'
  | 'le1112'
  | 'le'
  | 'lon'
  | 'hoalonnho'
  | 'nho'
  | null;
export type { ParsedTicket } from '../src/utils/ocrParser';

export const theme = createTheme({
  colors: {
    transparent: 'transparent',
    bgPrimary: '#FFFFFF',
    bgSecondary: '#F7F7FA',
    bgTonal: '#EEF5FF',
    borderDefault: '#E5E7EB',
    borderBrand: '#2D7FF9',
    textPrimary: '#303233',
    textHint: '#8A8F98',
    textDisable: '#B2B7C0',
    textBrand: '#2D7FF9',
    textError: '#D64545',
    textOnDark: '#FFFFFF',
    overlayDark95: 'rgba(0,0,0,0.95)',
    overlayWhite10: 'rgba(255,255,255,0.10)',
    accentKeno: '#F5943A',
    accentKenoSoftStrong: '#FFF3E8',
    accentMega: '#8875FF',
    accentMegaSoft: '#F2EEFF',
    accentMegaBorder: '#DCCFFF',
    accentPower: '#5AA4F4',
    accentMax3D: '#35E89E',
    accentMax3DPro: '#20C784',
    accentLotto535: '#F5C840',
  },
  spacing: { none: 0, xs: 4, s: 8, m: 12, l: 16, xl: 24 },
  borderRadii: { s: 8, m: 12, l: 16, full: 9999 },
  textVariants: {},
  breakpoints: { phone: 0, tablet: 768 },
});

export const haptics = {
  selection: () => Haptics.selectionAsync().catch(() => {}),
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}),
};

export { API_BASE };

export async function fetchVietlottResult(product: string, kyso?: string) {
  const url = kyso
    ? `${API_BASE}/vietlott/${product}?kyso=${encodeURIComponent(kyso)}`
    : `${API_BASE}/vietlott/${product}`;

  console.log('[fetchVietlottResult] Calling URL:', url);

  try {
    const res = await fetch(url);
    console.log('[fetchVietlottResult] Response status:', res.status);
    const json = await res.json();
    console.log('[fetchVietlottResult] JSON:', JSON.stringify(json).slice(0, 100));
    if (!json.success) throw new Error(json.error || 'Lỗi không xác định');
    return json.data;
  } catch (e: any) {
    console.error('[fetchVietlottResult] CATCH ERROR:', e?.message, e?.name);
    throw e;
  }
}
export async function fetchXSKTResult(dai: string, date?: string) {
  const normalizedDate = date ? date.replace(/\//g, '-') : '';
  const url = normalizedDate
    ? `${API_BASE}/xskt?dai=${encodeURIComponent(dai)}&date=${encodeURIComponent(normalizedDate)}`
    : `${API_BASE}/xskt?dai=${encodeURIComponent(dai)}`;
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
  if (product === 'mega') {
    if (matched.length === 6) { prize = 'Jackpot'; }
    else if (matched.length === 5) { prize = 'Giải nhất'; }
    else if (matched.length === 4) { prize = 'Giải nhì'; }
    else if (matched.length === 3) { prize = 'Giải ba'; }
  } else if (product === 'power') {
    if (matched.length === 6 && hasPower) { prize = 'Jackpot 1'; }
    else if (matched.length === 6) { prize = 'Jackpot 2'; }
    else if (matched.length === 5 && hasPower) { prize = 'Giải nhất'; }
    else if (matched.length === 5) { prize = 'Giải nhì'; }
    else if (matched.length === 4) { prize = 'Giải ba'; }
    else if (matched.length === 3) { prize = 'Giải tư'; }
  } else if (product === 'lotto535') {
    if (matched.length === 5 && hasPower) { prize = 'Jackpot'; }
    else if (matched.length === 5) { prize = 'Giải nhất'; }
    else if (matched.length === 4) { prize = 'Giải nhì'; }
    else if (matched.length === 3) { prize = 'Giải ba'; }
  } else if (product === 'keno') {
    const n = mainNumbers.length;
    if (n === 10) {
      const prizeMap: Record<number, { prize: string }> = {
        10: { prize: 'Keno 10/10' },
        9: { prize: 'Keno 9/10' },
        8: { prize: 'Keno 8/10' },
        7: { prize: 'Keno 7/10' },
        6: { prize: 'Keno 6/10' },
        5: { prize: 'Keno 5/10' },
        0: { prize: 'Keno 0/10' },
      };
      const hit = prizeMap[matched.length];
      if (hit) prize = hit.prize;
    } else if (n >= 1 && n <= 10) {
      const k = matched.length;
      if (k === n) prize = `Keno trúng ${k}/${n} số (trùng hết)`;
      else if (k >= 5) prize = `Keno trúng ${k}/${n} số`;
      else if (k >= 3) prize = `Keno trúng ${k}/${n} số (xem bảng giải theo số cược)`;
    }
  }
  return { matched, prize, amount: 0 };
}
export function checkXSKTTicket(ticketNumber: string, result: { prizes: { label: string; numbers: string[] }[] }) {
  const ticket = String(ticketNumber || '').replace(/\D/g, '');
  if (!ticket) return { matched: false, prize: '', amount: 0 };

  const normalize = (s: string) =>
    String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const getPrizeMeta = (label: string) => {
    const l = normalize(label);
    if (l.includes('dac biet')) return { digits: 6, rank: 0 };
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
    for (const num of p?.numbers || []) {
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

const KEY = 'doxoso_saved_tickets';
export async function saveTicket(ticket: any) {
  const raw = await AsyncStorage.getItem(KEY);
  const arr = raw ? JSON.parse(raw) : [];
  await AsyncStorage.setItem(KEY, JSON.stringify([{ ...ticket, createdAt: new Date().toISOString() }, ...arr].slice(0, 200)));
}
async function getSavedTickets() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function requestNotificationPermission(): Promise<boolean> { return false; }
export async function sendWinNotification(_prize?: string, _amount?: number): Promise<void> {}
export function getRecentDrawDates(_product: string, limit = 15) {
  const out: string[] = []; const now = new Date();
  for (let i = 0; i < limit; i++) { const d = new Date(now); d.setDate(now.getDate() - i); out.push(`${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`); }
  return out;
}

export function ActionRow({ onCheck, accentColor, isLoading }: { onCheck: () => void; accentColor: string; isLoading?: boolean }) {
  return (
    <TouchableOpacity
      onPress={onCheck}
      disabled={!!isLoading}
      style={{
        height: 44,
        borderRadius: 14,
        backgroundColor: accentColor,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        marginVertical: 12,
      }}
    >
      {isLoading ? <ActivityIndicator color="#fff" /> : null}
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 20 }}>{isLoading ? 'Đang dò...' : 'Dò kết quả'}</Text>
    </TouchableOpacity>
  );
}

export function ProductStrip({ value, onChange }: { value: string; onChange: (v: any) => void }) {
  const productLogos: Record<string, any> = {
    lotto535: require('../assets/vietlott-logos/lotto535.png'),
    power: require('../assets/vietlott-logos/power655.png'),
    max3d: require('../assets/vietlott-logos/max3d.png'),
    mega: require('../assets/vietlott-logos/mega645.png'),
    max3dpro: require('../assets/vietlott-logos/max3dpro.png'),
    keno: require('../assets/vietlott-logos/keno.png'),
  };
  const items = [
    { key: 'keno', label: 'Keno', dot: '#F5943A' },
    { key: 'mega', label: 'Mega 6/45', dot: '#8875FF' },
    { key: 'power', label: 'Power 6/55', dot: '#5AA4F4' },
    { key: 'max3d', label: 'Max 3D', dot: '#35E89E' },
    { key: 'max3dpro', label: 'Max 3D Pro', dot: '#35E89E' },
    { key: 'lotto535', label: 'Lotto 5/35', dot: '#F5C840' },
  ];
  return (
    <View style={{ marginBottom: 10 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {items.map((k) => {
          const active = value === k.key;
          return (
            <TouchableOpacity
              key={k.key}
              onPress={() => onChange(k.key)}
              style={{
                height: 32,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: active ? '#EB2F98' : '#E5E7EB',
                backgroundColor: active ? '#FDEAF4' : '#FFF',
                paddingHorizontal: 12,
                justifyContent: 'center',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Image
                source={productLogos[k.key]}
                style={{ width: 28, height: 20 }}
                resizeMode="contain"
              />
              <Text style={{ color: active ? '#EB2F98' : '#6E7481', fontWeight: active ? '700' : '600', fontSize: 12 }}>{k.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <Text style={{ marginTop: 6, color: '#B0B5BE', fontSize: 11 }}>Vuốt sang trái để xem thêm sản phẩm</Text>
    </View>
  );
}
export function KySoPicker({ product, value, onChange, accentColor = '#2D7FF9' }: { product: string; value: string; onChange: (v: string) => void; accentColor?: string }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [list, setList] = useState<{ kyso: string; date: string; drawDay: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/vietlott/${product}/list`);
        const j = await r.json();
        if (!cancelled && j?.success && Array.isArray(j.data)) {
          setList(j.data);
          return;
        }
      } catch {}

      // fallback local list nếu API list lỗi
      const currentKy = parseInt((value || '280064').replace(/\D/g, ''), 10) || 280064;
      const now = new Date();
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const tmp: { kyso: string; date: string; drawDay: string }[] = [];
      for (let i = 0; i < (product === 'keno' ? 200 : 90); i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        tmp.push({
          kyso: String(currentKy - i).padStart(5, '0'),
          date: d.toLocaleDateString('vi-VN'),
          drawDay: dayNames[d.getDay()],
        });
      }
      if (!cancelled) setList(tmp);
    })();
    return () => { cancelled = true; };
  }, [product, value]);

  const filtered = useMemo(() => {
    const q = search.trim();
    if (!q) return list;
    return list.filter((x) => x.kyso.includes(q) || x.date.includes(q) || x.drawDay.includes(q));
  }, [list, search]);
  const latestKy = list[0];

  return (
    <>
      <TouchableOpacity onPress={() => setOpen(true)} style={{ minHeight: 40, backgroundColor: '#F2F2F6', borderRadius: 8, borderWidth: 1, borderColor: '#EBEBEB', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, gap: 8 }}>
        <Text>📋</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#303233' }}>{value ? `Kỳ #${value}` : 'Mới nhất'}</Text>
          {!value && latestKy ? (
            <Text style={{ marginTop: 1, color: '#8A8F98', fontSize: 11 }}>
              Kỳ #{latestKy.kyso} · {latestKy.date}
            </Text>
          ) : null}
        </View>
        <Text style={{ color: '#9AA0A9', fontSize: 18 }}>›</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <View style={{ maxHeight: '70%', backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
            <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ECEEF3' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '800', color: '#303233', fontSize: 16 }}>Chọn kỳ quay</Text>
                <TouchableOpacity onPress={() => setOpen(false)} style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F8' }}>
                  <Text style={{ color: '#5F6673', fontSize: 14, fontWeight: '700' }}>✕</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Tìm kỳ số..."
                keyboardType="number-pad"
                style={{ marginTop: 10, height: 40, borderWidth: 1, borderColor: '#EBEBEB', borderRadius: 8, paddingHorizontal: 12 }}
              />
            </View>
            <ScrollView>
              <TouchableOpacity
                onPress={() => { onChange(''); setOpen(false); }}
                style={{ paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F1F2F6' }}
              >
                <Text style={{ color: !value ? accentColor : '#303233', fontWeight: !value ? '700' : '500' }}>Mới nhất</Text>
              </TouchableOpacity>
              {filtered.map((it, idx) => (
                <TouchableOpacity
                  key={`${it.kyso}-${idx}`}
                  onPress={() => { onChange(it.kyso); setOpen(false); }}
                  style={{ paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F1F2F6' }}
                >
                  <Text style={{ color: value === it.kyso ? accentColor : '#303233', fontWeight: value === it.kyso ? '700' : '500' }}>
                    Kỳ #{it.kyso}
                  </Text>
                  <Text style={{ color: '#8A8F98', fontSize: 12, marginTop: 2 }}>{it.date} · {it.drawDay}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
export function DrawDatePicker({ product, value, onChange }: { product: string; value: string; onChange: (v: string) => void; accentColor?: string }) {
  const [open, setOpen] = useState(false); const dates = useMemo(() => getRecentDrawDates(product), [product]);
  return <><TouchableOpacity onPress={() => setOpen(true)} style={{ height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#EBEBEB', backgroundColor: '#F2F2F6', paddingHorizontal: 12, justifyContent: 'center' }}><Text>{value || 'Mới nhất'}</Text></TouchableOpacity><Modal visible={open} transparent animationType="slide"><Pressable style={{ flex: 1 }} onPress={() => setOpen(false)} /><View style={{ maxHeight: '55%', backgroundColor: '#fff' }}><ScrollView>{dates.map((d) => <TouchableOpacity key={d} onPress={() => { onChange(d); setOpen(false); }} style={{ padding: 12 }}><Text>{d}</Text></TouchableOpacity>)}</ScrollView></View></Modal></>;
}
export function ProductInfoBanner({ product }: { product: string }) {
  const map: Record<string, { title: string; note: string; tag: string; bg: string; border: string; tagBg: string; tagColor: string; logo: any }> = {
    mega: { title: 'Mega 6/45', note: 'Chọn 6 số từ 01-45. Quay thưởng T4, T6, CN.', tag: 'T4 · T6 · CN', bg: '#F3F1FF', border: '#DCCFFF', tagBg: '#E7E2FF', tagColor: '#6C58F7', logo: require('../assets/vietlott-logos/mega645.png') },
    power: { title: 'Power 6/55', note: 'Chọn 6 số từ 01-55. Có Jackpot 1 và Jackpot 2.', tag: 'T3 · T5 · T7', bg: '#EDF6FF', border: '#CFE3FF', tagBg: '#DBECFF', tagColor: '#2E7FD6', logo: require('../assets/vietlott-logos/power655.png') },
    keno: { title: 'Keno', note: 'Chọn tối đa 10 số từ 01-80. Quay liên tục nhiều kỳ/ngày.', tag: 'Mỗi ~8 phút', bg: '#FFF5EC', border: '#F7D9BB', tagBg: '#FFE7CE', tagColor: '#D5862E', logo: require('../assets/vietlott-logos/keno.png') },
    max3d: { title: 'Max 3D', note: 'Nhập bộ 3 chữ số. Quay T2, T4, T6.', tag: 'T2 · T4 · T6', bg: '#ECFBF4', border: '#C8F1DF', tagBg: '#DDF9EC', tagColor: '#24A972', logo: require('../assets/vietlott-logos/max3d.png') },
    max3dpro: { title: 'Max 3D Pro', note: 'Nhập 2 bộ số A/B để tăng cơ hội trúng.', tag: 'T2 · T4 · T6', bg: '#EAFBF3', border: '#C5EDD9', tagBg: '#DCF7EA', tagColor: '#1D9A67', logo: require('../assets/vietlott-logos/max3dpro.png') },
    lotto535: { title: 'Lotto 5/35', note: 'Chọn 5 số từ 01-35. Quay thưởng mỗi ngày.', tag: 'Hàng ngày · 18:00', bg: '#FFF8EA', border: '#F0E3C2', tagBg: '#FDEAB8', tagColor: '#D49B00', logo: require('../assets/vietlott-logos/lotto535.png') },
  };
  const info = map[product] || map.keno;
  return (
    <View style={{ padding: 12, borderRadius: 12, backgroundColor: info.bg, borderWidth: 1, borderColor: info.border, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 56, height: 38, borderRadius: 10, backgroundColor: '#FFFFFFDD', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <Image source={info.logo} style={{ width: 50, height: 30 }} resizeMode="contain" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#303233' }}>{info.title}</Text>
        <Text style={{ fontSize: 12, color: '#666C76', marginTop: 2 }}>{info.note}</Text>
        <View style={{ marginTop: 4, alignSelf: 'flex-start', backgroundColor: info.tagBg, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
          <Text style={{ fontSize: 10, color: info.tagColor, fontWeight: '700' }}>{info.tag}</Text>
        </View>
      </View>
    </View>
  );
}
export function KenoTextMode({ value, onChange }: { value: KenoTextValue; onChange: (v: KenoTextValue) => void }) {
  const sectionTitleStyle = { color: '#6D7380', fontSize: 12, fontWeight: '700' as const, marginBottom: 8 };
  const renderOption = (opt: { key: Exclude<KenoTextValue, null>; label: string }) => {
    const active = value === opt.key;
    return (
      <TouchableOpacity
        key={opt.key}
        onPress={() => onChange(opt.key)}
        style={{
          minHeight: 34,
          borderRadius: 17,
          borderWidth: 1,
          borderColor: active ? '#F5943A' : '#E1E5ED',
          backgroundColor: active ? '#FFF1E3' : '#F7F8FC',
          paddingHorizontal: 12,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: active ? '#D5862E' : '#626A77', fontWeight: active ? '700' : '600', fontSize: 12 }}>
          {opt.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ gap: 10 }}>
      <View>
        <Text style={sectionTitleStyle}>Cách chơi bổ sung Lớn/Nhỏ</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {[
            { key: 'lon', label: 'Lớn' },
            { key: 'hoalonnho', label: 'Hòa Lớn Nhỏ' },
            { key: 'nho', label: 'Nhỏ' },
          ].map((opt) => renderOption(opt as { key: Exclude<KenoTextValue, null>; label: string }))}
        </View>
      </View>

      <View>
        <Text style={sectionTitleStyle}>Cách chơi bổ sung Chẵn/Lẻ</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {[
            { key: 'chan', label: 'Chẵn' },
            { key: 'chan1112', label: 'Chẵn 11-12' },
            { key: 'hoachanle', label: 'Hòa' },
            { key: 'le1112', label: 'Lẻ 11-12' },
            { key: 'le', label: 'Lẻ' },
          ].map((opt) => renderOption(opt as { key: Exclude<KenoTextValue, null>; label: string }))}
        </View>
      </View>
    </View>
  );
}
export function SlotInput({ count, values, onChange, isDigit = false }: { count: number; maxValue: number; isDigit?: boolean; allowDuplicates?: boolean; accentColor?: string; values: string[]; onChange: (v: string[]) => void }) {
  const normalized = Array.from({ length: count }, (_, i) => values[i] || '');
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const skipClearOnFocusIdx = useRef<number | null>(null);
  return <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
    {normalized.map((v, i) => (
      <TextInput
        key={i}
        ref={(el) => { inputRefs.current[i] = el; }}
        value={v}
        maxLength={isDigit ? 1 : 2}
        keyboardType="number-pad"
        onFocus={() => {
          if (skipClearOnFocusIdx.current === i) {
            skipClearOnFocusIdx.current = null;
            return;
          }
          const next = [...normalized];
          if (next[i]) {
            next[i] = '';
            onChange(next);
          }
        }}
        onChangeText={(t) => {
          const cleaned = isDigit ? t.replace(/\D/g, '').slice(0, 1) : t.replace(/\D/g, '').slice(0, 2);
          const next = [...normalized];
          const prev = normalized[i];
          next[i] = cleaned;
          onChange(next);
          // Chỉ auto-next khi user vừa nhập dữ liệu mới vào ô hiện tại
          if (cleaned.length === (isDigit ? 1 : 2) && cleaned !== prev && i < count - 1) {
            const nextValue = normalized[i + 1] || '';
            if (!nextValue) {
              skipClearOnFocusIdx.current = i + 1;
              inputRefs.current[i + 1]?.focus();
            }
          }
        }}
        style={{ width: 44, height: 44, borderWidth: 1, borderColor: '#EBEBEB', borderRadius: 8, textAlign: 'center' }}
      />
    ))}
  </View>;
}
export function Max3DProInput({ values, onChange, accentColor }: { accentColor?: string; values: [string[], string[]]; onChange: (v: [string[], string[]]) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <SlotInput count={3} maxValue={9} isDigit allowDuplicates accentColor={accentColor} values={values[0]} onChange={(a) => onChange([a, values[1]])} />
      <Text style={{ fontSize: 22, fontWeight: '700', color: '#565D69' }}>-</Text>
      <SlotInput count={3} maxValue={9} isDigit allowDuplicates accentColor={accentColor} values={values[1]} onChange={(b) => onChange([values[0], b])} />
    </View>
  );
}
export function NumberPicker({ total, pickCount, values, onChange, specialValues = [], onSpecialChange, specialTotal = 0, specialPickCount = 0, specialLabel, showSelectionHint = true }: any) {
  const { width } = useWindowDimensions();
  const toggle = (arr: number[], n: number, max: number) => arr.includes(n) ? arr.filter((x) => x !== n) : arr.length >= max ? arr : [...arr, n].sort((a, b) => a - b);
  const mainReady = values.length === pickCount;
  const specialReady = !onSpecialChange || specialPickCount === 0 || specialValues.length === specialPickCount;
  const allReady = mainReady && specialReady;
  const gap = 8;
  const availableWidth = Math.max(240, width - 56);
  const idealItem = 38;
  const columns = Math.max(5, Math.min(total, Math.floor((availableWidth + gap) / (idealItem + gap))));
  const itemSize = Math.max(32, Math.min(42, Math.floor((availableWidth - gap * (columns - 1)) / columns)));

  return <View style={{ gap: 8 }}>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap, justifyContent: 'center' }}>
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
        const selected = values.includes(n);
        const disableUnselected = values.length >= pickCount && !selected;
        return (
          <TouchableOpacity
            key={n}
            disabled={disableUnselected}
            onPress={() => onChange(toggle(values, n, pickCount))}
            style={{
              width: itemSize, height: itemSize, borderRadius: itemSize / 2, borderWidth: 1,
              borderColor: selected ? '#EB2F98' : '#C9CED8',
              backgroundColor: selected ? '#FDEAF4' : (disableUnselected ? '#ECEFF4' : '#F5F6FA'),
              opacity: disableUnselected ? 0.45 : 1,
              alignItems: 'center', justifyContent: 'center'
            }}
          >
            <Text style={{ color: '#565D69', fontWeight: selected ? '700' : '500' }}>{String(n).padStart(2, '0')}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
    {onSpecialChange && specialTotal > 0 ? <View>
      <Text style={{ color: '#666C76', marginTop: 4 }}>{specialLabel}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap, justifyContent: 'center' }}>
        {Array.from({ length: specialTotal }, (_, i) => i + 1).map((n) => {
          const selected = specialValues.includes(n);
          const disableUnselected = specialValues.length >= specialPickCount && !selected;
          return (
            <TouchableOpacity
              key={`s-${n}`}
              disabled={disableUnselected}
              onPress={() => onSpecialChange(toggle(specialValues, n, specialPickCount))}
              style={{
                width: itemSize, height: itemSize, borderRadius: itemSize / 2, borderWidth: 1,
                borderColor: selected ? '#F2BD00' : '#C9CED8',
                backgroundColor: selected ? '#FFF4CE' : (disableUnselected ? '#ECEFF4' : '#F5F6FA'),
                opacity: disableUnselected ? 0.45 : 1,
                alignItems: 'center', justifyContent: 'center'
              }}
            >
              <Text style={{ color: '#565D69', fontWeight: selected ? '700' : '500' }}>{String(n).padStart(2, '0')}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View> : null}
    {showSelectionHint ? (
      <Text style={{ marginTop: 2, color: allReady ? '#24A972' : '#A16B00', fontSize: 12, fontWeight: '600' }}>
        {allReady
          ? 'Đã chọn đủ số, bạn có thể Dò kết quả.'
          : `Vui lòng chọn ${pickCount} số${onSpecialChange && specialPickCount > 0 ? ` và ${specialPickCount} số đặc biệt` : ''} để dò kết quả.`}
      </Text>
    ) : null}
    <Text style={{ marginTop: 8, color: '#7D848F', fontSize: 12 }}>Bấm việc ấn Dò kết quả bạn đồng ý cho hệ thống lưu thông tin vé để tiện tra cứu.</Text>
  </View>;
}
export function ResultCard({ product, channel, result, checkResult, myNumbers, myTicket, onBuyNext, onSave }: any) {
  const playerNumbers: number[] = Array.isArray(myNumbers) ? myNumbers : [];
  const winningNumbers: number[] = Array.isArray(result?.numbers) ? result.numbers : [];
  const xsktPrizes: Array<{ label: string; numbers: string[] }> = useMemo(() => {
    const list: Array<{ label: string; numbers: string[] }> = Array.isArray(result?.prizes) ? result.prizes : [];
    const rank = (label: string) => {
      const l = String(label || '').toLowerCase();
      if (l.includes('đặc biệt')) return 0;
      if (l.includes('nhất')) return 1;
      if (l.includes('nhì')) return 2;
      if (l.includes('ba')) return 3;
      if (l.includes('tư')) return 4;
      if (l.includes('năm')) return 5;
      if (l.includes('sáu')) return 6;
      if (l.includes('bảy')) return 7;
      if (l.includes('tám')) return 8;
      return 99;
    };
    return [...list].sort((a, b) => rank(a.label) - rank(b.label));
  }, [result?.prizes]);
  const isXsktMode = channel === 'xskt' || product === 'xskt';
  const isKenoTextMode = product === 'keno' && !!checkResult?.textMode;
  const kenoChoiceLabelMap: Record<string, string> = {
    chan: 'Chẵn',
    chan1112: 'Chẵn 11-12',
    hoachanle: 'Hòa Chẵn/Lẻ',
    le1112: 'Lẻ 11-12',
    le: 'Lẻ',
    lon: 'Lớn',
    hoalonnho: 'Hòa Lớn/Nhỏ',
    nho: 'Nhỏ',
  };
  const evenCount = winningNumbers.filter((n) => n % 2 === 0).length;
  const oddCount = winningNumbers.length - evenCount;
  const highCount = winningNumbers.filter((n) => n >= 41 && n <= 80).length;
  const lowCount = winningNumbers.length - highCount;
  const matchedNumbers = playerNumbers.filter((n) => winningNumbers.includes(n));
  const matchedCount = matchedNumbers.length;
  const totalWinning = winningNumbers.length;
  const has3dSets = Array.isArray(result?.sets) && result.sets.length > 0;
  const matched3d = Array.isArray(checkResult?.matched) ? checkResult.matched : [];
  const grouped3dSets = useMemo(() => {
    if (!has3dSets) return [];
    const groups: Record<string, string[]> = {};
    (result.sets || []).forEach((s: any, idx: number) => {
      const label = String(s?.label || `Bộ ${idx + 1}`);
      const groupKey = label.replace(/\s*bộ\s*\d+/i, '').trim();
      const numStr = String(s?.numbers?.join('') || '');
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(numStr);
    });
    return Object.entries(groups);
  }, [has3dSets, result?.sets, product]);

  const chip = (n: number, hit: boolean, type: 'player' | 'winning') => (
    <View
      key={`${n}-${hit ? 'h' : 'n'}`}
      style={{
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: hit
          ? (type === 'winning' ? '#34C759' : '#8875FF')
          : (type === 'winning' ? '#EAF3FF' : '#F1F3F8'),
        borderWidth: 1,
        borderColor: hit
          ? (type === 'winning' ? '#34C759' : '#8875FF')
          : (type === 'winning' ? '#CFE3FF' : '#E2E6EF'),
      }}
    >
      <Text style={{ fontWeight: '700', color: hit ? '#fff' : (type === 'winning' ? '#2E7FD6' : '#5D6470'), fontSize: 12 }}>
        {String(n).padStart(2, '0')}
      </Text>
    </View>
  );

  return (
    <View style={{ marginTop: 12, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E8EAF0', padding: 12 }}>
      <Text style={{ fontWeight: '800', color: '#303233' }}>Kết quả</Text>
      <Text style={{ color: '#8A8F98', fontSize: 12, marginTop: 2 }}>Kỳ: {result?.kySo || '—'} · Ngày: {result?.drawDate || '—'}</Text>
      <View
        style={{
          marginTop: 10,
          padding: 10,
          borderRadius: 8,
          backgroundColor: '#F7F8FC',
        }}
      >
        <Text style={{ color: '#6D7380', fontSize: 12, fontWeight: '700' }}>Kết luận</Text>
        <Text style={{ marginTop: 4, fontWeight: '800', color: checkResult?.prize ? '#11845B' : '#303233' }}>
          {checkResult?.prize ? 'Trúng' : 'Không trúng'}
        </Text>
        {checkResult?.prize ? (
          <Text style={{ marginTop: 2, fontSize: 12, color: '#7B818D' }}>
            Giải: {checkResult.prize}
          </Text>
        ) : null}
      </View>

      {isKenoTextMode ? (
        <View style={{ marginTop: 10, padding: 10, borderRadius: 8, backgroundColor: '#F7F8FC' }}>
          <Text style={{ color: '#6D7380', fontWeight: '700', fontSize: 12, marginBottom: 4 }}>Lựa chọn của bạn</Text>
          <Text style={{ color: '#303233', fontWeight: '700', fontSize: 14 }}>
            Lựa chọn của bạn: {kenoChoiceLabelMap[String(checkResult?.textChoice || '')] || checkResult?.textChoice || '—'}
          </Text>
        </View>
      ) : null}

      {!isXsktMode ? (
        <View style={{ marginTop: 10, padding: 10, borderRadius: 8, backgroundColor: '#F7F8FC' }}>
          <Text style={{ color: '#8A8F98', fontSize: 11, fontWeight: '700', marginBottom: 3 }}>
            {isKenoTextMode ? 'Kết quả thống kê' : 'Kết quả đối chiếu'}
          </Text>
          {isKenoTextMode ? (
            <Text style={{ color: '#7B818D', fontSize: 12, fontWeight: '700' }}>
              Chẵn/Lẻ: {evenCount}/{oddCount} · Lớn/Nhỏ: {highCount}/{lowCount}
            </Text>
          ) : (
            <Text style={{ color: (has3dSets ? matched3d.length > 0 : matchedCount > 0) ? '#34C759' : '#8A8F98', fontWeight: '700' }}>
              {has3dSets
                ? `Trùng ${matched3d.length} bộ ${matched3d.length > 0 ? `(${matched3d.map((n: number) => String(n).padStart(3, '0')).join(', ')})` : ''}`
                : `Trùng ${matchedCount}/${totalWinning} số ${matchedCount > 0 ? `(${matchedNumbers.join(', ')})` : ''}`}
            </Text>
          )}
        </View>
      ) : null}

      {playerNumbers.length > 0 ? (
        <>
          <Text style={{ marginTop: 10, marginBottom: 6, color: '#6D7380', fontWeight: '700', fontSize: 12 }}>Số của bạn</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {playerNumbers.map((n) => chip(n, has3dSets ? matched3d.includes(n) : matchedNumbers.includes(n), 'player'))}
          </View>
        </>
      ) : null}

      {isXsktMode && xsktPrizes.length > 0 ? (
        <>
          <Text style={{ marginTop: 10, marginBottom: 6, color: '#6D7380', fontWeight: '700', fontSize: 12 }}>
            Danh sách số trúng
          </Text>
          <View style={{ gap: 6 }}>
            {xsktPrizes.map((p, idx) => {
              const isWinningPrize = !!checkResult?.prize && String(checkResult.prize) === String(p.label);
              return (
                <View
                  key={`xskt-prize-${idx}`}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 10,
                    paddingVertical: 6,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    backgroundColor: isWinningPrize ? '#ECF9F1' : 'transparent',
                    borderBottomWidth: isWinningPrize ? 0 : 1,
                    borderBottomColor: '#EEF1F6',
                  }}
                >
                  <Text style={{ color: isWinningPrize ? '#11845B' : '#727982', fontSize: 12, minWidth: 86, fontWeight: isWinningPrize ? '800' : '600' }}>
                    {p.label}
                  </Text>
                  <Text style={{ color: isWinningPrize ? '#11845B' : '#303233', fontSize: 13, fontWeight: '700', flex: 1, textAlign: 'right' }}>
                    {(p.numbers || [])
                      .map((num) => {
                        const n = String(num || '').trim();
                        if (myTicket && n === myTicket) return `★${n}★`;
                        return n;
                      })
                      .join('  •  ') || '—'}
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      ) : has3dSets ? (
        <>
          <Text style={{ marginTop: 10, marginBottom: 6, color: '#6D7380', fontWeight: '700', fontSize: 12 }}>Kết quả quay thưởng</Text>
          <View style={{ gap: 6 }}>
            {grouped3dSets.map(([label, nums], idx) => {
              return (
                <View key={`set-group-${idx}`} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#EEF1F6' }}>
                  <Text style={{ color: '#727982', fontSize: 12 }}>{label}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 4, maxWidth: '68%' }}>
                    {nums.map((num, nIdx) => {
                      const hit = matched3d.includes(Number(num));
                      return (
                        <Text key={`${label}-${num}-${nIdx}`} style={{ color: hit ? '#34C759' : '#303233', fontWeight: '700' }}>
                          {num}{nIdx < nums.length - 1 ? ' • ' : ''}
                        </Text>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        </>
      ) : winningNumbers.length > 0 ? (
        <>
          <Text style={{ marginTop: 10, marginBottom: 6, color: '#6D7380', fontWeight: '700', fontSize: 12 }}>Số trúng thưởng</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {winningNumbers.map((n) => chip(n, matchedNumbers.includes(n), 'winning'))}
          </View>
          {typeof result?.powerNumber === 'number' ? (
            <View style={{ marginTop: 8 }}>
              <Text style={{ marginBottom: 6, color: '#6D7380', fontWeight: '700', fontSize: 12 }}>
                {product === 'lotto535' ? 'Số đặc biệt' : 'Số đặc biệt (JP2)'}
              </Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {chip(result.powerNumber, playerNumbers.includes(result.powerNumber), 'winning')}
              </View>
            </View>
          ) : null}
        </>
      ) : null}

      {isXsktMode && myTicket ? <Text style={{ marginTop: 8 }}>Vé của bạn: {myTicket}</Text> : null}

    </View>
  );
}
export function XSKTInput({ onValueChange }: { onCheck: any; onValueChange: any; onSave?: any; showActionRow?: boolean }) {
  const XSKT_SCHEDULE: Record<'mb' | 'mn' | 'mt', Record<number, string[]>> = {
    mb: {
      1: ['Hà Nội'],
      2: ['Quảng Ninh'],
      3: ['Bắc Ninh'],
      4: ['Hà Nội'],
      5: ['Hải Phòng'],
      6: ['Nam Định'],
      0: ['Thái Bình'],
    },
    mn: {
      1: ['TP. Hồ Chí Minh', 'Đồng Tháp', 'Cà Mau'],
      2: ['Bến Tre', 'Vũng Tàu', 'Bạc Liêu'],
      3: ['Đồng Nai', 'Cần Thơ', 'Sóc Trăng'],
      4: ['Tây Ninh', 'An Giang', 'Bình Thuận'],
      5: ['Vĩnh Long', 'Bình Dương', 'Trà Vinh'],
      6: ['TP. Hồ Chí Minh', 'Long An', 'Bình Phước', 'Hậu Giang'],
      0: ['Tiền Giang', 'Kiên Giang', 'Đà Lạt'],
    },
    mt: {
      1: ['Thừa Thiên Huế', 'Phú Yên'],
      2: ['Đắk Lắk', 'Quảng Nam'],
      3: ['Đà Nẵng', 'Khánh Hòa'],
      4: ['Bình Định', 'Quảng Trị', 'Quảng Bình'],
      5: ['Gia Lai', 'Ninh Thuận'],
      6: ['Đà Nẵng', 'Quảng Ngãi', 'Đắk Nông'],
      0: ['Kon Tum', 'Khánh Hòa', 'Thừa Thiên Huế'],
    },
  };
  const REGION_META: Record<'mb' | 'mn' | 'mt', { label: string; time: string }> = {
    mb: { label: 'Miền Bắc', time: '18:15' },
    mn: { label: 'Miền Nam', time: '16:15' },
    mt: { label: 'Miền Trung', time: '17:15' },
  };
  const WEEKDAY_LABEL: Record<number, string> = {
    1: 'Thứ 2',
    2: 'Thứ 3',
    3: 'Thứ 4',
    4: 'Thứ 5',
    5: 'Thứ 6',
    6: 'Thứ 7',
    0: 'Chủ Nhật',
  };
  const parseViDate = (text: string) => {
    const parts = (text || '').split('/');
    if (parts.length !== 3) return new Date();
    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const [ticket, setTicket] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('vi-VN'));
  const [region, setRegion] = useState<'mb' | 'mn' | 'mt'>('mn');
  const weekday = useMemo(() => parseViDate(date).getDay(), [date]);
  const daiOptions = useMemo(() => XSKT_SCHEDULE[region]?.[weekday] || [], [region, weekday]);
  const [dai, setDai] = useState(daiOptions[0] || 'TP.HCM');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const ticketInputRef = useRef<TextInput | null>(null);
  const [isTicketFocused, setIsTicketFocused] = useState(false);
  const [blinkOn, setBlinkOn] = useState(true);
  const ticketDigits = (ticket || '').replace(/\D/g, '');
  const isTicketReady = ticketDigits.length === 6;

  const emit = (nextTicket: string, nextDai: string, nextDate: string) => {
    onValueChange(nextTicket, nextDai, nextDate);
  };

  const setQuickDate = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const text = d.toLocaleDateString('vi-VN');
    setDate(text);
    const nextWeekday = d.getDay();
    const nextDai = (XSKT_SCHEDULE[region]?.[nextWeekday] || [])[0] || dai;
    setDai(nextDai);
    emit(ticket, nextDai, text);
  };

  useEffect(() => {
    if (daiOptions.length === 0) return;
    if (!daiOptions.includes(dai)) {
      const next = daiOptions[0];
      setDai(next);
      emit(ticket, next, date);
    }
  }, [daiOptions, dai, ticket, date]);

  const dateOptions = useMemo(() => {
    const out: string[] = [];
    const now = new Date();
    for (let i = 0; i < 21; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      out.push(d.toLocaleDateString('vi-VN'));
    }
    return out;
  }, []);

  useEffect(() => {
    if (!isTicketFocused) return;
    const timer = setInterval(() => setBlinkOn((v) => !v), 500);
    return () => clearInterval(timer);
  }, [isTicketFocused]);

  const displayChars = Array.from({ length: 6 }, (_, i) => ticket[i] || '—');
  const caretSlot = Math.min(ticket.length, 5);

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['mb', 'mn', 'mt'] as const).map((r) => {
          const active = region === r;
          return (
            <TouchableOpacity
              key={r}
              onPress={() => {
                setRegion(r);
                const nextDai = (XSKT_SCHEDULE[r]?.[weekday] || [])[0] || dai;
                setDai(nextDai);
                emit(ticket, nextDai, date);
              }}
              style={{
                flex: 1,
                height: 32,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: active ? '#EB2F98' : '#D8DEE8',
                backgroundColor: active ? '#FDEAF4' : '#F7F8FC',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: active ? '#EB2F98' : '#5D6470', fontWeight: active ? '700' : '600', fontSize: 12 }}>
                {REGION_META[r].label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          onPress={() => setDatePickerOpen(true)}
          style={{
            flex: 1,
            height: 40,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            backgroundColor: '#F7F7FA',
            paddingHorizontal: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Text style={{ color: '#9AA0A9' }}>📅</Text>
          <Text style={{ color: '#6F7682', fontSize: 13 }}>{WEEKDAY_LABEL[weekday] || 'Hôm nay'}</Text>
          <Text style={{ color: '#303233', fontWeight: '700' }}>{date}</Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text style={{ color: '#6F7682', fontSize: 12, marginBottom: 6 }}>
          Chọn nhà đài ({REGION_META[region].label} · quay {REGION_META[region].time}):
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {daiOptions.map((name) => {
            const active = dai === name;
            return (
              <TouchableOpacity
                key={name}
                onPress={() => {
                  setDai(name);
                  emit(ticket, name, date);
                }}
                style={{
                  height: 32,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: active ? '#2D7FF9' : '#D8DEE8',
                  backgroundColor: active ? '#EAF2FF' : '#F7F8FC',
                  paddingHorizontal: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: active ? '#2D7FF9' : '#5D6470', fontWeight: active ? '700' : '600', fontSize: 12 }}>
                  {name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <Modal visible={datePickerOpen} transparent animationType="slide" onRequestClose={() => setDatePickerOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' }} onPress={() => setDatePickerOpen(false)} />
        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, maxHeight: '70%' }}>
          <Text style={{ fontWeight: '800', color: '#303233', fontSize: 17, marginBottom: 10 }}>Chọn ngày dò</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            <TouchableOpacity
              onPress={() => {
                setQuickDate(0);
                setDatePickerOpen(false);
              }}
              style={{ flex: 1, height: 36, borderRadius: 10, backgroundColor: '#F3F4F8', alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: '#4B5260', fontWeight: '700' }}>Hôm nay</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setQuickDate(-1);
                setDatePickerOpen(false);
              }}
              style={{ flex: 1, height: 36, borderRadius: 10, backgroundColor: '#F3F4F8', alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: '#4B5260', fontWeight: '700' }}>Hôm qua</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            {dateOptions.map((d) => {
              const dWeekday = parseViDate(d).getDay();
              const active = d === date;
              return (
                <TouchableOpacity
                  key={d}
                  onPress={() => {
                    setDate(d);
                    const nextDai = (XSKT_SCHEDULE[region]?.[dWeekday] || [])[0] || dai;
                    setDai(nextDai);
                    emit(ticket, nextDai, d);
                    setDatePickerOpen(false);
                  }}
                  style={{
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: active ? '#2D7FF9' : '#E5E7EB',
                    backgroundColor: active ? '#EAF2FF' : '#FFF',
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: active ? '#2D7FF9' : '#303233', fontWeight: active ? '700' : '600' }}>
                    {WEEKDAY_LABEL[dWeekday]} · {d}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      <TouchableOpacity
        activeOpacity={1}
        onPress={() => ticketInputRef.current?.focus()}
        style={{
          height: 58,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: '#D9DDE5',
          backgroundColor: '#F7F7FA',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <View pointerEvents="none" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {displayChars.map((ch, idx) => (
            <View key={`ticket-char-${idx}`} style={{ minWidth: 16, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#9DA4AF', fontSize: 20, fontWeight: '600' }}>{ch}</Text>
              {isTicketFocused && idx === caretSlot ? (
                <Text
                  style={{
                    position: 'absolute',
                    right: -6,
                    top: -1,
                    color: '#111111',
                    fontSize: 20,
                    fontWeight: '400',
                    opacity: blinkOn ? 1 : 0.15,
                  }}
                >
                  |
                </Text>
              ) : null}
            </View>
          ))}
        </View>
        <TextInput
          ref={ticketInputRef}
          value={ticket}
          onFocus={() => {
            setIsTicketFocused(true);
            setBlinkOn(true);
          }}
          onBlur={() => setIsTicketFocused(false)}
          onChangeText={(t) => {
            const next = t.replace(/\D/g, '').slice(0, 6);
            setTicket(next);
            emit(next, dai, date);
          }}
          keyboardType="number-pad"
          maxLength={6}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, opacity: 0 }}
        />
      </TouchableOpacity>
      <Text style={{ marginTop: 2, color: isTicketReady ? '#24A972' : '#A16B00', fontSize: 12, fontWeight: '600' }}>
        {isTicketReady ? 'Đã nhập đủ 6 số, bạn có thể Dò kết quả.' : ticketDigits.length === 0 ? 'Vui lòng nhập số vé để dò kết quả.' : 'Vui lòng nhập đủ 6 số vé để dò kết quả.'}
      </Text>
    </View>
  );
}
function SwipeDeleteRow({ children, onDelete }: { children: any; onDelete: () => void }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 14 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderMove: (_, gesture) => {
          if (gesture.dx <= 0) {
            translateX.setValue(0);
            return;
          }
          translateX.setValue(Math.min(gesture.dx, 120));
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > 90) {
            Animated.timing(translateX, {
              toValue: 420,
              duration: 180,
              useNativeDriver: true,
            }).start(() => onDelete());
            return;
          }
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        },
      }),
    [onDelete, translateX]
  );

  return (
    <View style={{ borderRadius: 14, overflow: 'hidden' }}>
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 110,
          backgroundColor: '#FFEEF0',
          borderWidth: 1,
          borderColor: '#FFD7DE',
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#D64545', fontWeight: '700' }}>Xóa</Text>
      </View>
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          transform: [{ translateX }],
        }}
      >
        {children}
      </Animated.View>
    </View>
  );
}
export function SavedList({ channel, refreshKey }: { channel: 'vietlott' | 'xskt'; refreshKey?: number }) {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { getSavedTickets().then((all) => setItems((all || []).filter((x: any) => x.channel === channel))); }, [channel, refreshKey]);
  const removeItem = async (target: any) => {
    const all = await getSavedTickets();
    let removed = false;
    const next = (all || []).filter((x: any) => {
      if (removed) return true;
      const same =
        x?.createdAt === target?.createdAt &&
        x?.channel === target?.channel &&
        x?.product === target?.product &&
        (x?.ticketNumber || '') === (target?.ticketNumber || '') &&
        JSON.stringify(x?.numbers || []) === JSON.stringify(target?.numbers || []);
      if (same) {
        removed = true;
        return false;
      }
      return true;
    });
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    setItems(next.filter((x: any) => x.channel === channel));
    haptics.light();
  };

  const groups = items.reduce((acc: Record<string, any[]>, item: any) => {
    const dateKey = item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'Không rõ';
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  const groupKeys = Object.keys(groups);
  if (groupKeys.length === 0) return <Text style={{ color: '#8A8F98' }}>Chưa có lịch sử dò.</Text>;

  return (
    <View style={{ gap: 12 }}>
      {groupKeys.map((dateKey) => (
        <View key={dateKey}>
          <Text style={{ color: '#6F7682', fontWeight: '700', marginBottom: 8 }}>
            {channel === 'xskt' ? `Ngày ${dateKey}` : `Kỳ ${dateKey === 'Không rõ' ? 'Không rõ' : dateKey}`}
          </Text>
          <View style={{ gap: 10 }}>
            {groups[dateKey].map((it, idx) => {
              const isXskt = channel === 'xskt';
              const isWin = Boolean(it?.prize);
              const accent = isXskt ? '#F2C432' : '#6C63FF';
              const icon = isXskt ? '🎫' : it.product === 'keno' ? '⚡' : '◉';
              const nums = Array.isArray(it.numbers) ? it.numbers.map((n: number) => String(n).padStart(2, '0')).join(' ') : (it.ticketNumber || '');
              const drawIdText = it.drawId ? `Kỳ #${String(it.drawId).replace(/^#*/, '')}` : '';
              const sub = drawIdText || (it.frequency === 'every' ? 'Theo kỳ' : 'Một lần');
              const drawText = it.drawDate || dateKey;
              return (
                <SwipeDeleteRow key={`${dateKey}-${idx}`} onDelete={() => { void removeItem(it); }}>
                  <View style={{ borderRadius: 14, overflow: 'hidden', backgroundColor: '#fff' }}>
                    <View style={{ position: 'absolute', right: 0, bottom: 0, width: 80, height: 12, backgroundColor: isWin ? '#34C759' : '#FF2B2B', borderTopLeftRadius: 10 }} />
                    <View style={{ borderRadius: 14, borderWidth: 1, borderColor: isWin ? '#BEE8CF' : '#E6DCE0', backgroundColor: isWin ? '#F2FFF7' : '#FCFCFE', padding: 12, paddingLeft: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: isWin ? '#34C759' : accent }} />
                      <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: '#EEF0F5', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 12 }}>{icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: isWin ? '#1E9E57' : accent, fontWeight: '800', fontSize: 14 }}>{(it.label || '').toUpperCase()}</Text>
                        <Text style={{ color: '#303233', fontWeight: '700', marginTop: 2 }}>{nums || '—'}</Text>
                        <Text style={{ color: '#7F8590', fontSize: 12, marginTop: 1 }}>
                          {sub}{drawText ? ` · ${drawText}` : ''}
                        </Text>
                        {isWin ? (
                          <Text style={{ color: '#1E9E57', fontSize: 12, fontWeight: '700', marginTop: 2 }}>
                            🎉 Trúng giải: {it.prize}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                </SwipeDeleteRow>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}