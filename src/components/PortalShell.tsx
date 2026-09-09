import { ReactNode, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import TrulajuLogo from '../../assets/images/trulaju-logo.svg';

const navigation = [
  { label: 'Dashboard', path: '/' },
  { label: 'Vehicles', path: '/vehicles' },
  { label: 'Claims', path: '/claims' },
  { label: 'Trips', path: '/trips' },
  { label: 'Settings', path: '/settings' },
] as const;

export function PortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const logout = useAuthStore((state) => state.logout);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top, height: 64 + insets.top }]}>
        <TrulajuLogo width={120} height={30} />
        <TouchableOpacity onPress={() => setMenuOpen((open) => !open)} style={styles.iconButton} accessibilityLabel="Open account menu">
          <Ionicons name="person-circle-outline" size={25} color={Colors.charcoal} />
        </TouchableOpacity>
      </View>
      {menuOpen && (
        <View style={[styles.menu, { top: 64 + insets.top }]}>
          <TouchableOpacity onPress={() => { setMenuOpen(false); router.replace('/settings' as any); }} style={styles.menuItem}>
            <Text style={[styles.menuLabel, pathname === '/settings' && styles.activeMenuLabel]}>Settings</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity onPress={() => { setMenuOpen(false); void logout(); }} style={styles.menuItem}>
            <Text style={styles.logoutLabel}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.content}>{children}</View>
      <View style={[styles.bottomNavigation, { paddingBottom: Math.max(12, insets.bottom) }]}>
        {navigation.map((item) => {
          const active = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
          return (
            <TouchableOpacity key={item.path} onPress={() => router.replace(item.path as any)} style={styles.navItem} activeOpacity={0.7}>
              <View style={[styles.indicator, active && styles.activeIndicator]} />
              <Text style={[styles.navLabel, active && styles.activeLabel]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.card },
  logo: { color: Colors.charcoal, fontSize: 21, fontWeight: '900', letterSpacing: -0.5 },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  menu: { position: 'absolute', top: 64, right: 12, width: 170, zIndex: 10, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingVertical: 6, shadowColor: Colors.shadow, shadowOpacity: 1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
  menuItem: { paddingHorizontal: 18, paddingVertical: 14 },
  menuLabel: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  menuDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  logoutLabel: { color: Colors.error, fontSize: 14, fontWeight: '700' },
  activeMenuLabel: { color: Colors.primary, fontWeight: '800' },
  content: { flex: 1 },
  bottomNavigation: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.card, paddingTop: 8, paddingBottom: 12 },
  navItem: { flex: 1, alignItems: 'center', minHeight: 42 },
  indicator: { width: 22, height: 3, borderRadius: 2, backgroundColor: 'transparent', marginBottom: 7 },
  activeIndicator: { backgroundColor: Colors.primary },
  navLabel: { color: Colors.textSecondary, fontSize: 10, fontWeight: '600' },
  activeLabel: { color: Colors.charcoal, fontWeight: '800' },
});
