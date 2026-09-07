import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { PortalShell } from '@/components/PortalShell';
import { Colors } from '@/constants/colors';
import { walletApi } from '@/api/wallet';

export default function FundWalletScreen() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Enter a valid amount greater than zero.');
      return;
    }
    setError(null); setLoading(true);
    try {
      const result = await walletApi.generatePaymentLink(numericAmount);
      const paymentLink = result.PaymentLink || result.paymentLink;
      if (!paymentLink) throw new Error('Payment link was not returned.');
      await Linking.openURL(paymentLink);
      Alert.alert('Payment started', 'Complete payment in your browser, then return to the app.');
    } catch (err: any) {
      setError(err?.response?.data?.error?.errors?.[0] || err?.response?.data?.Message || err?.message || 'Unable to start payment.');
    } finally { setLoading(false); }
  };

  return <PortalShell><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled"><Button title="Back to Dashboard" variant="ghost" onPress={() => router.replace('/')} style={styles.back} /><View style={styles.card}><Text style={styles.kicker}>Customer Portal</Text><Text style={styles.title}>Fund Wallet</Text><Text style={styles.description}>Choose the amount you want to add to your wallet. Payment will open securely in your browser.</Text><Input label="Amount (NGN)" placeholder="10000" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} /><Text style={styles.note}>Paystack payment fees may apply.</Text>{error && <Text style={styles.error}>{error}</Text>}<Button title="Continue to Payment" onPress={submit} loading={loading} style={styles.submit} /></View></ScrollView></KeyboardAvoidingView></PortalShell>;
}

const styles = StyleSheet.create({ flex: { flex: 1 }, container: { flexGrow: 1, padding: 16, paddingTop: 24, backgroundColor: Colors.background }, back: { alignSelf: 'flex-start', paddingHorizontal: 0 }, card: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 20 }, kicker: { color: Colors.primary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' }, title: { color: Colors.charcoal, fontSize: 24, fontWeight: '900', marginTop: 5, marginBottom: 12 }, description: { color: Colors.textSecondary, lineHeight: 21, marginBottom: 20 }, note: { color: Colors.textSecondary, fontSize: 12, marginTop: -8, marginBottom: 10 }, error: { color: Colors.error, marginBottom: 8 }, submit: { marginTop: 8 } });
