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

export default function RegisterScreen() {
  const registerPrivate = useAuthStore((state) => state.registerPrivate);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!email || !phoneNumber || !password) {
      setError('Please fill in every field to continue.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await registerPrivate({ email, phoneNumber, password });
      router.push({ pathname: '/verify-otp', params: { email } });
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.errors?.[0] ||
        err?.response?.data?.detail ||
        err?.message ||
        'Registration failed. Please try again.';
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
          <Text style={styles.title}>Create Account</Text>

          <Input
            label="Email"
            placeholder="username@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Phone Number"
            keyboardType="phone-pad"
            placeholder="0801234567"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          <Input
            label="Password"
            placeholder="*********"
            isPassword
            value={password}
            onChangeText={setPassword}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            title="Send Verification Code"
            onPress={handleRegister}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/login" asChild>
              <Text style={styles.footerLink}>Login</Text>
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
