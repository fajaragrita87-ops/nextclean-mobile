import React from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { checkIn, checkOut } from '../api/attendance';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../state/AuthContext';
import { AppScaffold } from '../components/AppScaffold';

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
    <AppScaffold
      navigation={navigation}
      activeRoute="Attendance"
      title="Absensi"
      subtitle="Selfie + GPS untuk check-in & check-out"
      rightTop={
        loading ? (
          <View style={styles.loadingChip}>
            <ActivityIndicator />
          </View>
        ) : null
      }
    >
      <View style={styles.wrap}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ambil foto & lokasi</Text>
          <Text style={styles.cardSub}>
            Sistem akan meminta izin kamera dan lokasi, lalu mengirim data absensi ke server.
          </Text>

          <View style={{ height: 12 }} />

          <Pressable
            onPress={() => doAttendance('checkin')}
            disabled={loading}
            style={({ pressed }) => [
              styles.primaryBtn,
              loading ? styles.btnDisabled : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <View style={styles.btnLeft}>
              <View style={styles.btnIcon}>
                <Ionicons name="log-in-outline" size={18} color="#fff" />
              </View>
              <View style={{ gap: 2 }}>
                <Text style={styles.btnTitle}>Absen Masuk</Text>
                <Text style={styles.btnSub}>Check-in sekarang</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </Pressable>

          <View style={{ height: 10 }} />

          <Pressable
            onPress={() => doAttendance('checkout')}
            disabled={loading}
            style={({ pressed }) => [
              styles.secondaryBtn,
              loading ? styles.btnDisabled : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <View style={styles.btnLeft}>
              <View style={[styles.btnIcon, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="log-out-outline" size={18} color={colors.primary} />
              </View>
              <View style={{ gap: 2 }}>
                <Text style={styles.btnTitleDark}>Absen Pulang</Text>
                <Text style={styles.btnSubDark}>Check-out sekarang</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        </View>

        {lastInfo ? (
          <View style={styles.info}>
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.infoText}>{lastInfo}</Text>
          </View>
        ) : (
          <View style={styles.tip}>
            <Ionicons name="information-circle-outline" size={18} color={colors.textMuted} />
            <Text style={styles.tipText}>
              Tips: Arahkan kamera ke wajah, pastikan lokasi akurat, lalu tekan tombol.
            </Text>
          </View>
        )}
      </View>
    </AppScaffold>
  );
}

const colors = {
  primary: '#5B67F1',
  primarySoft: '#EEF0FF',
  text: '#0E1222',
  textMuted: '#6C7286',
  border: '#E7E9F3',
  surface: '#FFFFFF',
};

const styles = StyleSheet.create({
  pressed: { opacity: 0.88 },
  wrap: {
    flex: 1,
    gap: 12,
  },
  loadingChip: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
  },
  cardSub: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    lineHeight: 16,
  },
  primaryBtn: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  secondaryBtn: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btnIcon: {
    width: 36,
    height: 36,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
  },
  btnSub: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.82)',
  },
  btnTitleDark: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.text,
  },
  btnSubDark: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  info: {
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#DDE0FF',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  tip: {
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    lineHeight: 16,
  },
});
