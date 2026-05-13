import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@shopify/restyle';
import SlotInput, { type SlotInputRef } from './SlotInput';
import type { Theme } from '../theme';

type Max3DProInputProps = {
  accentColor: string;
  values: [string[], string[]];
  onChange: (values: [string[], string[]]) => void;
};

export default function Max3DProInput({ accentColor, values, onChange }: Max3DProInputProps) {
  const theme = useTheme<Theme>();
  const groupBRef = useRef<SlotInputRef>(null);

  return (
    <View style={styles.row}>
      <View style={styles.group}>
        <Text style={[styles.label, { color: theme.colors.textHint }]}>Bộ A</Text>
        <SlotInput
          count={3}
          maxValue={9}
          isDigit
          allowDuplicates
          accentColor={accentColor}
          values={values[0]}
          onChange={(nextValues) => onChange([nextValues, values[1]])}
          onFilledLastSlot={() => {
            setTimeout(() => groupBRef.current?.focusSlot(0), 60);
          }}
        />
      </View>

      <Text style={[styles.separator, { color: theme.colors.textPrimary }]}> — </Text>

      <View style={styles.group}>
        <Text style={[styles.label, { color: theme.colors.textHint }]}>Bộ B</Text>
        <SlotInput
          ref={groupBRef}
          count={3}
          maxValue={9}
          isDigit
          allowDuplicates
          accentColor={accentColor}
          values={values[1]}
          onChange={(nextValues) => onChange([values[0], nextValues])}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  group: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    marginBottom: 4,
  },
  separator: {
    fontSize: 20,
    fontWeight: '700',
  },
});
