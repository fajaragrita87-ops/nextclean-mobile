import React from 'react';
import { Alert, Button, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { checkIn, checkOut } from '../api/attendance';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../state/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Attendance'>;

async function pickSelfie(): Promise<string> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Izin kamera diperlukan untuk ambil selfie.');
  }

  const result = await ImagePicker.launchCameraAsync({
    cameraType: ImagePicker.CameraType.front,
    allowsEditing: false,
    quality: 0.7,
  });

  if (result.canceled || !result.assets?.[0]?.uri) {
    throw new Error('Pengambilan foto dibatalkan.');
  }

  return result.assets[0].uri;
}

async function getGps(): Promise<{ latitude: number; longitude: number }> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') {
    throw new Error('Izin lokasi diperlukan untuk absensi.');
  }

  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
}

export function AttendanceScreen({ navigation }: Props) {
  const { token, user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [lastInfo, setLastInfo] = React.useState<string | null>(null);

  const doAttendance = React.useCallback(
    async (type: 'checkin' | 'checkout') => {
      if (!token) return;
      setLoading(true);
      try {
        const [photoUri, gps] = await Promise.all([pickSelfie(), getGps()]);
        const payload = {
          token,
          userId: user?.id,
          timestamp: new Date().toISOString(),
          latitude: gps.latitude,
          longitude: gps.longitude,
          photoUri,
        };

        if (type === 'checkin') {
          await checkIn(payload);
          setLastInfo(`Check-in sukses (${gps.latitude.toFixed(5)}, ${gps.longitude.toFixed(5)})`);
          Alert.alert('Sukses', 'Absen masuk berhasil.');
        } else {
          await checkOut(payload);
          setLastInfo(`Check-out sukses (${gps.latitude.toFixed(5)}, ${gps.longitude.toFixed(5)})`);
          Alert.alert('Sukses', 'Absen pulang berhasil.');
        }
      } catch (e: any) {
        Alert.alert('Gagal', String(e?.message ?? e));
      } finally {
        setLoading(false);
      }
    },
    [token, user?.id]
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Absensi</Text>

      <Button
        title={loading ? 'Memproses...' : 'Absen Masuk'}
        onPress={() => doAttendance('checkin')}
        disabled={loading}
      />
      <View style={{ height: 12 }} />
      <Button
        title={loading ? 'Memproses...' : 'Absen Pulang'}
        onPress={() => doAttendance('checkout')}
        disabled={loading}
      />

      <View style={{ height: 24 }} />
      <Button title="Riwayat Absensi" onPress={() => navigation.navigate('AttendanceHistory')} />
      <View style={{ height: 12 }} />
      <Button title="Pekerjaan Laundry" onPress={() => navigation.navigate('TaskList')} />

      <View style={{ height: 24 }} />
      {lastInfo ? <Text style={{ color: '#333' }}>{lastInfo}</Text> : null}
      <View style={{ height: 8 }} />
      <Text style={{ color: '#666' }}>
        Catatan: Foto + lokasi diambil saat tombol ditekan, lalu dikirim ke server.
      </Text>
    </View>
  );
}

