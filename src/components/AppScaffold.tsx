import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../state/AuthContext';
import { USE_MOCK_API } from '../config';

type RouteName = keyof RootStackParamList;

type MenuItem = {
  key: 'Dashboard' | 'Attendance' | 'AttendanceHistory' | 'TaskList';
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const MENU: MenuItem[] = [
  { key: 'Dashboard', label: 'Home', icon: 'home-outline' },
  { key: 'Attendance', label: 'Absensi', icon: 'camera-outline' },
  { key: 'AttendanceHistory', label: 'Riwayat', icon: 'time-outline' },
  { key: 'TaskList', label: 'Laundry', icon: 'list-outline' },
];

type Props<Route extends RouteName> = {
  navigation: NativeStackNavigationProp<RootStackParamList, Route>;
  activeRoute: RouteName;
  title: string;
  subtitle?: string;
  rightTop?: React.ReactNode;
  children: React.ReactNode;
};

export function AppScaffold<Route extends RouteName>({
  navigation,
  activeRoute,
  title,
  subtitle,
  rightTop,
  children,
}: Props<Route>) {
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.bgTop} pointerEvents="none" />
      <View style={styles.row}>
        <View style={styles.rail}>
          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <Text style={styles.brandIconText}>NC</Text>
            </View>
            {USE_MOCK_API ? (
              <View style={styles.mockChip}>
                <Text style={styles.mockChipText}>Mock</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.menu}>
            {MENU.map((item) => {
              const isActive = activeRoute === item.key;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => navigation.navigate(item.key)}
                  style={({ pressed }) => [
                    styles.menuItem,
                    isActive ? styles.menuItemActive : null,
                    pressed ? styles.menuItemPressed : null,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={isActive ? colors.primary : colors.textMuted}
                  />
                  <Text style={[styles.menuLabel, isActive ? styles.menuLabelActive : null]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={signOut}
            style={({ pressed }) => [styles.logout, pressed ? styles.menuItemPressed : null]}
            accessibilityRole="button"
            accessibilityLabel="Logout"
          >
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={styles.logoutText}>Keluar</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {rightTop ? <View style={styles.rightTop}>{rightTop}</View> : null}
          </View>

          <View style={styles.body}>{children}</View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const colors = {
  bg: '#F5F6FB',
  surface: '#FFFFFF',
  primary: '#5B67F1',
  primarySoft: '#EEF0FF',
  text: '#0E1222',
  textMuted: '#6C7286',
  border: '#E7E9F3',
  danger: '#E64B4B',
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  bgTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 210,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    opacity: 0.15,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  rail: {
    width: 88,
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 4, height: 0 },
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  brand: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  mockChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#DDE0FF',
  },
  mockChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  menu: {
    flex: 1,
    gap: 8,
    paddingTop: 6,
  },
  menuItem: {
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  menuItemActive: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#DDE0FF',
  },
  menuItemPressed: {
    opacity: 0.75,
  },
  menuLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  menuLabelActive: {
    color: colors.primary,
  },
  logout: {
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#F3D2D2',
    backgroundColor: '#FFF6F6',
  },
  logoutText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.danger,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  rightTop: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  body: {
    flex: 1,
    marginTop: 14,
  },
});
