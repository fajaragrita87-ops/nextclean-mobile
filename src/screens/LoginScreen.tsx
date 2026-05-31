import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { login } from '../api/auth';
import { useAuth } from '../state/AuthContext';
import { getApiBaseUrl, getDefaultApiBaseUrl, setApiBaseUrlOverride, USE_MOCK_API } from '../config';
import { getStoredString, removeStoredString, setStoredString } from '../storage/authToken';

const API_BASE_URL_KEY = 'api_base_url';

function normalizeBaseUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const withScheme = raw.includes('://') ? raw : `http://${raw}`;
  const noTrailing = withScheme.replace(/\/+$/, '');
  if (noTrailing.endsWith('/api')) return noTrailing;
  const lower = noTrailing.toLowerCase();
  const hasApiPath = lower.includes('/api/');
  if (hasApiPath) return noTrailing;
  return `${noTrailing}/api`;
}

export function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [apiBaseUrl, setApiBaseUrl] = React.useState(getApiBaseUrl());
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await getStoredString(API_BASE_URL_KEY);
      if (cancelled) return;
      if (stored) {
        setApiBaseUrl(stored);
        setApiBaseUrlOverride(stored);
      } else {
        const def = getDefaultApiBaseUrl();
        setApiBaseUrl(def);
        setApiBaseUrlOverride(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = React.useCallback(async () => {
    const normalized = normalizeBaseUrl(apiBaseUrl);
    if (normalized) {
      await setStoredString(API_BASE_URL_KEY, normalized);
      setApiBaseUrlOverride(normalized);
    } else {
      await removeStoredString(API_BASE_URL_KEY);
      setApiBaseUrlOverride(null);
    }

    if (!email.trim() || !password) {
      Alert.alert('Lengkapi data', 'Email dan password wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      await signIn({ token: res.token, user: res.user ?? null });
    } catch (e: any) {
      Alert.alert('Login gagal', String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, email, password, signIn]);

  return (
    <KeyboardAvoidingView
      style={styles.safe}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.bgTop} pointerEvents="none" />

      <View style={styles.card}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>NC</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.appTitle}>NextClean</Text>
            <Text style={styles.appSub}>
              Masuk untuk lanjut{USE_MOCK_API ? ' • Mock API' : ''}
            </Text>
          </View>
        </View>

        <View style={{ height: 14 }} />

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="email@contoh.com"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>

        <View style={{ height: 12 }} />

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>

        <View style={{ height: 12 }} />

        <Text style={styles.label}>Server API</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="link-outline" size={18} color={colors.textMuted} />
          <TextInput
            value={apiBaseUrl}
            onChangeText={setApiBaseUrl}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={getDefaultApiBaseUrl()}
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>

        <View style={{ height: 14 }} />

        <Pressable
          onPress={onSubmit}
          disabled={loading}
          style={({ pressed }) => [styles.loginBtn, loading ? styles.disabled : null, pressed ? styles.pressed : null]}
        >
          <Text style={styles.loginText}>{loading ? 'Masuk...' : 'Login'}</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>

        <View style={{ height: 12 }} />

        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textMuted} />
          <Text style={styles.noticeText}>
            Untuk demo beda kota, isi Server API pakai URL publik (domain/ngrok) yang bisa diakses semua perangkat.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
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
};

const styles = StyleSheet.create({
  pressed: { opacity: 0.88 },
  disabled: { opacity: 0.65 },
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 16,
    justifyContent: 'center',
  },
  bgTop: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    height: 280,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    opacity: 0.15,
  },
  card: {
    borderRadius: 26,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#DDE0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.4,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
  },
  appSub: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FAFBFF',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  loginBtn: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loginText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FAFBFF',
    borderRadius: 18,
    padding: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    lineHeight: 16,
  },
});
