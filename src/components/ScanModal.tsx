import { useTheme } from '@shopify/restyle';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import type { Theme } from '../theme';
import { type ParsedTicket, parseVietlottQR, processImageWithOCR } from '../utils/ocrParser';
import ScanResultSheet from './ScanResultSheet';

const C = {
  o15: 'rgba(255,255,255,0.15)',
  o35: 'rgba(255,255,255,0.35)',
  o50: 'rgba(255,255,255,0.50)',
  o65: 'rgba(255,255,255,0.65)',
  o20: 'rgba(255,255,255,0.20)',
};

type ScanModalProps = {
  visible: boolean;
  onClose: () => void;
  onResult: (ticket: ParsedTicket) => void;
  onManualEntry: () => void;
  channel: 'vietlott' | 'xskt';
};

export default function ScanModal({ visible, onClose, onResult, onManualEntry, channel }: ScanModalProps) {
  const theme = useTheme<Theme>();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanned, setIsScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [pendingTicket, setPendingTicket] = useState<ParsedTicket | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const scanY = useRef(new Animated.Value(0)).current;

  const accentColor = channel === 'xskt' ? theme.colors.accentLotto535 : theme.colors.accentKeno;
  const accentSoft = (theme.colors as any).accentLotto535Soft ?? 'rgba(245,200,64,0.25)';
  const hasPermission = permission?.granted ?? false;

  const scanAnimation = useMemo(
    () =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanY, {
            toValue: 120,
            duration: 1800,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(scanY, {
            toValue: 0,
            duration: 1800,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ),
    [scanY]
  );

  useEffect(() => {
    if (visible) {
      setIsScanned(false);
      setOcrLoading(false);
      setPendingTicket(null);
      setSheetOpen(false);
      scanY.setValue(0);
      scanAnimation.start();
    } else {
      scanAnimation.stop();
    }
    return () => {
      scanAnimation.stop();
    };
  }, [visible, scanAnimation, scanY]);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (isScanned) return;
    setIsScanned(true);

    const parsed = parseVietlottQR(data);
    if (parsed.type === 'unknown') {
      Alert.alert('Không nhận ra mã QR này');
      setTimeout(() => setIsScanned(false), 1200);
      return;
    }
    setPendingTicket(parsed);
    setSheetOpen(true);
    setIsScanned(false);
  };

  const runOcrOnUri = async (uri: string) => {
    setOcrLoading(true);
    setOcrProgress(0);
    try {
      const parsed = await processImageWithOCR(uri, channel, (p) => setOcrProgress(p));
      if (parsed.type === 'unknown') {
        Alert.alert('Không đọc được', 'Không đọc được, vui lòng nhập thủ công');
        return;
      }
      setPendingTicket(parsed);
      setSheetOpen(true);
    } catch {
      Alert.alert('Không đọc được', 'Không đọc được, vui lòng nhập thủ công');
    } finally {
      setOcrLoading(false);
      setOcrProgress(0);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép truy cập thư viện ảnh trong Settings.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      await runOcrOnUri(result.assets[0].uri);
    }
  };

  const confirmSheet = () => {
    if (pendingTicket && pendingTicket.type !== 'unknown') {
      onResult(pendingTicket);
    }
    setSheetOpen(false);
    setPendingTicket(null);
    onClose();
  };

  const cancelSheet = () => {
    setSheetOpen(false);
    setPendingTicket(null);
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
        <View style={{ flex: 1, backgroundColor: theme.colors.overlayDark95 }}>
          <View style={{ paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.overlayWhite10,
              }}
            >
              <Text style={{ color: theme.colors.textOnDark, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>

            <Text style={{ flex: 1, textAlign: 'center', color: theme.colors.textOnDark, fontSize: 17, fontWeight: '800' }}>
              Scan vé số
            </Text>
            <View style={{ width: 36, height: 36 }} />
          </View>

          {!permission ? (
            <View style={{ minHeight: 260, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: theme.colors.textOnDark }}>Đang kiểm tra quyền camera...</Text>
            </View>
          ) : !hasPermission ? (
            <View style={{ minHeight: 260, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
              <Text style={{ color: theme.colors.textOnDark, textAlign: 'center', marginBottom: 12 }}>
                Ứng dụng cần quyền Camera để quét vé số.
              </Text>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={requestPermission}
                style={{
                  height: 44,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: accentColor,
                }}
              >
                <Text style={{ color: theme.colors.textOnDark, fontWeight: '700' }}>Cho phép dùng Camera</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ height: 320 }}>
              <CameraView
                style={{ flex: 1, width: '100%' }}
                enableTorch={flashOn}
                onBarcodeScanned={handleBarcodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ['qr', 'code128', 'code39'] as any,
                }}
              />

              <View style={{ position: 'absolute', inset: 0, pointerEvents: 'none', alignItems: 'center', justifyContent: 'center' }}>
                <View
                  style={{
                    width: 260,
                    height: 180,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: C.o15,
                    position: 'relative',
                  }}
                >
                  <View style={{ position: 'absolute', top: -1, left: -1, width: 22, height: 22, borderTopWidth: 3, borderLeftWidth: 3, borderRadius: 4, borderColor: accentColor }} />
                  <View style={{ position: 'absolute', top: -1, right: -1, width: 22, height: 22, borderTopWidth: 3, borderRightWidth: 3, borderRadius: 4, borderColor: accentColor }} />
                  <View style={{ position: 'absolute', bottom: -1, left: -1, width: 22, height: 22, borderBottomWidth: 3, borderLeftWidth: 3, borderRadius: 4, borderColor: accentColor }} />
                  <View style={{ position: 'absolute', bottom: -1, right: -1, width: 22, height: 22, borderBottomWidth: 3, borderRightWidth: 3, borderRadius: 4, borderColor: accentColor }} />

                  <Animated.View
                    style={{
                      position: 'absolute',
                      left: 4,
                      right: 4,
                      top: '20%',
                      height: 1.5,
                      backgroundColor: accentColor,
                      transform: [{ translateY: scanY }],
                    }}
                  />
                </View>
              </View>
            </View>
          )}

          <View style={{ marginTop: 20, alignItems: 'center', paddingHorizontal: 24 }}>
            <Text style={{ fontSize: 13, color: C.o65, textAlign: 'center' }}>Hướng camera vào QR hoặc chụp vé rõ nét</Text>
            <Text style={{ fontSize: 11, color: C.o35, textAlign: 'center', marginTop: 4 }}>
              Ảnh thư viện: đọc OCR (web ổn định; native có thể chậm){Platform.OS === 'web' ? '' : ''}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 20 }}>
            <TouchableOpacity activeOpacity={0.85} onPress={() => setFlashOn((v) => !v)} style={{ alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  borderWidth: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: flashOn ? accentSoft : theme.colors.overlayWhite10,
                  borderColor: flashOn ? theme.colors.accentLotto535 : C.o20,
                }}
              >
                <Text style={{ fontSize: 20, color: flashOn ? theme.colors.accentLotto535 : theme.colors.textOnDark }}>⚡</Text>
              </View>
              <Text style={{ fontSize: 11, color: C.o50 }}>Flash</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.85} onPress={handlePickImage} style={{ alignItems: 'center', gap: 6 }} disabled={ocrLoading}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  borderWidth: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.colors.overlayWhite10,
                  borderColor: C.o20,
                  opacity: ocrLoading ? 0.5 : 1,
                }}
              >
                <Text style={{ fontSize: 20, color: theme.colors.textOnDark }}>🖼️</Text>
              </View>
              <Text style={{ fontSize: 11, color: C.o50 }}>Thư viện</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              onClose();
              onManualEntry();
            }}
            style={{
              marginTop: 24,
              width: 268,
              height: 44,
              borderRadius: 10,
              alignSelf: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: accentColor,
            }}
          >
            <Text style={{ color: theme.colors.textOnDark, fontSize: 14, fontWeight: '800' }}>Nhập bằng tay</Text>
          </TouchableOpacity>

          {ocrLoading ? (
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.7)',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 32,
              }}
            >
              <ActivityIndicator size="large" color="#fff" />
              <Text style={{ marginTop: 16, color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>Đang đọc số vé…</Text>
              <Text style={{ marginTop: 8, color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center' }}>
                Có thể mất 5–10 giây
              </Text>
              {ocrProgress > 0 && ocrProgress < 1 ? (
                <Text style={{ marginTop: 6, color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{Math.round(ocrProgress * 100)}%</Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </Modal>

      <ScanResultSheet visible={sheetOpen && !!pendingTicket} ticket={pendingTicket} onConfirm={confirmSheet} onCancel={cancelSheet} />
    </>
  );
}
