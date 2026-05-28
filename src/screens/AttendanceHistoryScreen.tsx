import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getAttendanceHistory } from '../api/attendance';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { AttendanceRecord } from '../types';
import { useAuth } from '../state/AuthContext';
import { AppScaffold } from '../components/AppScaffold';

type Props = NativeStackScreenProps<RootStackParamList, 'AttendanceHistory'>;

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function AttendanceHistoryScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [items, setItems] = React.useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getAttendanceHistory(token);
      setItems(res);
    } catch (e: any) {
      Alert.alert('Gagal ambil data', String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load])
  );

  return (
    <AppScaffold
      navigation={navigation}
      activeRoute="AttendanceHistory"
      title="Riwayat Absensi"
      subtitle="Daftar check-in & check-out"
      rightTop={
        loading ? (
          <View style={styles.loadingChip}>
            <ActivityIndicator />
          </View>
        ) : (
          <Pressable onPress={load} style={({ pressed }) => [styles.refresh, pressed ? styles.pressed : null]}>
            <Ionicons name="refresh" size={18} color={colors.primary} />
          </Pressable>
        )
      }
    >
      <FlatList
        data={items}
        keyExtractor={(item, idx) => String(item.id ?? idx)}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.typePill}>
                <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
              </View>
              <Text style={styles.timeText}>{formatDate(item.timestamp)}</Text>
            </View>

            {item.latitude !== undefined && item.longitude !== undefined ? (
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={16} color={colors.textMuted} />
                <Text style={styles.metaText}>
                  {Number(item.latitude).toFixed(5)}, {Number(item.longitude).toFixed(5)}
                </Text>
              </View>
            ) : null}

            {item.photoUrl ? (
              <Image
                source={{ uri: item.photoUrl }}
                style={styles.photo}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.noPhoto}>
                <Ionicons name="image-outline" size={18} color={colors.textMuted} />
                <Text style={styles.noPhotoText}>Tidak ada foto</Text>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="time-outline" size={18} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Belum ada data</Text>
              <Text style={styles.emptySub}>Lakukan absensi untuk melihat riwayat.</Text>
            </View>
          ) : null
        }
        contentContainerStyle={items.length ? undefined : { flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      />
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
  pressed: { opacity: 0.85 },
  refresh: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#DDE0FF',
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: 12,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#DDE0FF',
  },
  typeText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.2,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  photo: {
    height: 190,
    borderRadius: 18,
    backgroundColor: '#F0F1F6',
  },
  noPhoto: {
    height: 190,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FAFBFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  noPhotoText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  empty: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.text,
  },
  emptySub: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
