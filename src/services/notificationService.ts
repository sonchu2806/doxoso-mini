export async function requestNotificationPermission(): Promise<boolean> {
  return false;
}

export async function sendWinNotification(_prize: string, _amount: number): Promise<void> {}
export async function requestNotificationPermission(): Promise<boolean> {
  return false;
}

export async function sendWinNotification(_prize: string, _amount: number): Promise<void> {}
export async function requestNotificationPermission(): Promise<boolean> {
  return false;
}

export async function sendWinNotification(_prize: string, _amount: number): Promise<void> {
  return;
}
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleResultNotification(params: {
  title: string;
  body: string;
  data?: any;
  delaySeconds?: number;
}): Promise<void> {
  if (Platform.OS === 'web') return;
  const granted = await requestNotificationPermission();
  if (!granted) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: params.title,
      body: params.body,
      data: params.data || {},
      sound: true,
    },
    trigger: params.delaySeconds ? ({ seconds: params.delaySeconds } as any) : null,
  });
}

export async function sendWinNotification(prize: string, amount: number): Promise<void> {
  await scheduleResultNotification({
    title: '🎉 Chúc mừng! Bạn đã trúng thưởng!',
    body: `${prize}${amount > 0 ? ` — ${amount.toLocaleString('vi-VN')}đ` : ''}`,
    data: { type: 'win' },
  });
}

export async function sendResultNotification(hasWin: boolean, ticketCount: number): Promise<void> {
  if (hasWin) {
    await scheduleResultNotification({
      title: '🎯 Có vé trúng thưởng!',
      body: `${ticketCount} vé đã được dò — Mở app để xem chi tiết`,
      data: { type: 'result' },
    });
  } else {
    await scheduleResultNotification({
      title: 'Kết quả dò số',
      body: `${ticketCount} vé đã được dò — Chưa trúng lần này`,
      data: { type: 'result' },
    });
  }
}
