import React from 'react';
import { Alert, Button, KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import { login } from '../api/auth';
import { useAuth } from '../state/AuthContext';

export function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const onSubmit = React.useCallback(async () => {
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
  }, [email, password, signIn]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, padding: 16, justifyContent: 'center' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 16 }}>NextClean Mobile</Text>

      <Text style={{ marginBottom: 6 }}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="email@contoh.com"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
        }}
      />

      <Text style={{ marginBottom: 6 }}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
        }}
      />

      <Button title={loading ? 'Masuk...' : 'Login'} onPress={onSubmit} disabled={loading} />
      <View style={{ height: 12 }} />
      <Text style={{ color: '#666' }}>
        Pastikan API backend aktif dan set EXPO_PUBLIC_API_BASE_URL jika perlu.
      </Text>
    </KeyboardAvoidingView>
  );
}

