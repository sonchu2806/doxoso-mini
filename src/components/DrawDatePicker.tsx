import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { formatDrawDate, getRecentDrawDates } from '../utils/drawSchedule';

type Props = { product: string; value: string; onChange: (d: string) => void; accentColor?: string };

export default function DrawDatePicker({ product, value, onChange, accentColor = '#2D7FF9' }: Props) {
  const [open, setOpen] = useState(false);
  const dates = useMemo(() => getRecentDrawDates(product, 15), [product]);
  return (
    <>
      <TouchableOpacity onPress={() => setOpen(true)} style={{ height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#EBEBEB', backgroundColor: '#F2F2F6', paddingHorizontal: 12, justifyContent: 'center' }}>
        <Text style={{ color: '#303233' }}>📅 {value ? formatDrawDate(value) : 'Mới nhất'}</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' }} onPress={() => setOpen(false)} />
        <View style={{ maxHeight: '55%', backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <ScrollView>
            <TouchableOpacity onPress={() => { onChange(''); setOpen(false); }} style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: '#F2F2F6' }}>
              <Text style={{ color: !value ? accentColor : '#303233', fontWeight: !value ? '700' : '400' }}>Mới nhất</Text>
            </TouchableOpacity>
            {dates.map((d) => (
              <TouchableOpacity key={d} onPress={() => { onChange(d); setOpen(false); }} style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: '#F2F2F6' }}>
                <Text style={{ color: value === d ? accentColor : '#303233', fontWeight: value === d ? '700' : '400' }}>{formatDrawDate(d)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { formatDrawDate, getRecentDrawDates } from '../utils/drawSchedule';

type Props = { product: string; value: string; onChange: (d: string) => void; accentColor?: string };

export default function DrawDatePicker({ product, value, onChange, accentColor = '#2D7FF9' }: Props) {
  const [open, setOpen] = useState(false);
  const dates = useMemo(() => getRecentDrawDates(product, 15), [product]);
  return (
    <>
      <TouchableOpacity onPress={() => setOpen(true)} style={{ height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#EBEBEB', backgroundColor: '#F2F2F6', paddingHorizontal: 12, justifyContent: 'center' }}>
        <Text style={{ color: '#303233' }}>📅 {value ? formatDrawDate(value) : 'Mới nhất'}</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' }} onPress={() => setOpen(false)} />
        <View style={{ maxHeight: '55%', backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <ScrollView>
            <TouchableOpacity onPress={() => { onChange(''); setOpen(false); }} style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: '#F2F2F6' }}>
              <Text style={{ color: !value ? accentColor : '#303233', fontWeight: !value ? '700' : '400' }}>Mới nhất</Text>
            </TouchableOpacity>
            {dates.map((d) => (
              <TouchableOpacity key={d} onPress={() => { onChange(d); setOpen(false); }} style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: '#F2F2F6' }}>
                <Text style={{ color: value === d ? accentColor : '#303233', fontWeight: value === d ? '700' : '400' }}>{formatDrawDate(d)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { formatDrawDate, getRecentDrawDates } from '../utils/drawSchedule';

type Props = {
  product: string;
  value: string;
  onChange: (date: string) => void;
  accentColor?: string;
};

export default function DrawDatePicker({ product, value, onChange, accentColor = '#2D7FF9' }: Props) {
  const [open, setOpen] = useState(false);
  const dates = useMemo(() => getRecentDrawDates(product, 15), [product]);
  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={{ height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#EBEBEB', backgroundColor: '#F2F2F6', paddingHorizontal: 12, justifyContent: 'center' }}
      >
        <Text style={{ color: '#303233' }}>📅 {value ? formatDrawDate(value) : 'Mới nhất'}</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' }} onPress={() => setOpen(false)} />
        <View style={{ maxHeight: '55%', backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <ScrollView>
            <TouchableOpacity onPress={() => { onChange(''); setOpen(false); }} style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: '#F2F2F6' }}>
              <Text style={{ color: !value ? accentColor : '#303233', fontWeight: !value ? '700' : '400' }}>Mới nhất</Text>
            </TouchableOpacity>
            {dates.map((d) => (
              <TouchableOpacity key={d} onPress={() => { onChange(d); setOpen(false); }} style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: '#F2F2F6' }}>
                <Text style={{ color: value === d ? accentColor : '#303233', fontWeight: value === d ? '700' : '400' }}>
                  {formatDrawDate(d)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatDrawDate, getRecentDrawDates } from '../utils/drawSchedule';

type DrawDatePickerProps = {
  product: string;
  value: string; // '' = hôm nay/mới nhất
  onChange: (date: string) => void;
  accentColor?: string;
};

export default function DrawDatePicker({
  product,
  value,
  onChange,
  accentColor = '#007AFF',
}: DrawDatePickerProps) {
  const [visible, setVisible] = useState(false);
  const dates = useMemo(() => getRecentDrawDates(product, 15), [product]);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setVisible(true)}
        style={styles.trigger}
      >
        <Text style={styles.icon}>📅</Text>
        <Text style={styles.triggerText}>{value ? formatDrawDate(value) : 'Mới nhất'}</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />
        <View style={styles.sheet}>
          <ScrollView>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                onChange('');
                setVisible(false);
              }}
              style={styles.item}
            >
              <Text style={[styles.itemText, !value ? { color: accentColor, fontWeight: '700' } : null]}>
                Mới nhất
              </Text>
            </TouchableOpacity>
            {dates.map((date) => (
              <TouchableOpacity
                key={date}
                activeOpacity={0.8}
                onPress={() => {
                  onChange(date);
                  setVisible(false);
                }}
                style={styles.item}
              >
                <Text
                  style={[
                    styles.itemText,
                    value === date ? { color: accentColor, fontWeight: '700' } : null,
                  ]}
                >
                  {formatDrawDate(date)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    height: 36,
    backgroundColor: '#F2F2F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 14,
  },
  triggerText: {
    fontSize: 14,
    color: '#303233',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  sheet: {
    maxHeight: '55%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F6',
  },
  itemText: {
    fontSize: 15,
    color: '#303233',
  },
});
