import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { PortalShell } from '@/components/PortalShell';
import { Colors } from '@/constants/colors';
import { vehiclesApi } from '@/api/vehicles';

export default function AddVehicleScreen() {
  const [form, setForm] = useState({
    registrationNumber: '',
    make: '',
    model: '',
    year: '',
    color: '',
    vin: '',
    engineNo: '',
    bodyType: 'SEDAN',
    value: '',
    vehicleCategory: 'Private',
    fuelType: 'petrol' as const,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async () => {
    if (!form.registrationNumber || !form.make || !form.model || !form.year || !form.color || !form.vin || !form.value) {
      setError('Complete the required vehicle fields.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await vehiclesApi.registerVehicle({
        ...form,
        year: Number(form.year),
        value: Number(form.value),
      });
      router.replace('/vehicles');
    } catch (err: any) {
      setError(err?.response?.data?.error?.errors?.[0] || err?.response?.data?.detail || err?.message || 'Unable to add vehicle.');
    } finally {
      setLoading(false);
    }
  };

  const fields: { key: keyof typeof form; label: string; placeholder: string }[] = [
    { key: 'registrationNumber', label: 'Registration Number *', placeholder: 'ABC123XY' },
    { key: 'make', label: 'Make *', placeholder: 'Toyota' },
    { key: 'model', label: 'Model *', placeholder: 'Camry' },
    { key: 'year', label: 'Manufacture Year *', placeholder: '2024' },
    { key: 'color', label: 'Colour *', placeholder: 'Black' },
    { key: 'vin', label: 'Chassis Number *', placeholder: 'Chassis number' },
    { key: 'engineNo', label: 'Engine Number', placeholder: 'Engine number' },
    { key: 'bodyType', label: 'Body Type', placeholder: 'SEDAN' },
    { key: 'value', label: 'Vehicle Value *', placeholder: '5000000' },
  ];

  return (
    <PortalShell>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Button title="Back to Vehicles" variant="ghost" onPress={() => router.replace('/vehicles')} style={styles.back} />
          <View style={styles.card}>
            <Text style={styles.kicker}>Customer Portal</Text>
            <Text style={styles.title}>Add Vehicle</Text>
            {fields.map(({ key, label, placeholder }) => (
              <Input
                key={key}
                label={label}
                placeholder={placeholder}
                value={form[key]}
                onChangeText={(value) => update(key, value)}
                keyboardType={['year', 'value'].includes(key) ? 'number-pad' : 'default'}
                autoCapitalize={key === 'registrationNumber' ? 'characters' : 'words'}
              />
            ))}
            {error && <Text style={styles.error}>{error}</Text>}
            <Button title="Add Vehicle" onPress={submit} loading={loading} style={styles.submit} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </PortalShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 16, paddingTop: 24, backgroundColor: Colors.background },
  back: { alignSelf: 'flex-start', paddingHorizontal: 0 },
  card: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 20 },
  kicker: { color: Colors.primary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  title: { color: Colors.charcoal, fontSize: 24, fontWeight: '900', marginTop: 5, marginBottom: 20 },
  error: { color: Colors.error, marginBottom: 8 },
  submit: { marginTop: 8 },
});
