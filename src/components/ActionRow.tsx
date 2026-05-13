import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

type Props = { onCheck: () => void; accentColor: string; isLoading?: boolean };

export default function ActionRow({ onCheck, accentColor, isLoading }: Props) {
  return (
    <View style={{ marginTop: 12, marginBottom: 10 }}>
      <TouchableOpacity onPress={onCheck} disabled={!!isLoading} style={{ height: 44, borderRadius: 10, backgroundColor: accentColor, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
        {isLoading ? <ActivityIndicator color="#fff" /> : null}
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{isLoading ? 'Đang dò...' : 'Dò ngay'}</Text>
      </TouchableOpacity>
    </View>
  );
}
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

type Props = { onCheck: () => void; accentColor: string; isLoading?: boolean };

export default function ActionRow({ onCheck, accentColor, isLoading }: Props) {
  return (
    <View style={{ marginTop: 12, marginBottom: 10 }}>
      <TouchableOpacity onPress={onCheck} disabled={!!isLoading} style={{ height: 44, borderRadius: 10, backgroundColor: accentColor, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
        {isLoading ? <ActivityIndicator color="#fff" /> : null}
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{isLoading ? 'Đang dò...' : 'Dò ngay'}</Text>
      </TouchableOpacity>
    </View>
  );
}
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onCheck: () => void;
  accentColor: string;
  isLoading?: boolean;
};

export default function ActionRow({ onCheck, accentColor, isLoading }: Props) {
  return (
    <View style={{ marginTop: 12, marginBottom: 10 }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onCheck}
        disabled={!!isLoading}
        style={{
          height: 44,
          borderRadius: 10,
          backgroundColor: accentColor,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
        }}
      >
        {isLoading ? <ActivityIndicator color="#fff" /> : null}
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
          {isLoading ? 'Đang dò...' : 'Dò ngay'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
