import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getTransactions, updateTransactionStatus } from '../api/transactions';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { LAUNDRY_STATUSES } from '../types';
import type { LaundryTask, LaundryStatus } from '../types';
import { useAuth } from '../state/AuthContext';
import { AppScaffold } from '../components/AppScaffold';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

export function TaskDetailScreen({ route, navigation }: Props) {
  const { token } = useAuth();
  const { taskId } = route.params;
  const [task, setTask] = React.useState<LaundryTask | null>(null);
  const [status, setStatus] = React.useState<LaundryStatus | string>('');
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const list = await getTransactions(token);
      const found = list.find((t) => String(t.id) === String(taskId)) ?? null;
      setTask(found);
      setStatus(found?.status ?? '');
    } catch (e: any) {
      Alert.alert('Gagal ambil data', String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }, [token, taskId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const onUpdate = React.useCallback(async () => {
    if (!token) return;
    if (!status) {
      Alert.alert('Pilih status', 'Status wajib dipilih.');
      return;
    }
    setLoading(true);
    try {
      await updateTransactionStatus({ token, transactionId: taskId, status });
      Alert.alert('Sukses', 'Status berhasil diupdate.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Gagal update', String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }, [navigation, status, taskId, token]);

  return (
    <AppScaffold
      navigation={navigation}
      activeRoute="TaskList"
      title="Detail Pekerjaan"
      subtitle={task?.code ?? `#${taskId}`}
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
      <ScrollView contentContainerStyle={{ paddingBottom: 18 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => navigation.goBack()} style={({ pressed }) => [styles.back, pressed ? styles.pressed : null]}>
          <Ionicons name="arrow-back" size={18} color={colors.text} />
          <Text style={styles.backText}>Kembali</Text>
        </Pressable>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.icon}>
              <Ionicons name="shirt-outline" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>
                {task?.code ?? `#${taskId}`}
              </Text>
              <Text style={styles.sub} numberOfLines={1}>
                {task?.customerName ?? 'Customer'}
              </Text>
            </View>
            <View style={[styles.badge, badgeStyle(task?.status ?? '')]}>
              <Text style={[styles.badgeText, badgeTextStyle(task?.status ?? '')]}>{task?.status ?? '-'}</Text>
            </View>
          </View>

          <View style={{ height: 10 }} />
          <View style={styles.metaRow}>
            <Ionicons name="barcode-outline" size={16} color={colors.textMuted} />
            <Text style={styles.metaText}>ID: {taskId}</Text>
          </View>
          {task?.updatedAt ? (
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
              <Text style={styles.metaText}>Update: {task.updatedAt}</Text>
            </View>
          ) : null}

          {loading && !task ? (
            <View style={styles.loadingInline}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>Memuat detail...</Text>
            </View>
          ) : null}
        </View>

        <View style={{ height: 14 }} />

        <Text style={styles.sectionTitle}>Update Status</Text>
        <Text style={styles.sectionSub}>Pilih status terbaru untuk pekerjaan ini.</Text>

        <View style={styles.chips}>
          {LAUNDRY_STATUSES.map((s) => {
            const selected = status === s;
            return (
              <Pressable
                key={s}
                onPress={() => setStatus(s)}
                style={({ pressed }) => [
                  styles.chip,
                  selected ? styles.chipActive : null,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Text style={[styles.chipText, selected ? styles.chipTextActive : null]}>{s}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 12 }} />

        <Pressable
          onPress={onUpdate}
          disabled={loading}
          style={({ pressed }) => [styles.save, loading ? styles.disabled : null, pressed ? styles.pressed : null]}
        >
          <Text style={styles.saveText}>{loading ? 'Mengirim...' : 'Simpan'}</Text>
          <Ionicons name="checkmark" size={18} color="#fff" />
        </Pressable>
      </ScrollView>
    </AppScaffold>
  );
}

function badgeStyle(status: string) {
  if (status === 'Selesai' || status === 'Diambil') return { backgroundColor: '#E9FBF0', borderColor: '#BEEFD0' };
  if (status === 'Dicuci') return { backgroundColor: '#EFF8FF', borderColor: '#CFEAFC' };
  if (status === 'Disetrika') return { backgroundColor: '#FFF4E5', borderColor: '#F6D6A8' };
  return { backgroundColor: '#EEF0FF', borderColor: '#DDE0FF' };
}

function badgeTextStyle(status: string) {
  if (status === 'Selesai' || status === 'Diambil') return { color: '#15803D' };
  if (status === 'Dicuci') return { color: '#0369A1' };
  if (status === 'Disetrika') return { color: '#B45309' };
  return { color: colors.primary };
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
  back: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  card: {
    marginTop: 12,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#DDE0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.text,
  },
  sub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.2,
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
  loadingInline: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
  },
  sectionSub: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  chips: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: '#DDE0FF',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.primary,
  },
  save: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  saveText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
  },
  disabled: {
    opacity: 0.65,
  },
});
