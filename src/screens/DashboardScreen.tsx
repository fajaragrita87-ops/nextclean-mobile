import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../state/AuthContext';
import { USE_MOCK_API } from '../config';
import { getAttendanceHistory } from '../api/attendance';
import { getTransactions } from '../api/transactions';
import type { AttendanceRecord, LaundryTask } from '../types';
import { AppScaffold } from '../components/AppScaffold';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export function DashboardScreen({ navigation }: Props) {
  const { user, token } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [tasks, setTasks] = React.useState<LaundryTask[]>([]);
  const [attendance, setAttendance] = React.useState<AttendanceRecord[]>([]);

  const load = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [tasksRes, attRes] = await Promise.all([getTransactions(token), getAttendanceHistory(token)]);
      setTasks(tasksRes);
      setAttendance(attRes);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load])
  );

  const name = (user?.name ?? user?.email ?? 'Karyawan').trim();
  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 19 ? 'Selamat sore' : 'Selamat malam';
  const dateLabel = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  const completed = tasks.filter((t) => t.status === 'Selesai' || t.status === 'Diambil').length;
  const total = tasks.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const inProgress = tasks.filter((t) => t.status !== 'Selesai' && t.status !== 'Diambil').slice(0, 2);
  const lastAttendance = attendance[0];

  return (
    <AppScaffold
      navigation={navigation}
      activeRoute="Dashboard"
      title="Dashboard"
      subtitle={`${greeting} • ${dateLabel}${USE_MOCK_API ? ' • Mock API' : ''}`}
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
        <View style={styles.hero}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroHello}>Hello!</Text>
            <Text style={styles.heroName} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.heroMeta}>
              {lastAttendance?.type ? `Absensi terakhir: ${lastAttendance.type.toUpperCase()}` : 'Belum ada absensi hari ini'}
            </Text>
          </View>

          <View style={styles.heroRing}>
            <Text style={styles.heroRingValue}>{percent}%</Text>
            <Text style={styles.heroRingLabel}>Selesai</Text>
          </View>

          <View style={styles.progressBarWrap}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFg, { width: `${Math.min(100, Math.max(0, percent))}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {total ? `${completed} dari ${total} pekerjaan` : 'Belum ada pekerjaan'}
            </Text>
          </View>

          <Pressable
            onPress={() => navigation.navigate('TaskList')}
            style={({ pressed }) => [styles.heroCta, pressed ? styles.pressed : null]}
          >
            <Text style={styles.heroCtaText}>Lihat Pekerjaan</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>In Progress</Text>
          <Text style={styles.sectionHint}>Fokus 2 teratas</Text>
        </View>
        <View style={styles.cardsRow}>
          {inProgress.map((t) => (
            <Pressable
              key={String(t.id)}
              onPress={() => navigation.navigate('TaskDetail', { taskId: String(t.id) })}
              style={({ pressed }) => [styles.taskCard, pressed ? styles.pressed : null]}
            >
              <View style={styles.taskIcon}>
                <Ionicons name="shirt-outline" size={18} color={colors.primary} />
              </View>
              <Text style={styles.taskTitle} numberOfLines={1}>
                {t.code ?? `#${t.id}`}
              </Text>
              {t.customerName ? (
                <Text style={styles.taskSub} numberOfLines={1}>
                  {t.customerName}
                </Text>
              ) : (
                <Text style={styles.taskSub}>—</Text>
              )}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{t.status}</Text>
              </View>
            </Pressable>
          ))}
          {inProgress.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="sparkles-outline" size={18} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Semua beres</Text>
              <Text style={styles.emptySub}>Tidak ada pekerjaan yang sedang berjalan.</Text>
            </View>
          ) : null}
        </View>

        <View style={{ height: 18 }} />

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Quick Menu</Text>
          <Text style={styles.sectionHint}>Akses cepat</Text>
        </View>

        <View style={styles.quickGrid}>
          <QuickAction
            title="Absensi"
            subtitle="Selfie + GPS"
            icon="camera-outline"
            onPress={() => navigation.navigate('Attendance')}
          />
          <QuickAction
            title="Riwayat"
            subtitle="Data absensi"
            icon="time-outline"
            onPress={() => navigation.navigate('AttendanceHistory')}
          />
          <QuickAction
            title="Laundry"
            subtitle="Daftar tugas"
            icon="list-outline"
            onPress={() => navigation.navigate('TaskList')}
          />
          <QuickAction
            title="Profile"
            subtitle={user?.email ?? 'Akun aktif'}
            icon="person-outline"
            onPress={() => navigation.navigate('Dashboard')}
          />
        </View>
      </ScrollView>
    </AppScaffold>
  );
}

function QuickAction({
  title,
  subtitle,
  icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quick, pressed ? styles.pressed : null]}>
      <View style={styles.quickIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.quickTitle}>{title}</Text>
        <Text style={styles.quickSub} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
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
  hero: {
    borderRadius: 22,
    backgroundColor: colors.primary,
    padding: 16,
    gap: 12,
  },
  heroHello: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.2,
  },
  heroName: {
    marginTop: 2,
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
  },
  heroMeta: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  heroRing: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRingValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },
  heroRingLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.82)',
  },
  progressBarWrap: {
    gap: 8,
  },
  progressBarBg: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
  },
  progressBarFg: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },
  heroCta: {
    marginTop: 2,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroCtaText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  sectionRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
  },
  sectionHint: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  cardsRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 12,
  },
  taskCard: {
    flex: 1,
    padding: 12,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  taskIcon: {
    width: 34,
    height: 34,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#DDE0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.text,
  },
  taskSub: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#DDE0FF',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  emptyCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.text,
  },
  emptySub: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  quickGrid: {
    marginTop: 12,
    gap: 10,
  },
  quick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#DDE0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.text,
  },
  quickSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
