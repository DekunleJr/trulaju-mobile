import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/Button';
import { PortalShell } from '@/components/PortalShell';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { dashboardApi, DashboardInsight, DashboardPremium, DashboardSavings } from '@/api/dashboard';

const money = (value = 0) => `₦${value.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const number = (value = 0) => value.toLocaleString('en-NG', { maximumFractionDigits: 2 });

const STATUS_STYLES: Record<string, { bg: string; fg: string; tint: string }> = {
  active: { bg: `${Colors.success}1F`, fg: Colors.success, tint: Colors.success },
  approved: { bg: `${Colors.success}1F`, fg: Colors.success, tint: Colors.success },
  pending: { bg: `${Colors.warning}26`, fg: '#B45309', tint: Colors.warning },
  declined: { bg: `${Colors.error}1F`, fg: Colors.error, tint: Colors.error },
  expired: { bg: `${Colors.error}1F`, fg: Colors.error, tint: Colors.error },
  insured: { bg: `${Colors.success}1F`, fg: Colors.success, tint: Colors.success },
  uninsured: { bg: `${Colors.error}1F`, fg: Colors.error, tint: Colors.error },
  'not insured': { bg: `${Colors.error}1F`, fg: Colors.error, tint: Colors.error },
};
const statusStyle = (status?: string) => STATUS_STYLES[(status || '').toLowerCase()] || { bg: `${Colors.charcoal}14`, fg: Colors.textSecondary, tint: Colors.charcoalLight };

const INFO_BLUE = { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF', strong: '#1E3A8A' };

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
  const firstName = user?.firstName || 'there';
  const initial = (user?.firstName?.charAt(0) || 'T').toUpperCase();

  return (
    <PortalShell>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.dashboard} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadDashboard(true)} tintColor={Colors.primary} />} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Hi {firstName} 👋</Text>
              <Text style={styles.subtitle}>Here's how your fleet is doing today.</Text>
            </View>
            <LinearGradient colors={[Colors.secondary, Colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </LinearGradient>
          </View>

          {/* Wallet hero card */}
          <LinearGradient colors={['#2E2E2E', Colors.charcoal, '#0A0A0A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.walletCard}>
            <Ionicons name="car-sport" size={150} color={Colors.white} style={styles.walletWatermark} />
            <View style={styles.walletTopRow}>
              <View style={styles.walletIconBadge}>
                <Ionicons name="wallet-outline" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.walletLabel}>Wallet Balance</Text>
            </View>
            <Text style={styles.walletValue}>{loading ? '···' : money(insight?.walletBalance)}</Text>
            <View style={styles.walletActions}>
              <Button title="Fund Wallet" size="sm" onPress={() => router.push('/fund-wallet')} style={styles.walletPrimaryAction} />
              <Button title="Add Vehicle" variant="outline" size="sm" onPress={() => router.push('/add-vehicle')} style={styles.walletOutlineAction} textStyle={styles.walletOutlineActionText} />
            </View>
          </LinearGradient>

          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="close-circle" size={16} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={Colors.primary} />
              <Text style={styles.muted}>Loading dashboard...</Text>
            </View>
          ) : (
            <>
              {/* Fleet snapshot */}
              <Text style={styles.groupLabel}>Fleet Snapshot</Text>
              <View style={styles.statsGrid}>
                <Stat icon="car-sport" tint={Colors.primary} label="Total Fleet" value={number(insight?.fleetCount)} />
                <Stat icon="checkmark-circle" tint={Colors.success} label="Insured" value={number(insight?.insuredVehicleCount)} />
                <Stat icon="close-circle" tint={Colors.error} label="Uninsured" value={number(insight?.uninsuredVehicleCount)} />
              </View>

              {/* Mileage note */}
              <View style={styles.info}>
                <Text style={styles.infoText}>
                  <Text style={styles.infoStrong}>No premium mileage, no cover. </Text>
                  When your available mileage is negative, any accident, incident or damage while driving will not be covered.
                </Text>
              </View>

              {/* Fleet savings */}
              <View style={styles.section}>
                <LinearGradient colors={['#34B075', Colors.success, '#1F7A4D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.savingsBanner}>
                  <View style={styles.sectionTitleRow}>
                    <View style={styles.savingsIconBadge}>
                      <Ionicons name="trending-up" size={16} color={Colors.white} />
                    </View>
                    <Text style={styles.savingsBannerTitle}>Fleet Savings</Text>
                  </View>
                  <Text style={styles.savingsHero}>{money(savingsTotal?.expected_savings_naira_versus_maximum)}</Text>
                  <Text style={styles.savingsHeroLabel}>Total saved vs. regular insurance</Text>
                </LinearGradient>
                <View style={styles.savingsGrid}>
                  <Metric label="Regular Insurance" value={money(savingsTotal?.max_annual_premium)} />
                  <Metric label="Purchased Km" value={`${number(savingsTotal?.kilometers_purchased)}km`} />
                  <Metric label="Used Km" value={`${number(savingsTotal?.used_km_since_cycle_start)}km`} />
                </View>
              </View>

              {/* Premium overview */}
              <View style={styles.section}>
                <View style={styles.premiumSectionInner}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                      <LinearGradient colors={[`${Colors.primary}55`, `${Colors.primary}12`]} style={styles.sectionIconBadge}>
                        <Ionicons name="document-text-outline" size={16} color={Colors.primary} />
                      </LinearGradient>
                      <Text style={styles.sectionTitle}>Premium Overview</Text>
                    </View>
                    <Button title="View all" variant="ghost" size="sm" onPress={() => router.push('/vehicles')} />
                  </View>
                  {premiums.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Ionicons name="folder-open-outline" size={22} color={Colors.textLight} />
                      <Text style={styles.muted}>No premium data available.</Text>
                    </View>
                  ) : (
                    <View style={styles.premiumList}>
                      {premiums.slice(0, 10).map((premium, index) => (
                        <PremiumRow key={`${premium.premiumId || premium.vrmCurr}-${index}`} premium={premium} />
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </PortalShell>
  );
}

function Stat({ icon, tint, label, value }: { icon: keyof typeof Ionicons.glyphMap; tint: string; label: string; value: string }) {
  return (
    <View style={[styles.stat, { backgroundColor: `${tint}12`, borderColor: `${tint}33` }]}>
      <LinearGradient colors={[`${tint}4D`, `${tint}14`]} style={styles.statIconBadge}>
        <Ionicons name={icon} size={18} color={tint} />
      </LinearGradient>
      <Text style={[styles.statValue, { color: tint }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: tint }]}>{label}</Text>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function PremiumRow({ premium }: { premium: DashboardPremium }) {
  const s = statusStyle(premium.status);
  return (
    <View style={[styles.premiumRow, { backgroundColor: `${s.tint}12`, borderColor: `${s.tint}33` }]}>
      <View style={[styles.premiumAvatar, { backgroundColor: `${s.tint}22` }]}>
        <Ionicons name="car-outline" size={16} color={s.tint} />
      </View>
      <View style={styles.premiumInfo}>
        <Text style={styles.registration}>{premium.vrmCurr || 'Vehicle'}</Text>
        <Text style={styles.details}>{premium.vehicle?.makeName || ''} {premium.vehicle?.modelName || ''}</Text>
      </View>
      <View style={styles.premiumRight}>
        <Text style={[styles.status, { color: s.fg }]}>{premium.status || 'Pending'}</Text>
        <Text style={styles.details}>{number(premium.normalizedMileage)}km used</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, padding: 24 },
  screen: { flex: 1, backgroundColor: Colors.surface },
  dashboard: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { color: Colors.charcoal, fontSize: 25, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { color: Colors.textSecondary, fontSize: 13.5, marginTop: 4 },
  avatar: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.white, fontSize: 18, fontWeight: '900' },
  title: { color: Colors.charcoal, fontSize: 24, fontWeight: '900' },
  button: { marginTop: 16, minWidth: 200 },

  // Wallet hero
  walletCard: {
    marginTop: 18,
    padding: 20,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: Colors.charcoal,
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  walletWatermark: { position: 'absolute', bottom: -30, right: -26, opacity: 0.05, transform: [{ rotate: '-18deg' }] },
  walletTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  walletIconBadge: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(212,165,0,0.18)' },
  walletLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: '700' },
  walletValue: { color: Colors.white, fontSize: 34, fontWeight: '900', marginTop: 14, letterSpacing: -0.5 },
  walletActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  walletPrimaryAction: { flex: 1 },
  walletOutlineAction: { flex: 1, borderColor: 'rgba(255,255,255,0.35)' },
  walletOutlineActionText: { color: Colors.white },

  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, padding: 12, borderRadius: 12, backgroundColor: `${Colors.error}12` },
  errorText: { color: Colors.error, fontSize: 13, fontWeight: '600', flex: 1 },

  groupLabel: { color: Colors.charcoal, fontSize: 13, fontWeight: '800', marginTop: 26, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.6 },

  statsGrid: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, minHeight: 108, padding: 14, borderRadius: 16, borderWidth: 1 },
  statIconBadge: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 19, fontWeight: '900', marginTop: 12 },
  statLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700', marginTop: 2 },

  info: { padding: 14, marginTop: 18, backgroundColor: INFO_BLUE.bg, borderRadius: 14, borderLeftWidth: 3, borderLeftColor: INFO_BLUE.border },
  infoText: { color: INFO_BLUE.text, fontSize: 13, lineHeight: 19 },
  infoStrong: { fontWeight: '900', color: INFO_BLUE.strong },

  section: { marginTop: 20, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', shadowColor: Colors.shadow, shadowOpacity: 1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  premiumSectionInner: { padding: 18 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionIconBadge: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { color: Colors.charcoal, fontSize: 16, fontWeight: '900' },

  savingsBanner: { padding: 18 },
  savingsIconBadge: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.2)' },
  savingsBannerTitle: { color: Colors.white, fontSize: 16, fontWeight: '900' },
  savingsHero: { color: Colors.white, fontSize: 30, fontWeight: '900', marginTop: 16, letterSpacing: -0.5 },
  savingsHeroLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  savingsGrid: { flexDirection: 'row', gap: 14, padding: 18 },
  metric: { flex: 1 },
  metricLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700' },
  metricValue: { color: Colors.charcoal, fontSize: 15, fontWeight: '900', marginTop: 6 },

  emptyState: { alignItems: 'center', gap: 8, paddingVertical: 28 },

  premiumList: { gap: 10, marginTop: 14 },
  premiumRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: 1, padding: 12 },
  premiumAvatar: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  premiumInfo: { flex: 1 },
  registration: { color: Colors.charcoal, fontSize: 15, fontWeight: '800' },
  details: { color: Colors.textSecondary, fontSize: 12, marginTop: 3 },
  premiumRight: { alignItems: 'flex-end', gap: 5 },
  status: { fontSize: 12, fontWeight: '800' },

  loading: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  muted: { color: Colors.textSecondary, fontSize: 13 },
  error: { color: Colors.error, marginTop: 16 },
});
