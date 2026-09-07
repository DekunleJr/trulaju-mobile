import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/colors';
import { vehiclesApi } from '@/api/vehicles';
import { Vehicle } from '@/types';

export default function VehicleDetailScreen() {
  const { vrmcurr } = useLocalSearchParams<{ vrmcurr: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vrmcurr) return;
    vehiclesApi.getVehicle(vrmcurr).then(setVehicle).catch((err: any) => {
      setError(err?.response?.data?.error?.errors?.[0] || err?.response?.data?.detail || err?.message || 'Unable to load vehicle.');
    }).finally(() => setLoading(false));
  }, [vrmcurr]);

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="Back to Vehicles" variant="ghost" onPress={() => router.replace('/vehicles')} style={styles.back} />
      {error ? <Text style={styles.error}>{error}</Text> : vehicle ? (
        <View style={styles.card}>
          <Text style={styles.eyebrow}>Vehicle Details</Text>
          <Text style={styles.registration}>{vehicle.registrationNumber}</Text>
          <Text style={styles.name}>{vehicle.make} {vehicle.model}</Text>
          <View style={styles.row}><Text style={styles.label}>Year</Text><Text style={styles.value}>{vehicle.year || 'Unavailable'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Colour</Text><Text style={styles.value}>{vehicle.color || 'Unavailable'}</Text></View>
        </View>
      ) : <Text style={styles.error}>Vehicle not found.</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Colors.background, paddingHorizontal: 16, paddingTop: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  back: { alignSelf: 'flex-start', paddingHorizontal: 0, marginBottom: 12 },
  card: { backgroundColor: Colors.card, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, padding: 20 },
  eyebrow: { color: Colors.primary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  registration: { color: Colors.charcoal, fontSize: 24, fontWeight: '900', marginTop: 8 },
  name: { color: Colors.textSecondary, fontSize: 18, marginTop: 8, marginBottom: 24 },
  row: { borderTopWidth: 1, borderTopColor: Colors.border, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: Colors.textSecondary },
  value: { color: Colors.text, fontWeight: '700' },
  error: { color: Colors.error, fontSize: 16 },
});
