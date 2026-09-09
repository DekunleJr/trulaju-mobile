import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { PortalShell } from '@/components/PortalShell';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { dashboardApi, DashboardInsight, DashboardPremium, DashboardSavings } from '@/api/dashboard';

const money = (value = 0) => `₦${value.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const number = (value = 0) => value.toLocaleString('en-NG', { maximumFractionDigits: 2 });

export default function HomeScreen() {
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const [insight, setInsight] = useState<DashboardInsight | null>(null);
  const [premiums, setPremiums] = useState<DashboardPremium[]>([]);
  const [savings, setSavings] = useState<DashboardSavings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (refresh = false) => {
    if (!user?.companyId) return;
    if (refresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const [nextInsight, nextPremiums] = await Promise.all([
        dashboardApi.getInsights(user.companyId),
        dashboardApi.getPremiums(),
      ]);
      setInsight(nextInsight);
      setPremiums(nextPremiums);
      try {
        const vehicleIds = nextPremiums.map((premium: any) => Number(premium.vehicleId)).filter(Boolean);
        setSavings(await dashboardApi.getSavings(vehicleIds, user.companyId));
      } catch {
        setSavings(null);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.errors?.[0] || err?.response?.data?.detail || err?.message || 'Unable to load dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.companyId]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  if (!isInitialized) return <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>;
  if (!isAuthenticated) return <View style={styles.center}><Text style={styles.title}>Trulaju</Text><Button title="Get started" onPress={() => router.push('/login')} style={styles.button} /></View>;

  const savingsTotal = savings?.company_total;
  return (
    <PortalShell>
      <ScrollView contentContainerStyle={styles.dashboard} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadDashboard(true)} tintColor={Colors.primary} />}>
        <Text style={styles.kicker}>Customer Portal</Text>
        <View style={styles.headingRow}>
          <Text style={styles.title}>Dashboard</Text>
          <View style={styles.headingActions}>
            <Button title="Fund Wallet" variant="outline" size="sm" onPress={() => router.push('/fund-wallet')} style={styles.actionButton} />
            <Button title="Add Vehicle" size="sm" onPress={() => router.push('/add-vehicle')} style={styles.actionButton} />
          </View>
        </View>
        <Text style={styles.subtitle}>Good to see you, {user?.firstName || 'there'}.</Text>
        <View style={styles.warning}><Text style={styles.warningText}><Text style={styles.warningStrong}>No premium mileage, no cover;</Text> when your available mileage is negative, any accident, incident or damage while driving will not be covered.</Text></View>
        {error && <Text style={styles.error}>{error}</Text>}
        {loading ? <View style={styles.loading}><ActivityIndicator color={Colors.primary} /><Text style={styles.muted}>Loading dashboard...</Text></View> : <>
          <View style={styles.statsGrid}>
            <Stat label="Total Fleet" value={number(insight?.fleetCount)} />
            <Stat label="Insured Vehicles" value={number(insight?.insuredVehicleCount)} />
            <Stat label="Uninsured Vehicles" value={number(insight?.uninsuredVehicleCount)} />
            <Stat label="Wallet Balance" value={money(insight?.walletBalance)} />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fleet Savings</Text>
            <View style={styles.savingsGrid}>
              <Metric label="Total Fleet Savings" value={money(savingsTotal?.expected_savings_naira_versus_maximum)} />
              <Metric label="Regular Insurance" value={money(savingsTotal?.max_annual_premium)} />
              <Metric label="Purchased Fleet Km" value={`${number(savingsTotal?.kilometers_purchased)}km`} />
              <Metric label="Used Fleet Km" value={`${number(savingsTotal?.used_km_since_cycle_start)}km`} />
            </View>
          </View>
          <View style={styles.section}>
            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Premium Overview</Text><Button title="Vehicles" variant="ghost" size="sm" onPress={() => router.push('/vehicles')} /></View>
            {premiums.length === 0 ? <Text style={styles.muted}>No premium data available.</Text> : premiums.slice(0, 10).map((premium, index) => <PremiumRow key={`${premium.premiumId || premium.vrmCurr}-${index}`} premium={premium} />)}
          </View>
        </>}
      </ScrollView>
    </PortalShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) { return <View style={styles.stat}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>; }
function Metric({ label, value }: { label: string; value: string }) { return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>; }
function PremiumRow({ premium }: { premium: DashboardPremium }) { return <View style={styles.premiumRow}><View><Text style={styles.registration}>{premium.vrmCurr || 'Vehicle'}</Text><Text style={styles.details}>{premium.vehicle?.makeName || ''} {premium.vehicle?.modelName || ''}</Text></View><View style={styles.premiumRight}><Text style={styles.status}>{premium.status || 'Pending'}</Text><Text style={styles.details}>{number(premium.normalizedMileage)}km used</Text></View></View>; }

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, padding: 24 },
  dashboard: { paddingHorizontal: 16, paddingTop: 32, paddingBottom: 32 },
  kicker: { color: Colors.primary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  title: { color: Colors.charcoal, fontSize: 24, fontWeight: '900', marginTop: 4 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 4 },
  headingActions: { flexDirection: 'row', gap: 8, flexShrink: 1 },
  actionButton: { minWidth: 0, paddingHorizontal: 10 },
  subtitle: { color: Colors.textSecondary, fontSize: 15, marginTop: 6 },
  button: { marginTop: 16, minWidth: 200 },
  warning: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, marginTop: 20, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 8 },
  warningIcon: { color: '#991B1B', fontSize: 16, fontWeight: '900', borderWidth: 1, borderColor: '#991B1B', borderRadius: 10, width: 20, height: 20, textAlign: 'center' },
  warningText: { flex: 1, color: '#991B1B', fontSize: 13, lineHeight: 19 },
  warningStrong: { fontWeight: '900' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 },
  stat: { width: '48%', minHeight: 92, padding: 14, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, backgroundColor: Colors.card },
  statLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' },
  statValue: { color: Colors.charcoal, fontSize: 20, fontWeight: '900', marginTop: 12 },
  section: { marginTop: 24, padding: 16, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, backgroundColor: Colors.card },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: Colors.charcoal, fontSize: 17, fontWeight: '900' },
  savingsGrid: { gap: 16, marginTop: 16 },
  metric: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12 },
  metricLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700' },
  metricValue: { color: Colors.charcoal, fontSize: 20, fontWeight: '900', marginTop: 6 },
  premiumRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, borderTopWidth: 1, borderTopColor: Colors.border, paddingVertical: 14 },
  registration: { color: Colors.primary, fontSize: 15, fontWeight: '800' },
  details: { color: Colors.textSecondary, fontSize: 12, marginTop: 5 },
  premiumRight: { alignItems: 'flex-end' },
  status: { color: Colors.success, fontSize: 12, fontWeight: '800' },
  loading: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  muted: { color: Colors.textSecondary, fontSize: 13 },
  error: { color: Colors.error, marginTop: 16 },
});
