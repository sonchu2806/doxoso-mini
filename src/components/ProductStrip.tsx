import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const items = [
  { key: 'keno', label: 'Keno', dot: '#F5943A' },
  { key: 'mega', label: 'Mega 6/45', dot: '#8875FF' },
  { key: 'power', label: 'Power 6/55', dot: '#5AA4F4' },
  { key: 'max3d', label: 'Max 3D', dot: '#35E89E' },
  { key: 'max3dpro', label: 'Max 3D Pro', dot: '#35E89E' },
  { key: 'lotto535', label: 'Lotto 5/35', dot: '#F5C840' },
];

type Props = { value: string; onChange: (v: any) => void };

export default function ProductStrip({ value, onChange }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 10 }}>
      {items.map((item) => {
        const active = item.key === value;
        return (
          <TouchableOpacity key={item.key} onPress={() => onChange(item.key)} style={{ height: 32, borderRadius: 999, borderWidth: 1, borderColor: active ? '#2D7FF9' : '#E5E7EB', backgroundColor: active ? '#EEF5FF' : '#FFFFFF', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: item.dot }} />
            <Text style={{ color: active ? '#2D7FF9' : '#8A8F98', fontWeight: active ? '700' : '600', fontSize: 12 }}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const items = [
  { key: 'keno', label: 'Keno', dot: '#F5943A' },
  { key: 'mega', label: 'Mega 6/45', dot: '#8875FF' },
  { key: 'power', label: 'Power 6/55', dot: '#5AA4F4' },
  { key: 'max3d', label: 'Max 3D', dot: '#35E89E' },
  { key: 'max3dpro', label: 'Max 3D Pro', dot: '#35E89E' },
  { key: 'lotto535', label: 'Lotto 5/35', dot: '#F5C840' },
];

type Props = { value: string; onChange: (v: any) => void };

export default function ProductStrip({ value, onChange }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 10 }}>
      {items.map((item) => {
        const active = item.key === value;
        return (
          <TouchableOpacity key={item.key} onPress={() => onChange(item.key)} style={{ height: 32, borderRadius: 999, borderWidth: 1, borderColor: active ? '#2D7FF9' : '#E5E7EB', backgroundColor: active ? '#EEF5FF' : '#FFFFFF', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: item.dot }} />
            <Text style={{ color: active ? '#2D7FF9' : '#8A8F98', fontWeight: active ? '700' : '600', fontSize: 12 }}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const ITEMS = [
  { key: 'keno', label: 'Keno', dot: '#F5943A' },
  { key: 'mega', label: 'Mega 6/45', dot: '#8875FF' },
  { key: 'power', label: 'Power 6/55', dot: '#5AA4F4' },
  { key: 'max3d', label: 'Max 3D', dot: '#35E89E' },
  { key: 'max3dpro', label: 'Max 3D Pro', dot: '#35E89E' },
  { key: 'lotto535', label: 'Lotto 5/35', dot: '#F5C840' },
];

type Props = {
  value: string;
  onChange: (v: any) => void;
};

export default function ProductStrip({ value, onChange }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 10 }}>
      {ITEMS.map((item) => {
        const active = item.key === value;
        return (
          <TouchableOpacity
            key={item.key}
            onPress={() => onChange(item.key)}
            style={{
              height: 32,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: active ? '#2D7FF9' : '#E5E7EB',
              backgroundColor: active ? '#EEF5FF' : '#FFFFFF',
              paddingHorizontal: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: item.dot }} />
            <Text style={{ color: active ? '#2D7FF9' : '#8A8F98', fontWeight: active ? '700' : '600', fontSize: 12 }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
import { useTheme } from '@shopify/restyle';
import type { Theme } from '../theme';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

type ProductValue = 'keno' | 'mega' | 'power' | 'max3d' | 'max3dpro' | 'lotto535';

type ProductStripProps = {
  value: ProductValue;
  onChange: (v: ProductValue) => void;
};

const PRODUCTS: Array<{
  value: ProductValue;
  label: string;
  dotColor: keyof Theme['colors'];
}> = [
  { value: 'keno', label: 'Keno', dotColor: 'dotKeno' },
  { value: 'mega', label: 'Mega 6/45', dotColor: 'dotMega645' },
  { value: 'power', label: 'Power 6/55', dotColor: 'dotPower655' },
  { value: 'max3d', label: 'Max 3D', dotColor: 'dotMax3D' },
  { value: 'max3dpro', label: 'Max 3D Pro', dotColor: 'dotMax3DPro' },
  { value: 'lotto535', label: 'Lotto 5/35', dotColor: 'dotLotto535' },
];

export default function ProductStrip({ value, onChange }: ProductStripProps) {
  const theme = useTheme<Theme>();

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', paddingRight: theme.spacing.s }}>
          {PRODUCTS.map((p, idx) => {
            const isActive = value === p.value;
            const isLast = idx === PRODUCTS.length - 1;

            return (
              <TouchableOpacity
                key={p.value}
                activeOpacity={0.85}
                onPress={() => onChange(p.value)}
                style={{
                  height: 32,
                  paddingHorizontal: 12,
                  borderRadius: theme.borderRadii.full,
                  borderWidth: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isActive ? theme.colors.bgTonal : theme.colors.bgSecondary,
                  borderColor: isActive ? theme.colors.borderBrand : theme.colors.borderDefault,
                  marginRight: isLast ? 0 : theme.spacing.s,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 9999,
                    backgroundColor: theme.colors[p.dotColor],
                    marginRight: theme.spacing.xs,
                  }}
                />
                <Text
                  style={{
                    color: isActive ? theme.colors.textBrand : theme.colors.textHint,
                    fontWeight: isActive ? '600' : '400',
                  }}
                >
                  {p.label}
                </Text>
            </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      <Text style={{ marginTop: 6, fontSize: 11, color: theme.colors.textDisable }}>
        Vuốt sang trái để xem thêm sản phẩm
      </Text>
    </View>
  );
}

