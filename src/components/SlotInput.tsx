import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import type { Theme } from '../theme';
import { haptics } from '../utils/haptics';

export type SlotInputRef = {
  focusSlot: (index: number) => void;
};

type SlotInputProps = {
  count: number;
  maxValue: number;
  isDigit?: boolean;
  allowDuplicates?: boolean;
  accentColor?: string;
  values: string[];
  onChange: (values: string[]) => void;
  /** Gọi khi vừa nhập xong ô cuối (ví dụ Max 3D Pro: nhảy sang bộ B). */
  onFilledLastSlot?: () => void;
};

const SLOT_SIZE = 44;
const GAP = 4;

const SlotInput = forwardRef<SlotInputRef, SlotInputProps>(function SlotInput(
  {
    count = 0,
    maxValue = 0,
    isDigit = true,
    allowDuplicates = false,
    accentColor,
    values = [],
    onChange = () => {},
    onFilledLastSlot,
  },
  ref,
) {
  const theme = useTheme<Theme>();
  const inputRef = useRef<TextInput>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(count > 0 ? 0 : null);
  const [pendingInput, setPendingInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const activeBorderColor = accentColor ?? theme.colors.borderBrand;
  const focusDelay = Platform.OS === 'web' ? 100 : 50;

  useImperativeHandle(
    ref,
    () => ({
      focusSlot: (index: number) => {
        if (count <= 0) return;
        setPendingInput('');
        setErrorMessage(null);
        const clamped = Math.max(0, Math.min(index, count - 1));
        setActiveIndex(clamped);
        setTimeout(() => {
          inputRef.current?.focus();
        }, focusDelay);
      },
    }),
    [count, focusDelay],
  );

  useEffect(() => {
    setActiveIndex(null);
    setPendingInput('');
    setErrorMessage(null);
  }, [count]);

  useEffect(() => {
    if (isDigit) {
      setPendingInput('');
    }
  }, [isDigit]);

  useEffect(() => {
    if (!errorMessage) return undefined;

    const timeoutId = setTimeout(() => {
      setErrorMessage(null);
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [errorMessage]);

  const setValueAt = (index: number, nextValue: string) => {
    const nextValues = [...values];
    while (nextValues.length < count) {
      nextValues.push('');
    }
    nextValues[index] = nextValue;
    onChange(nextValues);
  };

  const moveToIndex = (index: number) => {
    if (count <= 0) {
      setActiveIndex(null);
      return;
    }

    const clamped = Math.max(0, Math.min(index, count - 1));
    setActiveIndex(clamped);
  };

  const focusInputWithDelay = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, focusDelay);
  };

  const hasDuplicate = (candidate: string, index: number) => {
    if (allowDuplicates) return false;
    return values.some((value, valueIndex) => valueIndex !== index && value === candidate);
  };

  function commitPendingInput() {
    if (isDigit) return;
    if (activeIndex === null || activeIndex >= count) return;
    if (pendingInput.length === 0) return;

    const numericValue = Number.parseInt(pendingInput, 10);
    if (!Number.isInteger(numericValue) || numericValue < 1 || numericValue > maxValue) {
      setErrorMessage(`Chỉ nhập được tới ${maxValue}`);
      setPendingInput('');
      return;
    }

    const normalizedValue = pendingInput.padStart(2, '0');
    if (hasDuplicate(normalizedValue, activeIndex)) {
      setErrorMessage(`Số ${normalizedValue} đã được chọn!`);
      setPendingInput('');
      return;
    }

    setValueAt(activeIndex, normalizedValue);
    setPendingInput('');
  }

  const handleBackspace = () => {
    if (activeIndex === null || activeIndex >= values.length) return;
    setErrorMessage(null);

    if (!isDigit && pendingInput.length > 0) {
      setPendingInput((current) => current.slice(0, -1));
      return;
    }

    if (values[activeIndex]) {
      setValueAt(activeIndex, '');
      return;
    }

    if (activeIndex > 0) {
      const previousIndex = activeIndex - 1;
      if (previousIndex >= values.length) return;
      setValueAt(previousIndex, '');
      setActiveIndex(previousIndex);
    }
  };

  const handleDigitInput = (digit: string) => {
    if (activeIndex === null || activeIndex >= values.length) return;

    if (isDigit) {
      if (hasDuplicate(digit, activeIndex)) {
        setErrorMessage(`Số ${digit} đã được chọn!`);
        return;
      }
      setErrorMessage(null);
      setValueAt(activeIndex, digit);
      if (activeIndex === count - 1 && onFilledLastSlot) {
        setActiveIndex(null);
        onFilledLastSlot();
        return;
      }
      moveToIndex(activeIndex + 1);
      return;
    }

    const nextPending = `${pendingInput}${digit}`.slice(0, 2);
    if (nextPending.length === 1) {
      setPendingInput(nextPending);
      return;
    }

    const numericValue = Number.parseInt(nextPending, 10);
    if (numericValue < 1 || numericValue > maxValue) {
      setErrorMessage(`Chỉ nhập được tới ${maxValue}`);
      setPendingInput('');
      return;
    }

    if (hasDuplicate(nextPending, activeIndex)) {
      setErrorMessage(`Số ${nextPending} đã được chọn!`);
      setPendingInput('');
      return;
    }

    setErrorMessage(null);
    setValueAt(activeIndex, nextPending);
    setPendingInput('');
    moveToIndex(activeIndex + 1);
  };

  const handleKeyPress = (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    const { key } = event.nativeEvent;

    if (key === 'Backspace') {
      handleBackspace();
      return;
    }

    if (/^\d$/.test(key)) {
      handleDigitInput(key);
    }
  };

  const getDisplayValue = (index: number) => {
    if (!isDigit && index === activeIndex && pendingInput.length > 0) {
      return pendingInput;
    }

    const value = values[index] ?? '';
    if (!isDigit && value) {
      return value.padStart(2, '0');
    }

    return value;
  };

  if (count === 0) {
    return null;
  }

  return (
    <View>
      <View style={styles.grid}>
        {Array.from({ length: count }).map((_, index) => {
          const displayValue = getDisplayValue(index);
          const hasValue = displayValue.length > 0;
          const isActive = index === activeIndex;

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.85}
              onPress={() => {
                haptics.light();
                commitPendingInput();
                setPendingInput('');
                setErrorMessage(null);
                setActiveIndex(index);
                focusInputWithDelay();
              }}
              style={[
                styles.slot,
                {
                  backgroundColor: isActive
                    ? theme.colors.bgTonal
                    : hasValue
                      ? theme.colors.bgPrimary
                      : theme.colors.bgSecondary,
                  borderColor: isActive ? activeBorderColor : theme.colors.textDisable,
                  borderWidth: isActive ? 2 : 1.5,
                },
              ]}
            >
              <Text
                style={[
                  styles.slotText,
                  {
                    color: hasValue ? theme.colors.textPrimary : theme.colors.textHint,
                  },
                ]}
              >
                {displayValue}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {activeIndex !== null && activeIndex < values.length && (
        <TextInput
          ref={inputRef}
          autoFocus
          blurOnSubmit={false}
          keyboardType="numeric"
          value={isDigit ? '' : pendingInput}
          onChangeText={() => {}}
          onKeyPress={handleKeyPress}
          style={[
            styles.input,
            {
              borderColor: theme.colors.borderDefault,
              color: theme.colors.textPrimary,
            },
          ]}
        />
      )}

      {errorMessage ? (
        <Text style={[styles.errorText, { color: theme.colors.textError }]}>{errorMessage}</Text>
      ) : null}
    </View>
  );
});

export default SlotInput;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  slot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  input: {
    marginTop: 12,
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
  },
});
