import React from 'react';
import { ActivityIndicator, Alert, Button, FlatList, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions } from '../api/transactions';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { LaundryTask } from '../types';
import { useAuth } from '../state/AuthContext';

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
    <View style={{ flex: 1, padding: 16 }}>
      <Button title="Refresh" onPress={load} disabled={loading} />
      <View style={{ height: 12 }} />
      {loading ? <ActivityIndicator /> : null}
      <FlatList
        data={items}
        keyExtractor={(item, idx) => String(item.id ?? idx)}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('TaskDetail', { taskId: String(item.id) })}
            style={{ padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 }}
          >
            <Text style={{ fontWeight: '600' }}>{getTitle(item)}</Text>
            {item.customerName ? <Text>{item.customerName}</Text> : null}
            <Text style={{ color: '#666' }}>Status: {item.status}</Text>
          </Pressable>
        )}
        ListEmptyComponent={!loading ? <Text style={{ color: '#666' }}>Belum ada pekerjaan.</Text> : null}
      />
    </View>
  );
}

