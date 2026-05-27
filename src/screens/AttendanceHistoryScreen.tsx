import React from 'react';
import { ActivityIndicator, Alert, Button, FlatList, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAttendanceHistory } from '../api/attendance';
import type { AttendanceRecord } from '../types';
import { useAuth } from '../state/AuthContext';

export function AttendanceHistoryScreen() {
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
    <View style={{ flex: 1, padding: 16 }}>
      <Button title="Refresh" onPress={load} disabled={loading} />
      <View style={{ height: 12 }} />
      {loading ? <ActivityIndicator /> : null}
      <FlatList
        data={items}
        keyExtractor={(item, idx) => String(item.id ?? idx)}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 }}>
            <Text style={{ fontWeight: '600' }}>{item.type.toUpperCase()}</Text>
            <Text>{item.timestamp}</Text>
            {item.latitude !== undefined && item.longitude !== undefined ? (
              <Text style={{ color: '#666' }}>
                {Number(item.latitude).toFixed(5)}, {Number(item.longitude).toFixed(5)}
              </Text>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          !loading ? <Text style={{ color: '#666' }}>Belum ada data.</Text> : null
        }
      />
    </View>
  );
}
