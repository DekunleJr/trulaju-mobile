import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Enter your email and password to continue.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/');
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.errors?.[0] ||
        err?.response?.data?.detail ||
        err?.message ||
        'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Login</Text>

          <Input
            label="Email"
            placeholder="username@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Input
            label="Password"
            placeholder="*********"
            isPassword
            value={password}
            onChangeText={setPassword}
          />

          <Link href="/reset-password" asChild>
            <Text style={styles.forgotLink}>Forgot Password?</Text>
          </Link>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button title="Login" onPress={handleLogin} loading={loading} style={styles.button} />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
            <Link href="/register" asChild>
              <Text style={styles.footerLink}>Register</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: Colors.card,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '900',
    color: Colors.charcoal,
    marginBottom: 20,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
    marginTop: -8,
    marginBottom: 8,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
