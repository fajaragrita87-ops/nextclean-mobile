import React from 'react';
import { ActivityIndicator, Button, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../state/AuthContext';
import { AttendanceScreen } from '../screens/AttendanceScreen';
import { AttendanceHistoryScreen } from '../screens/AttendanceHistoryScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';
import { TaskListScreen } from '../screens/TaskListScreen';

export type RootStackParamList = {
  Login: undefined;
  Attendance: undefined;
  AttendanceHistory: undefined;
  TaskList: undefined;
  TaskDetail: { taskId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export function AppNavigator() {
  const { token, bootstrapped, signOut } = useAuth();

  if (!bootstrapped) return <Loading />;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!token ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
        ) : (
          <>
            <Stack.Screen
              name="Attendance"
              component={AttendanceScreen}
              options={{
                title: 'Absensi',
                headerRight: () => <Button title="Logout" onPress={signOut} />,
              }}
            />
            <Stack.Screen
              name="AttendanceHistory"
              component={AttendanceHistoryScreen}
              options={{ title: 'Riwayat Absensi' }}
            />
            <Stack.Screen
              name="TaskList"
              component={TaskListScreen}
              options={{
                title: 'Pekerjaan Laundry',
                headerRight: () => <Button title="Logout" onPress={signOut} />,
              }}
            />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Detail' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

