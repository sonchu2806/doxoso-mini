import { Text, TouchableOpacity, View } from 'react-native';

type Value = 'chan' | 'le' | 'lon' | 'nho' | null;
type Props = { value: Value; onChange: (v: Value) => void };

const items: { key: Exclude<Value, null>; label: string }[] = [
  { key: 'chan', label: 'Chẵn' },
  { key: 'le', label: 'Lẻ' },
  { key: 'lon', label: 'Lớn' },
  { key: 'nho', label: 'Nhỏ' },
];

export default function KenoTextMode({ value, onChange }: Props) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {items.map((i) => {
        const active = value === i.key;
        return (
          <TouchableOpacity key={i.key} onPress={() => onChange(i.key)} style={{ paddingHorizontal: 14, height: 34, borderRadius: 18, borderWidth: 1, borderColor: active ? '#F5943A' : '#E5E7EB', backgroundColor: active ? '#FFF3E8' : '#FFFFFF', justifyContent: 'center' }}>
            <Text style={{ color: active ? '#F5943A' : '#8A8F98', fontWeight: '700' }}>{i.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
import { Text, TouchableOpacity, View } from 'react-native';

type Value = 'chan' | 'le' | 'lon' | 'nho' | null;
type Props = { value: Value; onChange: (v: Value) => void };

const items: { key: Exclude<Value, null>; label: string }[] = [
  { key: 'chan', label: 'Chẵn' },
  { key: 'le', label: 'Lẻ' },
  { key: 'lon', label: 'Lớn' },
  { key: 'nho', label: 'Nhỏ' },
];

export default function KenoTextMode({ value, onChange }: Props) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {items.map((i) => {
        const active = value === i.key;
        return (
          <TouchableOpacity key={i.key} onPress={() => onChange(i.key)} style={{ paddingHorizontal: 14, height: 34, borderRadius: 18, borderWidth: 1, borderColor: active ? '#F5943A' : '#E5E7EB', backgroundColor: active ? '#FFF3E8' : '#FFFFFF', justifyContent: 'center' }}>
            <Text style={{ color: active ? '#F5943A' : '#8A8F98', fontWeight: '700' }}>{i.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
import { Text, TouchableOpacity, View } from 'react-native';

type Value = 'chan' | 'le' | 'lon' | 'nho' | null;

type Props = {
  value: Value;
  onChange: (v: Value) => void;
};

const ITEMS: { key: Exclude<Value, null>; label: string }[] = [
  { key: 'chan', label: 'Chẵn' },
  { key: 'le', label: 'Lẻ' },
  { key: 'lon', label: 'Lớn' },
  { key: 'nho', label: 'Nhỏ' },
];

export default function KenoTextMode({ value, onChange }: Props) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {ITEMS.map((item) => {
        const active = value === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            onPress={() => onChange(item.key)}
            style={{
              paddingHorizontal: 14,
              height: 34,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: active ? '#F5943A' : '#E5E7EB',
              backgroundColor: active ? '#FFF3E8' : '#FFFFFF',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: active ? '#F5943A' : '#8A8F98', fontWeight: '700' }}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
import { useTheme } from '@shopify/restyle';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Theme } from '../theme';

type KenoTextValue = 'chan' | 'le' | 'lon' | 'nho';

type KenoTextModeProps = {
  value: KenoTextValue | null;
  onChange: (v: KenoTextValue | null) => void;
};

const OPTIONS: Array<{ key: KenoTextValue; label: string }> = [
  { key: 'chan', label: 'Chẵn' },
  { key: 'le', label: 'Lẻ' },
  { key: 'lon', label: 'Lớn' },
  { key: 'nho', label: 'Nhỏ' },
];

export default function KenoTextMode({ value, onChange }: KenoTextModeProps) {
  const theme = useTheme<Theme>();

  const selectedLabel =
    value === 'chan' ? 'Chẵn' : value === 'le' ? 'Lẻ' : value === 'lon' ? 'Lớn' : value === 'nho' ? 'Nhỏ' : '';

  return (
    <View>
      <View style={[styles.ruleCard, { backgroundColor: theme.colors.bgSecondary }]}>
        <Text style={[styles.ruleText, { color: theme.colors.textHint }]}>
          <Text style={[styles.ruleStrong, { color: theme.colors.textPrimary }]}>Chẵn/Lẻ: </Text>
          ≥ 13/20 số chẵn → Chẵn thắng, ngược lại Lẻ thắng.
        </Text>
        <Text style={[styles.ruleText, { color: theme.colors.textHint }]}>
          <Text style={[styles.ruleStrong, { color: theme.colors.textPrimary }]}>Lớn/Nhỏ: </Text>
          ≥ 13/20 số ≥ 41 → Lớn thắng, ngược lại Nhỏ thắng.
        </Text>
        <Text style={[styles.ruleText, { color: theme.colors.textHint }]}>
          <Text style={[styles.ruleStrong, { color: theme.colors.textPrimary }]}>Giải thưởng: </Text>
          56.000đ khi đặt 10.000đ.
        </Text>
      </View>

      <View style={styles.grid}>
        {OPTIONS.map((option) => {
          const isActive = value === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              activeOpacity={0.85}
              onPress={() => onChange(isActive ? null : option.key)}
              style={[
                styles.option,
                {
                  backgroundColor: isActive ? theme.colors.accentKenoSoft : theme.colors.bgSecondary,
                  borderColor: isActive ? theme.colors.accentKeno : theme.colors.borderDefault,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: isActive ? theme.colors.accentKeno : theme.colors.textHint,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {value !== null && (
        <Text style={[styles.confirmText, { color: theme.colors.accentKeno }]}>Bạn đã chọn: {selectedLabel}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ruleCard: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  ruleText: {
    fontSize: 11,
    lineHeight: 18,
  },
  ruleStrong: {
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    width: '48%',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '800',
  },
  confirmText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
});
