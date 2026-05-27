import React from 'react';
import { ActivityIndicator, Alert, Button, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getTransactions, updateTransactionStatus } from '../api/transactions';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { LAUNDRY_STATUSES } from '../types';
import type { LaundryTask, LaundryStatus } from '../types';
import { useAuth } from '../state/AuthContext';

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
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Detail Pekerjaan</Text>

      {loading && !task ? <ActivityIndicator /> : null}

      <Text style={{ marginBottom: 6 }}>ID: {taskId}</Text>
      <Text style={{ marginBottom: 16 }}>Status saat ini: {task?.status ?? '-'}</Text>

      <Text style={{ fontWeight: '600', marginBottom: 8 }}>Update Status</Text>
      <View style={{ gap: 8 }}>
        {LAUNDRY_STATUSES.map((s) => (
          <Button key={s} title={status === s ? `✓ ${s}` : s} onPress={() => setStatus(s)} />
        ))}
      </View>

      <View style={{ height: 16 }} />
      <Button title={loading ? 'Mengirim...' : 'Simpan'} onPress={onUpdate} disabled={loading} />
      <View style={{ height: 12 }} />
      <Button title="Reload" onPress={load} disabled={loading} />
    </View>
  );
}

