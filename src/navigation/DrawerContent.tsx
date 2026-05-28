import React from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { useAuth } from '../state/AuthContext';

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const { signOut, user } = useAuth();

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ paddingTop: 12, paddingHorizontal: 8, gap: 12, alignItems: 'flex-start' }}
    >
      <View style={{ width: '100%', paddingHorizontal: 8 }}>
        <Text style={{ fontSize: 12, color: '#666' }}>Login</Text>
        <Text style={{ fontSize: 14, fontWeight: '600' }}>{user?.email ?? 'User'}</Text>
      </View>

      <View style={{ width: '100%' }}>
        <DrawerItemList {...props} />
      </View>

      <View style={{ width: '100%', paddingHorizontal: 8, marginTop: 8 }}>
        <Pressable
          onPress={signOut}
          style={({ pressed }) => ({
            height: 44,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E4E6EF',
            paddingHorizontal: 14,
            justifyContent: 'center',
            backgroundColor: pressed ? '#F0F1F6' : '#FFFFFF',
            alignSelf: 'stretch',
          })}
        >
          <Text style={{ fontWeight: '600' }}>Logout</Text>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  );
}

