import { Text, TextInput, View } from 'react-native';

type Props = {
  onCheck: (num: string, dai: string, date: string) => void;
  onValueChange: (num: string, dai: string, date: string) => void;
  onSave?: (num: string, dai: string, date: string) => void;
  showActionRow?: boolean;
};

export default function XSKTInput({ onValueChange }: Props) {
  const selectedDai = 'TP. Hồ Chí Minh';
  const drawDate = new Date().toLocaleDateString('vi-VN');
  return (
    <View style={{ gap: 8 }}>
      <TextInput
        placeholder="Nhập 6 số vé"
        keyboardType="number-pad"
        onChangeText={(t) => onValueChange(t.replace(/\D/g, '').slice(0, 6), selectedDai, drawDate)}
        style={{ height: 40, borderRadius: 8, borderWidth: 1, borderColor: '#EBEBEB', backgroundColor: '#fff', paddingHorizontal: 12 }}
      />
      <Text style={{ color: '#8A8F98', fontSize: 12 }}>Đài: {selectedDai} · Ngày: {drawDate}</Text>
    </View>
  );
}
import { Text, TextInput, View } from 'react-native';

type Props = {
  onCheck: (num: string, dai: string, date: string) => void;
  onValueChange: (num: string, dai: string, date: string) => void;
  onSave?: (num: string, dai: string, date: string) => void;
  showActionRow?: boolean;
};

export default function XSKTInput({ onValueChange }: Props) {
  const selectedDai = 'TP. Hồ Chí Minh';
  const drawDate = new Date().toLocaleDateString('vi-VN');
  return (
    <View style={{ gap: 8 }}>
      <TextInput
        placeholder="Nhập 6 số vé"
        keyboardType="number-pad"
        onChangeText={(t) => onValueChange(t.replace(/\D/g, '').slice(0, 6), selectedDai, drawDate)}
        style={{ height: 40, borderRadius: 8, borderWidth: 1, borderColor: '#EBEBEB', backgroundColor: '#fff', paddingHorizontal: 12 }}
      />
      <Text style={{ color: '#8A8F98', fontSize: 12 }}>Đài: {selectedDai} · Ngày: {drawDate}</Text>
    </View>
  );
}
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

type Props = {
  onCheck: (num: string, dai: string, date: string) => void;
  onValueChange: (num: string, dai: string, date: string) => void;
  onSave?: (num: string, dai: string, date: string) => void;
  showActionRow?: boolean;
};

export default function XSKTInput({ onCheck, onValueChange, onSave, showActionRow = true }: Props) {
  const today = new Date().toLocaleDateString('vi-VN');
  const ticketNum = '';
  const selectedDai = 'TP. Hồ Chí Minh';
  const drawDate = today;

  return (
    <View style={{ gap: 8 }}>
      <TextInput
        placeholder="Nhập 6 số vé"
        keyboardType="number-pad"
        onChangeText={(t) => onValueChange(t.replace(/\D/g, '').slice(0, 6), selectedDai, drawDate)}
        style={{ height: 40, borderRadius: 8, borderWidth: 1, borderColor: '#EBEBEB', backgroundColor: '#fff', paddingHorizontal: 12 }}
      />
      <Text style={{ color: '#8A8F98', fontSize: 12 }}>Đài: {selectedDai} · Ngày: {drawDate}</Text>
      {showActionRow ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => onCheck(ticketNum, selectedDai, drawDate)} style={{ flex: 1, height: 40, borderRadius: 8, backgroundColor: '#2D7FF9', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Dò số</Text>
          </TouchableOpacity>
          {onSave ? (
            <TouchableOpacity onPress={() => onSave(ticketNum, selectedDai, drawDate)} style={{ flex: 1, height: 40, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
              <Text>Lưu</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
import { useTheme } from '@shopify/restyle';
import { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Theme } from '../theme';

type XSKTInputProps = {
  onCheck: (ticketNum: string, dai: string, date: string) => void;
  onSave?: (ticketNum: string, dai: string, date: string) => void;
  onValueChange?: (ticketNum: string, dai: string, date: string) => void;
  showActionRow?: boolean;
};

const STATIONS = {
  'Miền Nam': [
    'TP. Hồ Chí Minh',
    'Đồng Nai',
    'Bình Dương',
    'Vũng Tàu',
    'Long An',
    'Tiền Giang',
    'Bến Tre',
    'Đồng Tháp',
    'An Giang',
    'Kiên Giang',
    'Cần Thơ',
    'Hậu Giang',
  ],
  'Miền Trung': [
    'Đà Nẵng',
    'Khánh Hòa',
    'Huế',
    'Quảng Nam',
    'Bình Định',
    'Phú Yên',
    'Ninh Thuận',
    'Gia Lai',
    'Đắk Lắk',
  ],
  'Miền Bắc': ['Hà Nội', 'Hải Phòng', 'Quảng Ninh', 'Bắc Ninh', 'Nam Định', 'Thái Bình'],
} as const;

export default function XSKTInput({
  onCheck,
  onSave = () => {},
  onValueChange = () => {},
  showActionRow = true,
}: XSKTInputProps) {
  const theme = useTheme<Theme>();
  const [selectedDai, setSelectedDai] = useState('TP. Hồ Chí Minh');
  const [ticketNum, setTicketNum] = useState('');
  const [isDaiModalOpen, setIsDaiModalOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawDate, setDrawDate] = useState(new Date().toLocaleDateString('vi-VN'));
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  const groupedStations = useMemo(() => Object.entries(STATIONS), []);
  const filteredStations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return groupedStations;

    return groupedStations
      .map(([groupName, stations]) => [
        groupName,
        stations.filter((station) => station.toLowerCase().includes(query)),
      ] as const)
      .filter(([, stations]) => stations.length > 0);
  }, [groupedStations, searchQuery]);

  const handleChangeTicket = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setTicketNum(numericValue);
    onValueChange(numericValue, selectedDai, drawDate);
  };

  const handleSelectDai = (dai: string) => {
    setSelectedDai(dai);
    onValueChange(ticketNum, dai, drawDate);
    setSearchQuery('');
    setIsDaiModalOpen(false);
  };

  const formatDate = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const allowedDates = useMemo(() => {
    const set = new Set<string>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 30; i += 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      set.add(formatDate(d));
    }
    return set;
  }, []);

  const applyDate = (value: string) => {
    if (!allowedDates.has(value)) return;
    setDrawDate(value);
    onValueChange(ticketNum, selectedDai, value);
    setIsDateModalOpen(false);
  };

  const monthBlocks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(today.getDate() - 29);

    const keys: Array<{ month: number; year: number }> = [];
    const addMonth = (month: number, year: number) => {
      if (!keys.some((k) => k.month === month && k.year === year)) keys.push({ month, year });
    };

    addMonth(start.getMonth(), start.getFullYear());
    addMonth(today.getMonth(), today.getFullYear());

    return keys.map(({ month, year }) => {
      const firstDay = new Date(year, month, 1);
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const startWeekday = (firstDay.getDay() + 6) % 7;
      const cells: Array<{ label: string; value?: string; enabled: boolean }> = [];

      for (let i = 0; i < startWeekday; i += 1) {
        cells.push({ label: '', enabled: false });
      }

      for (let day = 1; day <= daysInMonth; day += 1) {
        const d = new Date(year, month, day);
        const value = formatDate(d);
        const enabled = allowedDates.has(value);
        cells.push({ label: String(day), value, enabled });
      }

      while (cells.length % 7 !== 0) {
        cells.push({ label: '', enabled: false });
      }

      return { month, year, cells };
    });
  }, [allowedDates]);

  return (
    <View>
      <View style={styles.topRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setIsDaiModalOpen(true)}
          style={[
            styles.daiSelector,
            {
              backgroundColor: theme.colors.bgSecondary,
              borderColor: theme.colors.borderDefault,
            },
          ]}
        >
          <Text style={[styles.selectorIcon, { color: theme.colors.textHint }]}>🕘</Text>
          <Text style={[styles.selectorLabel, { color: theme.colors.textHint }]}>Đài</Text>
          <Text numberOfLines={1} style={[styles.selectorValue, { color: theme.colors.textPrimary }]}>
            {selectedDai}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            setIsDateModalOpen(true);
          }}
          style={[styles.dateChip, { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.borderDefault }]}
        >
          <Text style={[styles.selectorIcon, { color: theme.colors.textHint }]}>🗓</Text>
          <Text numberOfLines={1} style={[styles.dateInput, { color: theme.colors.textPrimary }]}>
            {drawDate}
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        value={ticketNum}
        onChangeText={handleChangeTicket}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType="numeric"
        maxLength={6}
        placeholder="_ _ _ _ _ _"
        placeholderTextColor={theme.colors.textDisable}
        style={[
          styles.ticketInput,
          {
            color: theme.colors.textPrimary,
            borderColor: isFocused ? theme.colors.borderBrand : theme.colors.textDisable,
          },
        ]}
      />

      {showActionRow && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onCheck(ticketNum, selectedDai, drawDate)}
            style={[styles.checkButton, { backgroundColor: theme.colors.bgBrand }]}
          >
            <Text style={[styles.checkButtonText, { color: theme.colors.textOnDark }]}>Dò kết quả</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onSave(ticketNum, selectedDai, drawDate)}
            style={[
              styles.saveButton,
              {
                backgroundColor: theme.colors.transparent,
                borderColor: theme.colors.borderBrand,
              },
            ]}
          >
            <Text style={[styles.saveButtonText, { color: theme.colors.textBrand }]}>Lưu</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={isDaiModalOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsDaiModalOpen(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.bgPrimary }]}>
          <View
            style={[
              styles.modalHeader,
              {
                borderBottomColor: theme.colors.borderDefault,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Chọn đài</Text>
            <TouchableOpacity activeOpacity={0.85} onPress={() => setIsDaiModalOpen(false)}>
              <Text style={[styles.modalCloseText, { color: theme.colors.textBrand }]}>Đóng</Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.searchWrap,
              {
                borderBottomColor: theme.colors.borderDefault,
              },
            ]}
          >
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Tìm đài..."
              placeholderTextColor={theme.colors.textDisable}
              style={[
                styles.searchInput,
                {
                  backgroundColor: theme.colors.bgSecondary,
                  borderColor: theme.colors.borderDefault,
                  color: theme.colors.textPrimary,
                },
              ]}
            />
          </View>

          <ScrollView>
            {filteredStations.map(([groupName, stations]) => (
              <View key={groupName}>
                <View style={[styles.groupHeader, { backgroundColor: theme.colors.bgSecondary }]}>
                  <Text style={[styles.groupHeaderText, { color: theme.colors.textHint }]}>{groupName}</Text>
                </View>

                {stations.map((station) => {
                  const isSelected = station === selectedDai;

                  return (
                    <TouchableOpacity
                      key={station}
                      activeOpacity={0.85}
                      onPress={() => handleSelectDai(station)}
                      style={[
                        styles.stationItem,
                        {
                          borderBottomColor: theme.colors.borderDefault,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.stationItemText,
                          {
                            color: isSelected ? theme.colors.textBrand : theme.colors.textPrimary,
                            fontWeight: isSelected ? '700' : '400',
                          },
                        ]}
                      >
                        {station}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
            {filteredStations.length === 0 && (
              <View style={styles.emptyWrap}>
                <Text style={[styles.emptyText, { color: theme.colors.textHint }]}>Không tìm thấy đài phù hợp</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={isDateModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsDateModalOpen(false)}
      >
        <View style={[styles.dateBackdrop, { backgroundColor: theme.colors.overlayDark95 }]}>
          <View style={[styles.dateSheet, { backgroundColor: theme.colors.bgPrimary }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary, marginBottom: 10 }]}>Chọn ngày dò</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => applyDate(formatDate(new Date()))}
                style={[styles.quickDateBtn, { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.borderDefault }]}
              >
                <Text style={{ color: theme.colors.textPrimary, fontSize: 12 }}>Hôm nay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  const d = new Date();
                  d.setDate(d.getDate() - 1);
                  applyDate(formatDate(d));
                }}
                style={[styles.quickDateBtn, { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.borderDefault }]}
              >
                <Text style={{ color: theme.colors.textPrimary, fontSize: 12 }}>Hôm qua</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 360, marginTop: 12 }} showsVerticalScrollIndicator={false}>
              {monthBlocks.map((block) => (
                <View key={`${block.month}-${block.year}`} style={{ marginBottom: 14 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 8 }}>
                    Tháng {block.month + 1}/{block.year}
                  </Text>
                  <View style={styles.weekHeader}>
                    {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((label) => (
                      <Text key={label} style={[styles.weekHeaderCell, { color: theme.colors.textHint }]}>
                        {label}
                      </Text>
                    ))}
                  </View>
                  <View style={styles.calendarGrid}>
                    {block.cells.map((cell, idx) => {
                      const isSelected = cell.value === drawDate;
                      return (
                        <TouchableOpacity
                          key={`${block.month}-${block.year}-${idx}`}
                          activeOpacity={cell.enabled ? 0.85 : 1}
                          disabled={!cell.enabled}
                          onPress={() => cell.value && applyDate(cell.value)}
                          style={[
                            styles.dayCell,
                            {
                              backgroundColor: isSelected
                                ? theme.colors.bgBrand
                                : theme.colors.bgSecondary,
                              borderColor: isSelected
                                ? theme.colors.bgBrand
                                : theme.colors.borderDefault,
                              opacity: cell.enabled ? 1 : 0.35,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              color: isSelected ? theme.colors.textOnDark : theme.colors.textPrimary,
                              fontWeight: isSelected ? '700' : '500',
                            }}
                          >
                            {cell.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setIsDateModalOpen(false)}
                style={[styles.sheetAction, { borderColor: theme.colors.borderDefault }]}
              >
                <Text style={{ color: theme.colors.textHint }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setIsDateModalOpen(false)}
                style={[styles.sheetAction, { backgroundColor: theme.colors.bgBrand, borderColor: theme.colors.bgBrand }]}
              >
                <Text style={{ color: theme.colors.textOnDark, fontWeight: '700' }}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    gap: 8,
  },
  daiSelector: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  selectorLabel: {
    fontSize: 13,
    marginRight: 6,
  },
  selectorValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  dateChip: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateInput: {
    width: 88,
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 0,
  },
  ticketInput: {
    height: 64,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  checkButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  saveButton: {
    height: 48,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchInput: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '600',
  },
  groupHeader: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  groupHeaderText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stationItem: {
    padding: 14,
    borderBottomWidth: 1,
  },
  stationItemText: {
    fontSize: 15,
  },
  emptyWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
  },
  dateBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dateSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  quickDateBtn: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetAction: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekHeaderCell: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.2857%',
    minHeight: 34,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
