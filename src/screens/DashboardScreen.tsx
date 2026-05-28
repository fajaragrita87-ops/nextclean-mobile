import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { AppDrawerParamList, DashboardStackParamList } from '../navigation/types';
import { useAuth } from '../state/AuthContext';
import { USE_MOCK_API } from '../config';

type Props = NativeStackScreenProps<DashboardStackParamList, 'DashboardHome'>;

export function DashboardScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const drawerNav = navigation.getParent<DrawerNavigationProp<AppDrawerParamList>>();

  return (
    <View style={{ flex: 1, padding: 16, gap: 14 }}>
      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 14, color: '#666' }}>Hello!</Text>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>{user?.email ?? 'NextClean'}</Text>
      </View>
      <Text style={{ color: '#666' }}>
        {user?.email ? `Login: ${user.email}` : 'Login aktif'}
        {USE_MOCK_API ? ' • Mock API' : ''}
      </Text>

      <View
        style={{
          padding: 16,
          borderRadius: 18,
          backgroundColor: '#5B3DF2',
          gap: 12,
          overflow: 'hidden',
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>Your today’s task almost done!</Text>
        <Pressable
          onPress={() => drawerNav?.navigate('Tasks', { screen: 'TaskList' })}
          style={({ pressed }) => ({
            height: 40,
            paddingHorizontal: 14,
            borderRadius: 12,
            backgroundColor: pressed ? '#E9E6FF' : '#FFFFFF',
            alignSelf: 'flex-start',
            justifyContent: 'center',
          })}
        >
          <Text style={{ fontWeight: '700', color: '#5B3DF2' }}>Lihat Task</Text>
        </Pressable>
      </View>

      <View style={{ gap: 10 }}>
        <Pressable
          onPress={() => drawerNav?.navigate('Attendance', { screen: 'AttendanceHome' })}
          style={({ pressed }) => ({
            padding: 14,
            borderRadius: 16,
            backgroundColor: pressed ? '#F0F1F6' : '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E4E6EF',
          })}
        >
          <Text style={{ fontWeight: '700' }}>Absensi</Text>
          <Text style={{ color: '#666' }}>Check-in / Check-out</Text>
        </Pressable>

        <Pressable
          onPress={() => drawerNav?.navigate('Attendance', { screen: 'AttendanceHistory' })}
          style={({ pressed }) => ({
            padding: 14,
            borderRadius: 16,
            backgroundColor: pressed ? '#F0F1F6' : '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E4E6EF',
          })}
        >
          <Text style={{ fontWeight: '700' }}>Riwayat Absensi</Text>
          <Text style={{ color: '#666' }}>Lihat histori terbaru</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={signOut}
        style={({ pressed }) => ({
          height: 44,
          borderRadius: 16,
          backgroundColor: pressed ? '#F0F1F6' : '#FFFFFF',
          borderWidth: 1,
          borderColor: '#E4E6EF',
          justifyContent: 'center',
          alignItems: 'center',
        })}
      >
        <Text style={{ fontWeight: '700', color: '#5B3DF2' }}>Logout</Text>
      </Pressable>
    </View>
  );
}
