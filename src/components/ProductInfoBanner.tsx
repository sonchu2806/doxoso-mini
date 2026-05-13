import { Text, View } from 'react-native';

type Props = { product: string };

const map: Record<string, string> = {
  keno: 'Chọn từ 1-10 số trong 01-80.',
  mega: 'Mega 6/45: chọn 6 số trong 01-45.',
  power: 'Power 6/55: chọn 6 số trong 01-55.',
  max3d: 'Max 3D: nhập 3 chữ số.',
  max3dpro: 'Max 3D Pro: nhập 2 bộ, mỗi bộ 3 chữ số.',
  lotto535: 'Lotto 5/35: chọn 5 số + 1 số đặc biệt.',
};

export default function ProductInfoBanner({ product }: Props) {
  return (
    <View style={{ padding: 12, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#ECECF1' }}>
      <Text style={{ fontSize: 12, color: '#8A8F98' }}>{map[product] || ''}</Text>
    </View>
  );
}
import { Text, View } from 'react-native';

type Props = { product: string };

const map: Record<string, string> = {
  keno: 'Chọn từ 1-10 số trong 01-80.',
  mega: 'Mega 6/45: chọn 6 số trong 01-45.',
  power: 'Power 6/55: chọn 6 số trong 01-55.',
  max3d: 'Max 3D: nhập 3 chữ số.',
  max3dpro: 'Max 3D Pro: nhập 2 bộ, mỗi bộ 3 chữ số.',
  lotto535: 'Lotto 5/35: chọn 5 số + 1 số đặc biệt.',
};

export default function ProductInfoBanner({ product }: Props) {
  return (
    <View style={{ padding: 12, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#ECECF1' }}>
      <Text style={{ fontSize: 12, color: '#8A8F98' }}>{map[product] || ''}</Text>
    </View>
  );
}
import { Text, View } from 'react-native';

type Props = { product: string };

const MAP: Record<string, string> = {
  keno: 'Chọn từ 1-10 số trong 01-80.',
  mega: 'Mega 6/45: chọn 6 số trong 01-45.',
  power: 'Power 6/55: chọn 6 số trong 01-55.',
  max3d: 'Max 3D: nhập 3 chữ số.',
  max3dpro: 'Max 3D Pro: nhập 2 bộ, mỗi bộ 3 chữ số.',
  lotto535: 'Lotto 5/35: chọn 5 số + 1 số đặc biệt.',
};

export default function ProductInfoBanner({ product }: Props) {
  return (
    <View style={{ padding: 12, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#ECECF1' }}>
      <Text style={{ fontSize: 12, color: '#8A8F98' }}>{MAP[product] || ''}</Text>
    </View>
  );
}
import { useTheme } from '@shopify/restyle';
import type { Theme } from '../theme';
import { StyleSheet, Text, View } from 'react-native';

type ProductKey = 'keno' | 'mega' | 'power' | 'max3d' | 'max3dpro' | 'lotto535';

type ProductInfoBannerProps = {
  product: ProductKey;
};

const PRODUCT_INFO: Record<
  ProductKey,
  {
    icon: string;
    name: string;
    desc: string;
    schedule: string;
    accent: keyof Theme['colors'];
    softBg: keyof Theme['colors'];
    softBorder: keyof Theme['colors'];
    iconBoxBg: keyof Theme['colors'];
  }
> = {
  keno: {
    icon: '🎰',
    name: 'Keno',
    desc: 'Chọn 1–10 số từ 01–80. Quay 20 số, 8 phút/kỳ.',
    schedule: 'Mỗi ngày 06:00–21:52',
    accent: 'accentKeno',
    softBg: 'accentKenoSoft',
    softBorder: 'accentKenoBorder',
    iconBoxBg: 'accentKenoBox',
  },
  mega: {
    icon: '🎱',
    name: 'Mega 6/45',
    desc: 'Chọn 6 số từ 01–45. Trùng 6 → Jackpot.',
    schedule: 'Thứ 4 · Thứ 6 · CN · 18:00',
    accent: 'accentMega',
    softBg: 'accentMegaSoft',
    softBorder: 'accentMegaBorder',
    iconBoxBg: 'accentMegaBox',
  },
  power: {
    icon: '⚡',
    name: 'Power 6/55',
    desc: 'Chọn 6 số + 1 số Power. Jackpot 1 khi trúng 6+Power.',
    schedule: 'Thứ 3 · Thứ 5 · Thứ 7 · 18:00',
    accent: 'accentPower',
    softBg: 'accentPowerSoft',
    softBorder: 'accentPowerBorder',
    iconBoxBg: 'accentPowerBox',
  },
  max3d: {
    icon: '🎲',
    name: 'Max 3D',
    desc: 'Bộ 3 chữ số 000–999. Trùng chính xác hoặc đảo số.',
    schedule: 'Thứ 2 · Thứ 4 · Thứ 6 · 18:00',
    accent: 'accentMax3D',
    softBg: 'accentMax3DSoft',
    softBorder: 'accentMax3DBorder',
    iconBoxBg: 'accentMax3DBox',
  },
  max3dpro: {
    icon: '🎲',
    name: 'Max 3D Pro',
    desc: 'Chọn 6 bộ số 3 chữ số. Nhiều cơ hội trúng hơn Max 3D.',
    schedule: 'Thứ 2 · Thứ 4 · Thứ 6 · 18:00',
    accent: 'accentMax3DPro',
    softBg: 'accentMax3DProSoft',
    softBorder: 'accentMax3DProBorder',
    iconBoxBg: 'accentMax3DProBox',
  },
  lotto535: {
    icon: '🍀',
    name: 'Lotto 5/35',
    desc: 'Chọn 5 số từ 01–35. Quay thưởng mỗi ngày.',
    schedule: 'Hàng ngày · 18:00',
    accent: 'accentLotto535',
    softBg: 'accentLotto535Soft',
    softBorder: 'accentLotto535Border',
    iconBoxBg: 'accentLotto535Box',
  },
};

export default function ProductInfoBanner({ product }: ProductInfoBannerProps) {
  const theme = useTheme<Theme>();
  const info = PRODUCT_INFO[product];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors[info.softBg],
          borderColor: theme.colors[info.softBorder],
        },
      ]}
    >
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: theme.colors[info.iconBoxBg],
          },
        ]}
      >
        <Text style={styles.icon}>{info.icon}</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{info.name}</Text>
        <Text style={[styles.desc, { color: theme.colors.textSecondary }]}>{info.desc}</Text>

        <View
          style={[
            styles.scheduleTag,
            {
              backgroundColor: theme.colors[info.softBg],
            },
          ]}
        >
          <Text style={[styles.scheduleText, { color: theme.colors[info.accent] }]}>{info.schedule}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  desc: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 5,
  },
  scheduleTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  scheduleText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
