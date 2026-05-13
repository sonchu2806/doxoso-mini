import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import type { ParsedTicket } from '../utils/ocrParser';

type Props = {
  visible: boolean;
  ticket: ParsedTicket | null;
  onConfirm: () => void;
  onCancel: () => void;
};

function describeTicket(t: ParsedTicket): string {
  if (t.type === 'xskt') {
    return `XSKT · Vé ${t.ticketNumber}${t.dai ? ` · ${t.dai}` : ''}`;
  }
  if (t.type === 'vietlott_qr') {
    const nums = (t.numbers || []).join(', ');
    return `Vietlott · ${t.product}${nums ? ` · ${nums}` : ''}`;
  }
  return 'Không xác định';
}

export default function ScanResultSheet({ visible, ticket, onConfirm, onCancel }: Props) {
  if (!ticket || ticket.type === 'unknown') return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }} onPress={onCancel}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 20,
            paddingBottom: 28,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#303233', marginBottom: 8 }}>Kết quả đọc vé</Text>
          <Text style={{ fontSize: 14, color: '#5D6470', lineHeight: 20, marginBottom: 20 }}>{describeTicket(ticket)}</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={onCancel}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontWeight: '700', color: '#6B7280' }}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={{ flex: 1, height: 48, borderRadius: 12, backgroundColor: '#EB2F98', alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontWeight: '800', color: '#fff' }}>Dùng kết quả này</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
