import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { CompletePrivateProfileRequest, Sex } from '@/types';

const initialForm: CompletePrivateProfileRequest = {
  firstName: '', lastName: '', middleName: '', nin: '', dateOfBirth: '', sex: 'male',
  address: '', city: '', state: '', country: 'Nigeria', postCode: '', lga: '', area: '',
};

export default function CompleteProfileScreen() {
  const completeProfile = useAuthStore((state) => state.completeProfile);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof CompletePrivateProfileRequest, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const handleSubmit = async () => {
    const required: (keyof CompletePrivateProfileRequest)[] = ['firstName', 'lastName', 'nin', 'dateOfBirth', 'address', 'city', 'state', 'country', 'postCode'];
    if (required.some((field) => !String(form[field] ?? '').trim())) {
      setError('Complete all required fields to continue.');
      return;
    }
    if (!/^\d{11}$/.test(form.nin)) {
      setError('NIN must contain exactly 11 digits.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await completeProfile(form);
      router.replace('/');
    } catch (err: any) {
      setError(err?.response?.data?.error?.errors?.[0] || err?.response?.data?.detail || err?.message || 'Profile completion failed.');
    } finally {
      setLoading(false);
    }
  };

  const fields: { key: keyof CompletePrivateProfileRequest; label: string; placeholder: string }[] = [
    { key: 'firstName', label: 'First Name *', placeholder: 'First name' },
    { key: 'lastName', label: 'Last Name *', placeholder: 'Last name' },
    { key: 'middleName', label: 'Middle Name', placeholder: 'Middle name' },
    { key: 'nin', label: 'NIN *', placeholder: '11-digit NIN' },
    { key: 'dateOfBirth', label: 'Date of Birth *', placeholder: 'YYYY-MM-DD' },
    { key: 'address', label: 'Address *', placeholder: 'Street address' },
    { key: 'city', label: 'City *', placeholder: 'City' },
    { key: 'state', label: 'State *', placeholder: 'State' },
    { key: 'country', label: 'Country *', placeholder: 'Country' },
    { key: 'postCode', label: 'Post Code *', placeholder: 'Post code' },
    { key: 'lga', label: 'LGA', placeholder: 'Local government area' },
    { key: 'area', label: 'Area', placeholder: 'Area' },
  ];

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Complete Your Profile</Text>
          {fields.map(({ key, label, placeholder }) => (
            <Input key={key} label={label} placeholder={placeholder} value={String(form[key] ?? '')} onChangeText={(value) => update(key, value)} keyboardType={key === 'nin' || key === 'postCode' ? 'number-pad' : 'default'} autoCapitalize={key === 'nin' ? 'characters' : 'words'} />
          ))}
          <Text style={styles.label}>Sex</Text>
          <View style={styles.sexRow}>
            {(['male', 'female'] as Sex[]).map((value) => (
              <Button key={value} title={value === 'male' ? 'Male' : 'Female'} variant={form.sex === value ? 'primary' : 'outline'} onPress={() => setForm((current) => ({ ...current, sex: value }))} style={styles.sexButton} />
            ))}
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <Button title="Complete Registration" onPress={handleSubmit} loading={loading} style={styles.button} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, alignItems: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 480, borderRadius: 24, padding: 24, backgroundColor: Colors.card, elevation: 3 },
  title: { textAlign: 'center', fontSize: 24, fontWeight: '900', color: Colors.charcoal, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  sexRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  sexButton: { flex: 1 },
  errorText: { color: Colors.error, fontSize: 13, marginBottom: 8, textAlign: 'center' },
  button: { marginTop: 8 },
});
