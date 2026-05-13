import React, { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_BASE, formatVietlottKyRowDateVi } from '../services/lotteryApi';

type KyItem = { kyso: string; date?: string; drawDay?: string };
type Props = { product: string; value: string; onChange: (kyso: string) => void; accentColor?: string };

export default function KySoPicker({ product, value, onChange, accentColor = '#2D7FF9' }: Props) {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [kyList, setKyList] = useState<KyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setKyList([]);
    setLoading(true);
    setSearchText('');
    setError('');
  }, [product]);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/vietlott/${product}/list`)
      .then((r) => r.json())
      .then((data) => {
        console.log('[KySoPicker] product:', product, 'list length:', data.data?.length, 'first item:', data.data?.[0]);
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setKyList(data.data);
          setError('');
        } else {
          setKyList([]);
          setError('Không tải được danh sách kỳ');
        }
      })
      .catch(() => {
        setKyList([]);
        setError('Lỗi kết nối server');
      })
      .finally(() => setLoading(false));
  }, [product, reloadKey]);

  const filtered = useMemo(() => {
    const q = searchText.trim();
    if (!q) return kyList;
    return kyList.filter((item) => item.kyso?.includes(q));
  }, [kyList, searchText]);
  const hasMatchedValue = Boolean(value && kyList.some((item) => item.kyso === value));
  const displayValue = hasMatchedValue ? `Kỳ #${value}` : 'Mới nhất';

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={{
          height: 40,
          backgroundColor: '#F2F2F6',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#EBEBEB',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          gap: 8,
        }}
      >
        <Text>📋</Text>
        <Text style={{ flex: 1, color: '#303233' }}>{displayValue}</Text>
        <Text style={{ color: '#8E8E93' }}>›</Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <View
            style={{
              height: 56,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottomWidth: 1,
              borderBottomColor: '#EFEFF4',
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>Chọn kỳ quay</Text>
            <TouchableOpacity onPress={() => setOpen(false)} style={{ padding: 4 }}>
              <Text style={{ fontSize: 18, color: '#111827' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={{ padding: 16, gap: 10 }}>
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Tìm kỳ số..."
              keyboardType="numeric"
              style={{
                height: 40,
                backgroundColor: '#F2F2F6',
                borderRadius: 8,
                paddingHorizontal: 12,
                color: '#111827',
              }}
            />

            <TouchableOpacity
              onPress={() => {
                onChange('');
                setOpen(false);
              }}
              style={{ paddingVertical: 10 }}
            >
              <Text style={{ fontSize: 15, fontWeight: !hasMatchedValue ? '700' : '500', color: !hasMatchedValue ? accentColor : '#111827' }}>
                Mới nhất
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={{ padding: 16 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <View
                  key={i}
                  style={{
                    height: 48,
                    backgroundColor: '#F2F2F6',
                    borderRadius: 8,
                    marginBottom: 8,
                    opacity: 1 - i * 0.15,
                  }}
                />
              ))}
            </View>
          ) : error ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#FF3B30', fontSize: 14 }}>{error}</Text>
              <TouchableOpacity
                onPress={() => {
                  setLoading(true);
                  setError('');
                  setReloadKey((k) => k + 1);
                }}
                style={{ marginTop: 12, padding: 10 }}
              >
                <Text style={{ color: accentColor, fontWeight: '700' }}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
              {filtered.map((item) => (
                <TouchableOpacity
                  key={`${item.kyso}-${item.date || ''}`}
                  onPress={() => {
                    onChange(item.kyso);
                    setOpen(false);
                  }}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F3F4F6',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: value === item.kyso ? '700' : '500', color: value === item.kyso ? accentColor : '#111827' }}>
                      Kỳ #{item.kyso}
                    </Text>
                    {item.date || item.drawDay ? (
                      <Text style={{ marginTop: 2, fontSize: 12, color: '#8E8E93' }}>
                        {[item.date ? formatVietlottKyRowDateVi(item.date) : null, item.drawDay].filter(Boolean).join(' • ')}
                      </Text>
                    ) : null}
                  </View>
                  {value === item.kyso ? <Text style={{ color: accentColor, fontWeight: '700' }}>✓</Text> : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>
    </>
  );
}
