import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';

export default function VerifyOtpScreen() {
  const { email: initialEmail } = useLocalSearchParams<{ email?: string }>();
  const verifyRegistrationOtp = useAuthStore((state) => state.verifyRegistrationOtp);
  const [email, setEmail] = useState(initialEmail ?? '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !otp.trim()) {
      setError('Enter your email and verification code to continue.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await verifyRegistrationOtp(email.trim(), otp.trim());
      router.replace('/complete-profile');
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.errors?.[0] ||
          err?.response?.data?.detail ||
          err?.message ||
          'Verification failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.message}>Enter the code sent to your email address.</Text>
          <Input label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <Input label="Verification Code" placeholder="123456" keyboardType="number-pad" value={otp} onChangeText={setOtp} />
          {error && <Text style={styles.errorText}>{error}</Text>}
          <Button title="Verify Code" onPress={handleSubmit} loading={loading} style={styles.button} />
          <Link href="/login" asChild>
            <Text style={styles.link}>Back to Login</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 480, borderRadius: 24, padding: 24, backgroundColor: Colors.card, elevation: 3 },
  title: { textAlign: 'center', fontSize: 24, fontWeight: '900', color: Colors.charcoal, marginBottom: 8 },
  message: { textAlign: 'center', color: Colors.textSecondary, marginBottom: 20 },
  errorText: { color: Colors.error, fontSize: 13, marginBottom: 8, textAlign: 'center' },
  button: { marginTop: 8 },
  link: { color: Colors.primary, fontWeight: '700', textAlign: 'center', marginTop: 20 },
});
