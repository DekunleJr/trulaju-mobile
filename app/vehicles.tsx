import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/colors';
import { vehiclesApi } from '@/api/vehicles';
import { Vehicle } from '@/types';
import { PortalShell } from '@/components/PortalShell';

export default function VehiclesScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVehicles = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      setVehicles(await vehiclesApi.getVehicles());
    } catch (err: any) {
      setError(err?.response?.data?.error?.errors?.[0] || err?.response?.data?.detail || err?.message || 'Unable to load vehicles.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={Colors.primary} /><Text style={styles.muted}>Loading vehicles...</Text></View>;
  }

  return (
    <PortalShell>
      <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Customer Portal</Text>
          <Text style={styles.title}>Vehicles</Text>
        </View>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadVehicles(true)} tintColor={Colors.primary} />}
        contentContainerStyle={vehicles.length ? styles.list : styles.emptyList}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.registration}>{item.registrationNumber}</Text>
              <Text style={styles.status}>Active</Text>
            </View>
            <Text style={styles.vehicleName}>{item.make || 'Vehicle'} {item.model || ''}</Text>
            <Text style={styles.details}>{item.year || 'Year unavailable'} {item.color ? `• ${item.color}` : ''}</Text>
            <Button title="View vehicle" variant="ghost" size="sm" onPress={() => router.push({ pathname: '/vehicle/[vrmcurr]', params: { vrmcurr: item.registrationNumber } })} style={styles.viewButton} />
          </View>
        )}
        ListEmptyComponent={<View><Text style={styles.emptyTitle}>No vehicles yet</Text><Text style={styles.muted}>Your vehicles will appear here once they are added to your account.</Text></View>}
      />
      </View>
    </PortalShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 16, paddingTop: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  eyebrow: { color: Colors.primary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  title: { color: Colors.charcoal, fontSize: 24, fontWeight: '900', marginTop: 4 },
  list: { gap: 16, paddingBottom: 24 },
  emptyList: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: Colors.card, borderRadius: 8, paddingVertical: 18, paddingHorizontal: 20, borderWidth: 1, borderColor: Colors.border },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  registration: { color: Colors.charcoal, fontSize: 20, fontWeight: '900' },
  status: { color: Colors.success, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  vehicleName: { color: Colors.text, fontSize: 16, fontWeight: '700', marginTop: 12 },
  details: { color: Colors.textSecondary, marginTop: 6 },
  viewButton: { alignSelf: 'flex-start', paddingHorizontal: 0, marginTop: 10 },
  muted: { color: Colors.textSecondary, textAlign: 'center', marginTop: 8 },
  emptyTitle: { color: Colors.charcoal, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  error: { color: Colors.error, marginBottom: 12 },
});
