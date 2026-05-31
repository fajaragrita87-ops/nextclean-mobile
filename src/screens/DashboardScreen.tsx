import React from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function localDateKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function startOfWeekMonday(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function DashboardScreen({ navigation }: Props) {
  const { user, token, signOut } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [tasks, setTasks] = React.useState<LaundryTask[]>([]);
  const [attendance, setAttendance] = React.useState<AttendanceRecord[]>([]);

  const load = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [tasksRes, attRes] = await Promise.allSettled([getTransactions(token), getAttendanceHistory(token)]);
      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value);
      if (attRes.status === 'fulfilled') setAttendance(attRes.value);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load])
  );

  const now = new Date();
  const dayNumber = now.getDate();
  const weekday = now.toLocaleDateString('id-ID', { weekday: 'long' });
  const monthYear = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const attendanceDaySet = React.useMemo(() => {
    const set = new Set<string>();
    for (const r of attendance) {
      const dt = new Date(r.timestamp);
      if (!Number.isNaN(dt.getTime())) set.add(localDateKey(dt));
    }
    return set;
  }, [attendance]);

  const weekStart = startOfWeekMonday(now);
  const weekDays = React.useMemo(() => {
    const labels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum'];
    return labels.map((label, idx) => {
      const date = addDays(weekStart, idx);
      return { label, date, key: localDateKey(date) };
    });
  }, [weekStart]);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const workdayKeysThisMonth: string[] = [];
  for (let d = new Date(monthStart); d <= now; d = addDays(d, 1)) {
    if (isWeekend(d)) continue;
    workdayKeysThisMonth.push(localDateKey(d));
  }

  const hadirThisMonth = workdayKeysThisMonth.filter((k) => attendanceDaySet.has(k)).length;
  const percentKehadiran = workdayKeysThisMonth.length
    ? Math.round((hadirThisMonth / workdayKeysThisMonth.length) * 100)
    : 0;
  const cutiDiambil = 0;
  const hariBerjalan = Math.max(1, Math.floor((now.getTime() - monthStart.getTime()) / 86400000) + 1);

  return (
    <AppScaffold
      navigation={navigation}
      activeRoute="Dashboard"
      title="Presensi"
      subtitle={USE_MOCK_API ? 'Mode Mock' : undefined}
      rightTop={
        <View style={styles.topIcons}>
          <Pressable
            onPress={load}
            style={({ pressed }) => [styles.topIconBtn, pressed ? styles.pressed : null]}
            accessibilityRole="button"
            accessibilityLabel="Muat ulang"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="paper-plane-outline" size={18} color="#fff" />
            )}
          </Pressable>

          <Pressable
            onPress={() => Alert.alert('Notifikasi', 'Belum ada notifikasi.')}
            style={({ pressed }) => [styles.topIconBtn, pressed ? styles.pressed : null]}
            accessibilityRole="button"
            accessibilityLabel="Notifikasi"
          >
            <Ionicons name="notifications-outline" size={18} color="#fff" />
            <View style={styles.dot} />
          </Pressable>

          <Pressable
            onPress={() =>
              Alert.alert('Akun', 'Keluar dari akun ini?', [
                { text: 'Batal', style: 'cancel' },
                { text: 'Keluar', style: 'destructive', onPress: signOut },
              ])
            }
            style={({ pressed }) => [styles.topIconBtn, pressed ? styles.pressed : null]}
            accessibilityRole="button"
            accessibilityLabel="Akun"
          >
            <Ionicons name="person-outline" size={18} color="#fff" />
          </Pressable>
        </View>
      }
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.attendanceRow}>
          <Pressable
            onPress={() => navigation.navigate('Attendance')}
            style={({ pressed }) => [styles.attendanceInput, pressed ? styles.pressed : null]}
            accessibilityRole="button"
            accessibilityLabel="Ambil absensi hari ini"
          >
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={styles.attendancePlaceholder} numberOfLines={1}>
              Ambil absensi hari ini
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Attendance')}
            style={({ pressed }) => [styles.attendanceSubmit, pressed ? styles.pressed : null]}
            accessibilityRole="button"
            accessibilityLabel="Absen"
          >
            <Text style={styles.attendanceSubmitText}>Absen</Text>
          </Pressable>
        </View>

        <View style={styles.dateCard}>
          <View style={styles.dateTop}>
            <Text style={styles.dateNumber}>{dayNumber}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.dateWeekday} numberOfLines={1}>
                {weekday}
              </Text>
              <Text style={styles.dateMonth} numberOfLines={1}>
                {monthYear}
              </Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate('AttendanceHistory')}
              style={({ pressed }) => [styles.dateArrow, pressed ? styles.pressed : null]}
              accessibilityRole="button"
              accessibilityLabel="Lihat riwayat"
            >
              <Ionicons name="chevron-forward" size={18} color={colors.primary} />
            </Pressable>
          </View>

          <View style={styles.weekWrap}>
            <Text style={styles.weekTitle}>Status minggu ini</Text>
            <View style={styles.weekRow}>
              {weekDays.map((d) => {
                const hadir = attendanceDaySet.has(d.key);
                return (
                  <View key={d.key} style={styles.weekCol}>
                    <Text style={styles.weekLabel}>{d.label}</Text>
                    <View
                      style={[
                        styles.weekDot,
                        hadir ? styles.weekDotHadir : styles.weekDotAlpha,
                      ]}
                    >
                      {hadir ? (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      ) : (
                        <Text style={styles.weekAlphaText}>A</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard value={`${percentKehadiran}%`} label="Kehadiran" />
          <StatCard value={pad2(cutiDiambil)} label="Cuti Diambil" />
          <StatCard value={pad2(hariBerjalan)} label="Hari Berjalan" />
        </View>

        <View style={styles.menuCard}>
          <View style={styles.menuGrid}>
            <MenuItem
              icon="camera-outline"
              label="Absensi"
              onPress={() => navigation.navigate('Attendance')}
            />
            <MenuItem
              icon="time-outline"
              label="Riwayat"
              onPress={() => navigation.navigate('AttendanceHistory')}
            />
            <MenuItem
              icon="list-outline"
              label="Tugas"
              onPress={() => navigation.navigate('TaskList')}
            />
            <MenuItem
              icon="document-text-outline"
              label="Ajukan Cuti"
              onPress={() => Alert.alert('Cuti', 'Fitur ajukan cuti belum tersedia.')}
            />
            <MenuItem
              icon="newspaper-outline"
              label="Berita"
              onPress={() => Alert.alert('Berita', 'Fitur berita belum tersedia.')}
            />
            <MenuItem
              icon="people-outline"
              label="Tim"
              onPress={() => Alert.alert('Tim', 'Fitur tim belum tersedia.')}
            />
          </View>
        </View>
      </ScrollView>
    </AppScaffold>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statRing}>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuItem, pressed ? styles.pressed : null]}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={styles.menuLabel} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const colors = {
  primary: '#5B67F1',
  primarySoft: '#EEF0FF',
  danger: '#E64B4B',
  text: '#0E1222',
  textMuted: '#6C7286',
  border: '#E7E9F3',
  surface: '#FFFFFF',
};

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  topIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  scroll: {
    paddingBottom: 18,
  },
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  attendanceInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  attendancePlaceholder: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  attendanceSubmit: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#F07C90',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendanceSubmitText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.2,
  },
  dateCard: {
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 12,
  },
  dateTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateNumber: {
    width: 58,
    textAlign: 'center',
    fontSize: 34,
    fontWeight: '900',
    color: colors.primary,
  },
  dateWeekday: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.text,
  },
  dateMonth: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  dateArrow: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#DDE0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekWrap: {
    gap: 10,
  },
  weekTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.textMuted,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  weekCol: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  weekLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textMuted,
  },
  weekDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDotHadir: {
    backgroundColor: colors.primary,
  },
  weekDotAlpha: {
    backgroundColor: '#FFECEF',
    borderWidth: 1,
    borderColor: '#FFC7D0',
  },
  weekAlphaText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#E64B4B',
  },
  statsRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 8,
  },
  statRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textMuted,
  },
  menuCard: {
    marginTop: 12,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
  },
  menuItem: {
    width: '33.333%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#DDE0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.textMuted,
  },
});
