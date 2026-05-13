import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { getSavedTickets, type SavedTicket } from '../services/storageService';

type Props = { channel: 'vietlott' | 'xskt'; refreshKey?: number };

export default function SavedList({ channel, refreshKey = 0 }: Props) {
  const [items, setItems] = useState<SavedTicket[]>([]);
  useEffect(() => {
    getSavedTickets().then((all) => setItems(all.filter((x) => x.channel === channel)));
  }, [channel, refreshKey]);
  return (
    <View style={{ gap: 8 }}>
      {items.length === 0 ? <Text style={{ color: '#8A8F98' }}>Chưa có vé đã lưu.</Text> : items.map((it, idx) => (
        <View key={`${it.label}-${idx}`} style={{ backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#E8EAF0', padding: 12 }}>
          <Text style={{ fontWeight: '700', color: '#303233' }}>{it.label}</Text>
          <Text style={{ color: '#8A8F98', fontSize: 12 }}>{it.createdAt || ''}</Text>
        </View>
      ))}
    </View>
  );
}
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { getSavedTickets, type SavedTicket } from '../services/storageService';

type Props = { channel: 'vietlott' | 'xskt'; refreshKey?: number };

export default function SavedList({ channel, refreshKey = 0 }: Props) {
  const [items, setItems] = useState<SavedTicket[]>([]);
  useEffect(() => {
    getSavedTickets().then((all) => setItems(all.filter((x) => x.channel === channel)));
  }, [channel, refreshKey]);

  return (
    <View style={{ gap: 8 }}>
      {items.length === 0 ? <Text style={{ color: '#8A8F98' }}>Chưa có vé đã lưu.</Text> : items.map((it, idx) => (
        <View key={`${it.label}-${idx}`} style={{ backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#E8EAF0', padding: 12 }}>
          <Text style={{ fontWeight: '700', color: '#303233' }}>{it.label}</Text>
          <Text style={{ color: '#8A8F98', fontSize: 12 }}>{it.createdAt || ''}</Text>
        </View>
      ))}
    </View>
  );
}
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { getSavedTickets, type SavedTicket } from '../services/storageService';

type Props = { channel: 'vietlott' | 'xskt'; refreshKey?: number };

export default function SavedList({ channel, refreshKey = 0 }: Props) {
  const [items, setItems] = useState<SavedTicket[]>([]);

  useEffect(() => {
    getSavedTickets().then((all) => setItems(all.filter((x) => x.channel === channel)));
  }, [channel, refreshKey]);

  return (
    <View style={{ gap: 8 }}>
      {items.length === 0 ? (
        <Text style={{ color: '#8A8F98' }}>Chưa có vé đã lưu.</Text>
      ) : (
        items.map((it, idx) => (
          <View key={`${it.label}-${idx}`} style={{ backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#E8EAF0', padding: 12 }}>
            <Text style={{ fontWeight: '700', color: '#303233' }}>{it.label}</Text>
            <Text style={{ color: '#8A8F98', fontSize: 12 }}>{it.createdAt || ''}</Text>
          </View>
        ))
      )}
    </View>
  );
}
import { useTheme } from '@shopify/restyle';
import { useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { deleteTicket, getSavedTickets, type SavedTicket } from '../services/storageService';
import type { Theme } from '../theme';
import { formatCurrency, formatDate } from '../utils/formatters';

type SavedListProps = {
  channel: 'vietlott' | 'xskt';
  refreshKey?: number;
};

const PRODUCT_ICONS: Record<string, string> = {
  keno: '⚡',
  mega: '🎱',
  power: '⚡',
  lotto535: '🍀',
  max3d: '🎲',
  max3dpro: '🎲',
  xskt: '🎫',
};

export default function SavedList({ channel, refreshKey = 0 }: SavedListProps) {
  const theme = useTheme<Theme>();
  const [tickets, setTickets] = useState<SavedTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTickets = async () => {
    setLoading(true);
    const all = await getSavedTickets();
    setTickets(all.filter((t) => t.channel === channel));
    setLoading(false);
  };

  useEffect(() => {
    loadTickets();
  }, [channel, refreshKey]);

  const accentColor = channel === 'vietlott' ? theme.colors.accentMega : theme.colors.accentLotto535;

  if (loading) {
    return (
      <View style={{ marginTop: 32, alignItems: 'center' }}>
        <ActivityIndicator color={theme.colors.textBrand} />
      </View>
    );
  }

  if (tickets.length === 0) {
    return (
      <View style={{ marginTop: 40, alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: theme.colors.textHint, textAlign: 'center' }}>Chưa có vé nào được lưu</Text>
        <Text style={{ fontSize: 12, color: theme.colors.textDisable, marginTop: 6 }}>
          Nhấn Lưu sau khi dò số để thêm vé
        </Text>
      </View>
    );
  }

  const groupedRows = tickets.reduce<Array<{ type: 'header'; key: string; title: string } | { type: 'ticket'; key: string; ticket: SavedTicket }>>(
    (acc, ticket) => {
      const groupTitle =
        channel === 'xskt'
          ? `Ngày ${formatDate(new Date(ticket.createdAt))}`
          : `Kỳ ${ticket.drawId || 'Không rõ'}`;

      const headerKey = `header-${groupTitle}`;
      if (!acc.some((r) => r.type === 'header' && r.key === headerKey)) {
        acc.push({ type: 'header', key: headerKey, title: groupTitle });
      }
      acc.push({ type: 'ticket', key: `ticket-${ticket.id}`, ticket });
      return acc;
    },
    []
  );

  return (
    <FlatList
      data={groupedRows}
      keyExtractor={(item) => item.key}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        if (item.type === 'header') {
          return (
            <Text style={{ fontSize: 11, fontWeight: '700', color: theme.colors.textHint, marginTop: 8, marginBottom: 6 }}>
              {item.title}
            </Text>
          );
        }

        const ticket = item.ticket;
        return (
          <SwipeRow
            id={ticket.id}
            theme={theme}
            onDelete={async () => {
              await deleteTicket(ticket.id);
              await loadTickets();
            }}
          >
            <View style={[styles.card, { backgroundColor: theme.colors.bgPrimary, borderColor: theme.colors.borderDefault }]}>
              <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
              <View style={[styles.iconBox, { backgroundColor: theme.colors.bgSecondary }]}>
                <Text style={styles.icon}>{PRODUCT_ICONS[ticket.product] || '🎫'}</Text>
              </View>
              <View style={styles.info}>
                <Text style={[styles.typeLabel, { color: accentColor }]}>{ticket.label}</Text>
                <Text style={[styles.nums, { color: theme.colors.textPrimary }]}>
                  {ticket.numbers?.length
                    ? ticket.numbers.map((n) => String(n).padStart(2, '0')).join(' ')
                    : ticket.ticketNumber || (ticket.kenoTextChoice ? ticket.kenoTextChoice.toUpperCase() : '—')}
                </Text>
                <Text style={[styles.sub, { color: theme.colors.textHint }]}>
                  {ticket.frequency === 'every' ? 'Mỗi kỳ' : 'Một lần'} · {formatDate(new Date(ticket.createdAt))}
                </Text>
                {ticket.lastResult ? (
                  <Text
                    style={[
                      styles.sub,
                      { color: ticket.lastResult.matched ? theme.colors.textSuccess : theme.colors.textHint },
                    ]}
                  >
                    {ticket.lastResult.prize || 'Chưa trúng'}{' '}
                    {ticket.lastResult.amount > 0 ? `· ${formatCurrency(ticket.lastResult.amount)}` : ''}
                  </Text>
                ) : null}
              </View>
            </View>
          </SwipeRow>
        );
      }}
    />
  );
}

function SwipeRow({
  id,
  theme,
  onDelete,
  children,
}: {
  id: string;
  theme: Theme;
  onDelete: () => Promise<void> | void;
  children: ReactNode;
}) {
  const translateX = useState(() => new Animated.Value(0))[0];
  const [open, setOpen] = useState(false);
  const maxSwipe = 86;

  const close = () => {
    setOpen(false);
    Animated.timing(translateX, { toValue: 0, duration: 160, useNativeDriver: true }).start();
  };

  const openToDelete = () => {
    setOpen(true);
    Animated.timing(translateX, { toValue: -maxSwipe, duration: 160, useNativeDriver: true }).start();
  };

  const panResponder = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dy) < 10,
      onPanResponderMove: (_, g) => {
        const nextX = Math.min(0, Math.max(-maxSwipe, g.dx + (open ? -maxSwipe : 0)));
        translateX.setValue(nextX);
      },
      onPanResponderRelease: (_, g) => {
        const endX = g.dx + (open ? -maxSwipe : 0);
        if (endX < -maxSwipe * 0.45) {
          openToDelete();
        } else {
          close();
        }
      },
      onPanResponderTerminate: close,
    })
  )[0];

  return (
    <View style={{ marginBottom: 8 }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: maxSwipe,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.textError,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            Alert.alert('Xóa vé', 'Bạn có chắc muốn xóa vé này?', [
              { text: 'Hủy', style: 'cancel', onPress: close },
              {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                  await onDelete();
                },
              },
            ]);
          }}
          style={{ width: maxSwipe, height: '100%', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: theme.colors.textOnDark, fontSize: 12, fontWeight: '800' }}>Xóa</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderRadius: 2,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
  },
  info: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  nums: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sub: {
    fontSize: 10,
    marginTop: 1,
  },
});
