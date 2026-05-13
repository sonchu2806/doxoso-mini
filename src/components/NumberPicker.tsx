import { Text, TouchableOpacity, View } from 'react-native';

type Props = {
  total: number;
  pickCount: number;
  accentColor?: string;
  values: number[];
  onChange: (v: number[]) => void;
  specialValues?: number[];
  onSpecialChange?: (v: number[]) => void;
  specialTotal?: number;
  specialPickCount?: number;
  specialLabel?: string;
};

function toggle(values: number[], n: number, max: number): number[] {
  if (values.includes(n)) return values.filter((x) => x !== n);
  if (values.length >= max) return values;
  return [...values, n].sort((a, b) => a - b);
}

export default function NumberPicker({ total, pickCount, accentColor = '#2D7FF9', values, onChange, specialValues = [], onSpecialChange, specialTotal = 0, specialPickCount = 0, specialLabel }: Props) {
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
          const active = values.includes(n);
          return (
            <TouchableOpacity key={n} onPress={() => onChange(toggle(values, n, pickCount))} style={{ width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: active ? accentColor : '#E5E7EB', backgroundColor: active ? accentColor : '#FFF', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: active ? '#FFF' : '#303233', fontWeight: '700', fontSize: 12 }}>{String(n).padStart(2, '0')}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {onSpecialChange && specialTotal > 0 ? (
        <View style={{ gap: 8 }}>
          <Text style={{ fontWeight: '700', color: '#303233' }}>{specialLabel || 'Số đặc biệt'}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {Array.from({ length: specialTotal }, (_, i) => i + 1).map((n) => {
              const active = specialValues.includes(n);
              return (
                <TouchableOpacity key={`s-${n}`} onPress={() => onSpecialChange(toggle(specialValues, n, specialPickCount))} style={{ width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: active ? '#F5C840' : '#E5E7EB', backgroundColor: active ? '#F5C840' : '#FFF', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: active ? '#FFF' : '#303233', fontWeight: '700', fontSize: 12 }}>{String(n).padStart(2, '0')}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}
import { Text, TouchableOpacity, View } from 'react-native';

type Props = {
  total: number;
  pickCount: number;
  accentColor?: string;
  values: number[];
  onChange: (v: number[]) => void;
  specialValues?: number[];
  onSpecialChange?: (v: number[]) => void;
  specialTotal?: number;
  specialPickCount?: number;
  specialLabel?: string;
};

function toggle(values: number[], n: number, max: number): number[] {
  if (values.includes(n)) return values.filter((x) => x !== n);
  if (values.length >= max) return values;
  return [...values, n].sort((a, b) => a - b);
}

export default function NumberPicker({ total, pickCount, accentColor = '#2D7FF9', values, onChange, specialValues = [], onSpecialChange, specialTotal = 0, specialPickCount = 0, specialLabel }: Props) {
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
          const active = values.includes(n);
          return (
            <TouchableOpacity key={n} onPress={() => onChange(toggle(values, n, pickCount))} style={{ width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: active ? accentColor : '#E5E7EB', backgroundColor: active ? accentColor : '#FFF', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: active ? '#FFF' : '#303233', fontWeight: '700', fontSize: 12 }}>{String(n).padStart(2, '0')}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {onSpecialChange && specialTotal > 0 ? (
        <View style={{ gap: 8 }}>
          <Text style={{ fontWeight: '700', color: '#303233' }}>{specialLabel || 'Số đặc biệt'}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {Array.from({ length: specialTotal }, (_, i) => i + 1).map((n) => {
              const active = specialValues.includes(n);
              return (
                <TouchableOpacity key={`s-${n}`} onPress={() => onSpecialChange(toggle(specialValues, n, specialPickCount))} style={{ width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: active ? '#F5C840' : '#E5E7EB', backgroundColor: active ? '#F5C840' : '#FFF', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: active ? '#FFF' : '#303233', fontWeight: '700', fontSize: 12 }}>{String(n).padStart(2, '0')}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}
import { Text, TouchableOpacity, View } from 'react-native';

type Props = {
  total: number;
  pickCount: number;
  accentColor?: string;
  values: number[];
  onChange: (v: number[]) => void;
  specialValues?: number[];
  onSpecialChange?: (v: number[]) => void;
  specialTotal?: number;
  specialPickCount?: number;
  specialLabel?: string;
};

function toggle(values: number[], n: number, max: number): number[] {
  if (values.includes(n)) return values.filter((x) => x !== n);
  if (values.length >= max) return values;
  return [...values, n].sort((a, b) => a - b);
}

export default function NumberPicker({
  total,
  pickCount,
  accentColor = '#2D7FF9',
  values,
  onChange,
  specialValues = [],
  onSpecialChange,
  specialTotal = 0,
  specialPickCount = 0,
  specialLabel,
}: Props) {
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
          const active = values.includes(n);
          return (
            <TouchableOpacity
              key={n}
              onPress={() => onChange(toggle(values, n, pickCount))}
              style={{
                width: 38, height: 38, borderRadius: 19, borderWidth: 1,
                borderColor: active ? accentColor : '#E5E7EB',
                backgroundColor: active ? accentColor : '#FFF',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ color: active ? '#FFF' : '#303233', fontWeight: '700', fontSize: 12 }}>
                {String(n).padStart(2, '0')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {onSpecialChange && specialTotal > 0 ? (
        <View style={{ gap: 8 }}>
          <Text style={{ fontWeight: '700', color: '#303233' }}>{specialLabel || 'Số đặc biệt'}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {Array.from({ length: specialTotal }, (_, i) => i + 1).map((n) => {
              const active = specialValues.includes(n);
              return (
                <TouchableOpacity
                  key={`s-${n}`}
                  onPress={() => onSpecialChange(toggle(specialValues, n, specialPickCount))}
                  style={{
                    width: 38, height: 38, borderRadius: 19, borderWidth: 1,
                    borderColor: active ? '#F5C840' : '#E5E7EB',
                    backgroundColor: active ? '#F5C840' : '#FFF',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: active ? '#FFF' : '#303233', fontWeight: '700', fontSize: 12 }}>
                    {String(n).padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}
import { useTheme } from '@shopify/restyle';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Theme } from '../theme';
import { haptics } from '../utils/haptics';

type NumberPickerProps = {
  total: number;
  pickCount: number;
  accentColor: string;
  values: number[];
  onChange: (values: number[]) => void;
  specialValues?: number[];
  onSpecialChange?: (values: number[]) => void;
  specialTotal?: number;
  specialPickCount?: number;
  specialLabel?: string;
};

export default function NumberPicker({
  total,
  pickCount,
  accentColor,
  values,
  onChange,
  specialValues = [],
  onSpecialChange,
  specialTotal = 12,
  specialPickCount = 1,
  specialLabel = '⭐ Số đặc biệt (01-12)',
}: NumberPickerProps) {
  const theme = useTheme<Theme>();

  const handlePressNumber = (value: number) => {
    haptics.light();
    const isSelected = values.includes(value);

    if (isSelected) {
      onChange(values.filter((item) => item !== value));
      return;
    }

    if (values.length >= pickCount) return;

    onChange([...values, value].sort((a, b) => a - b));
  };

  const handlePressSpecialNumber = (value: number) => {
    if (!onSpecialChange) return;
    haptics.light();
    const isSelected = specialValues.includes(value);
    if (isSelected) {
      onSpecialChange(specialValues.filter((item) => item !== value));
      return;
    }
    if (specialValues.length >= specialPickCount) return;
    onSpecialChange([...specialValues, value].sort((a, b) => a - b));
  };

  return (
    <View>
      <Text style={[styles.header, { color: accentColor }]}>
        Đã chọn {values.length} / {pickCount} số
      </Text>

      <View style={styles.grid}>
        {Array.from({ length: total }, (_, index) => {
          const value = index + 1;
          const label = value.toString().padStart(2, '0');
          const isSelected = values.includes(value);
          const isDisabled = values.length >= pickCount && !isSelected;

          return (
            <TouchableOpacity
              key={value}
              activeOpacity={0.85}
              onPress={() => handlePressNumber(value)}
              disabled={isDisabled}
              style={[
                styles.item,
                {
                  backgroundColor: isSelected ? accentColor : theme.colors.bgSecondary,
                  borderColor: isSelected ? accentColor : theme.colors.textDisable,
                  opacity: isDisabled ? 0.4 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.itemText,
                  {
                    color: isSelected ? theme.colors.textOnDark : theme.colors.textPrimary,
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {onSpecialChange ? (
        <View style={{ marginTop: 12 }}>
          <Text style={[styles.header, { color: theme.colors.textPrimary }]}>{specialLabel}</Text>
          <View style={styles.grid}>
            {Array.from({ length: specialTotal }, (_, index) => {
              const value = index + 1;
              const label = value.toString().padStart(2, '0');
              const isSelected = specialValues.includes(value);
              const isDisabled = specialValues.length >= specialPickCount && !isSelected;
              return (
                <TouchableOpacity
                  key={`special-${value}`}
                  activeOpacity={0.85}
                  onPress={() => handlePressSpecialNumber(value)}
                  disabled={isDisabled}
                  style={[
                    styles.item,
                    {
                      backgroundColor: isSelected ? accentColor : theme.colors.bgSecondary,
                      borderColor: isSelected ? accentColor : theme.colors.textDisable,
                      opacity: isDisabled ? 0.4 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.itemText,
                      { color: isSelected ? theme.colors.textOnDark : theme.colors.textPrimary },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 12,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  item: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
