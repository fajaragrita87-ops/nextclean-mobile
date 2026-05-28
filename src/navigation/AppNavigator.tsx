import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerToggleButton } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../state/AuthContext';
import { AttendanceScreen } from '../screens/AttendanceScreen';
import { AttendanceHistoryScreen } from '../screens/AttendanceHistoryScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';
import { TaskListScreen } from '../screens/TaskListScreen';
import { AppDrawerContent } from './DrawerContent';
import type { AppDrawerParamList, AttendanceStackParamList, DashboardStackParamList, TaskStackParamList } from './types';
import { appTheme } from '../theme/appTheme';

type AuthStackParamList = {
  Login: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const AttendanceStack = createNativeStackNavigator<AttendanceStackParamList>();
const TaskStack = createNativeStackNavigator<TaskStackParamList>();
const Drawer = createDrawerNavigator<AppDrawerParamList>();

function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

function HeaderLogout() {
  const { signOut } = useAuth();
  return (
    <Pressable
      onPress={signOut}
      style={({ pressed }) => ({
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: pressed ? '#F0F1F6' : 'transparent',
      })}
    >
      <Text style={{ fontWeight: '600', color: '#5B3DF2' }}>Logout</Text>
    </Pressable>
  );
}

function DashboardStackNavigator() {
  return (
    <DashboardStack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: appTheme.colors.background },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: appTheme.colors.background },
        headerTitleStyle: { fontWeight: '700', color: appTheme.colors.text },
      }}
    >
      <DashboardStack.Screen
        name="DashboardHome"
        component={DashboardScreen}
        options={{
          title: 'NextClean',
          headerLeft: () => <DrawerToggleButton tintColor={appTheme.colors.text} />,
          headerRight: () => <HeaderLogout />,
        }}
      />
    </DashboardStack.Navigator>
  );
}

function AttendanceStackNavigator() {
  return (
    <AttendanceStack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: appTheme.colors.background },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: appTheme.colors.background },
        headerTitleStyle: { fontWeight: '700', color: appTheme.colors.text },
      }}
    >
      <AttendanceStack.Screen
        name="AttendanceHome"
        component={AttendanceScreen}
        options={{
          title: 'Absensi',
          headerLeft: () => <DrawerToggleButton tintColor={appTheme.colors.text} />,
          headerRight: () => <HeaderLogout />,
        }}
      />
      <AttendanceStack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} options={{ title: 'Riwayat' }} />
    </AttendanceStack.Navigator>
  );
}

function TaskStackNavigator() {
  return (
    <TaskStack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: appTheme.colors.background },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: appTheme.colors.background },
        headerTitleStyle: { fontWeight: '700', color: appTheme.colors.text },
      }}
    >
      <TaskStack.Screen
        name="TaskList"
        component={TaskListScreen}
        options={{
          title: 'Laundry',
          headerLeft: () => <DrawerToggleButton tintColor={appTheme.colors.text} />,
          headerRight: () => <HeaderLogout />,
        }}
      />
      <TaskStack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Detail' }} />
    </TaskStack.Navigator>
  );
}

export function AppNavigator() {
  const { token, bootstrapped } = useAuth();

  if (!bootstrapped) return <Loading />;

  return (
    <NavigationContainer theme={appTheme}>
      {!token ? (
        <AuthStack.Navigator>
          <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
        </AuthStack.Navigator>
      ) : (
        <Drawer.Navigator
          drawerContent={(p) => <AppDrawerContent {...p} />}
          screenOptions={{
            headerShown: false,
            drawerPosition: 'left',
            drawerType: 'front',
            drawerStyle: { width: 280, backgroundColor: appTheme.colors.card },
            drawerActiveTintColor: appTheme.colors.primary,
            drawerInactiveTintColor: appTheme.colors.text,
            drawerLabelStyle: { fontSize: 14, fontWeight: '600', marginLeft: -12 },
            drawerItemStyle: { borderRadius: 14, marginHorizontal: 8 },
          }}
        >
          <Drawer.Screen name="Dashboard" component={DashboardStackNavigator} options={{ title: 'Dashboard' }} />
          <Drawer.Screen name="Attendance" component={AttendanceStackNavigator} options={{ title: 'Absensi' }} />
          <Drawer.Screen name="Tasks" component={TaskStackNavigator} options={{ title: 'Pekerjaan Laundry' }} />
        </Drawer.Navigator>
      )}
    </NavigationContainer>
  );
}
