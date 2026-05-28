import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getTransactions } from '../api/transactions';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { LaundryTask } from '../types';
import { useAuth } from '../state/AuthContext';
import { AppScaffold } from '../components/AppScaffold';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskList'>;

function getTitle(task: LaundryTask): string {
  return task.code ?? `#${task.id}`;
}

export function TaskListScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [items, setItems] = React.useState<LaundryTask[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getTransactions(token);
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
      activeRoute="TaskList"
      title="Pekerjaan Laundry"
      subtitle="Update status sesuai progress"
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
          <Pressable
            onPress={() => navigation.navigate('TaskDetail', { taskId: String(item.id) })}
            style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
          >
            <View style={styles.cardTop}>
              <View style={styles.icon}>
                <Ionicons name="shirt-outline" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={1}>
                  {getTitle(item)}
                </Text>
                <Text style={styles.sub} numberOfLines={1}>
                  {item.customerName ?? 'Customer'}
                </Text>
              </View>
              <View style={[styles.badge, badgeStyle(item.status)]}>
                <Text style={[styles.badgeText, badgeTextStyle(item.status)]}>{item.status}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
              <Text style={styles.metaText}>{item.updatedAt ? `Update: ${item.updatedAt}` : 'Belum ada update'}</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="list-outline" size={18} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Belum ada pekerjaan</Text>
              <Text style={styles.emptySub}>Tarik data dari server atau gunakan Mock API.</Text>
            </View>
          ) : null
        }
        contentContainerStyle={items.length ? undefined : { flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      />
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
