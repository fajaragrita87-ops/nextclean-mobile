import React from 'react';
import { Button, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../state/AuthContext';
import { USE_MOCK_API } from '../config';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export function DashboardScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Dashboard</Text>
      <Text style={{ color: '#666' }}>
        {user?.email ? `Login: ${user.email}` : 'Login aktif'}
        {USE_MOCK_API ? ' • Mock API' : ''}
      </Text>

      <View style={{ height: 12 }} />

      <Button title="Absensi" onPress={() => navigation.navigate('Attendance')} />
      <Button title="Riwayat Absensi" onPress={() => navigation.navigate('AttendanceHistory')} />
      <Button title="Pekerjaan Laundry" onPress={() => navigation.navigate('TaskList')} />

      <View style={{ height: 12 }} />
      <Button title="Logout" onPress={signOut} />
    </View>
  );
}

