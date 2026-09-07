import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/colors';
import { authApi } from '@/api/auth';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!resetToken) {
        if (!email.trim()) {
          setError('Enter your email to continue.');
          return;
        }
        if (!code.trim()) {
          await authApi.forgotPassword(email.trim());
          setError('A verification code was sent. Enter it to continue.');
          return;
        }
        const result = await authApi.verifyResetCode(code.trim());
        setEmail(result.email || email.trim());
        setResetToken(result.resetToken);
        return;
      }

      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      await authApi.resetPassword(email.trim(), newPassword, resetToken);
      router.replace('/login');
    } catch (err: any) {
      setError(err?.response?.data?.error?.errors?.[0] || err?.response?.data?.detail || err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Reset Password</Text>

          <Input label="Email" placeholder="username@example.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} editable={!resetToken} />
          {!resetToken && <Input label="Verification Code" placeholder="Enter the code from your email" keyboardType="number-pad" value={code} onChangeText={setCode} />}
          {resetToken && <Input label="New Password" placeholder="*********" isPassword value={newPassword} onChangeText={setNewPassword} />}
          {error && <Text style={styles.errorText}>{error}</Text>}
          <Button title={resetToken ? 'Update Password' : code ? 'Verify Code' : 'Send Reset Code'} onPress={handleSubmit} loading={loading} style={styles.button} />
          <Button title="Back to Login" variant="ghost" onPress={() => router.replace('/login')} style={styles.button} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
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
  title: { textAlign: 'center', fontSize: 24, fontWeight: '900', color: Colors.charcoal, marginBottom: 20 },
  message: { textAlign: 'center', color: Colors.textSecondary, fontSize: 14, marginBottom: 16 },
  errorText: { color: Colors.error, fontSize: 13, marginBottom: 8, textAlign: 'center' },
  button: { marginTop: 8 },
});
