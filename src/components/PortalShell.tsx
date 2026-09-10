import { ReactNode, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import TrulajuLogo from '../../assets/images/trulaju-logo.svg';

const navigation = [
  { label: 'Dashboard', path: '/', icon: 'home-outline', activeIcon: 'home' },
  { label: 'Vehicles', path: '/vehicles', icon: 'car-sport-outline', activeIcon: 'car-sport' },
  { label: 'Claims', path: '/claims', icon: 'document-text-outline', activeIcon: 'document-text' },
  { label: 'Trips', path: '/trips', icon: 'navigate-outline', activeIcon: 'navigate' },
  { label: 'Settings', path: '/settings', icon: 'settings-outline', activeIcon: 'settings' },
] as const;

export function PortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase() || 'T';

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top, height: 60 + insets.top }]}>
        <TrulajuLogo width={112} height={28} />
        <TouchableOpacity onPress={() => setMenuOpen((open) => !open)} activeOpacity={0.75} accessibilityLabel="Open account menu">
          <LinearGradient colors={[Colors.secondary, Colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {menuOpen && (
        <>
          <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => setMenuOpen(false)} />
          <View style={[styles.menu, { top: 60 + insets.top + 8 }]}>
            <TouchableOpacity onPress={() => { setMenuOpen(false); router.replace('/settings' as any); }} style={styles.menuItem} activeOpacity={0.6}>
              <View style={styles.menuIconWrap}>
                <Ionicons name="settings-outline" size={16} color={Colors.charcoal} />
              </View>
              <Text style={[styles.menuLabel, pathname === '/settings' && styles.activeMenuLabel]}>Settings</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity onPress={() => { setMenuOpen(false); void logout(); }} style={styles.menuItem} activeOpacity={0.6}>
              <View style={[styles.menuIconWrap, styles.menuIconWrapDanger]}>
                <Ionicons name="log-out-outline" size={16} color={Colors.error} />
              </View>
              <Text style={styles.logoutLabel}>Logout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={styles.content}>{children}</View>

      <View style={[styles.bottomNavigation, { paddingBottom: Math.max(10, insets.bottom) }]}>
        {navigation.map((item) => {
          const active = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
          return (
            <TouchableOpacity key={item.path} onPress={() => router.replace(item.path as any)} style={styles.navItem} activeOpacity={0.7}>
              <View style={[styles.navIconWrap, active && styles.navIconWrapActive]}>
                <Ionicons name={active ? item.activeIcon : item.icon} size={19} color={active ? Colors.primary : Colors.textSecondary} />
              </View>
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    backgroundColor: Colors.card,
    shadowColor: Colors.charcoal,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    zIndex: 5,
  },
  avatar: { width: 36, height: 36, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.card },
  avatarText: { color: Colors.white, fontSize: 13, fontWeight: '900' },

  menuBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 8 },
  menu: {
    position: 'absolute',
    right: 14,
    width: 188,
    zIndex: 10,
    backgroundColor: Colors.card,
    borderRadius: 18,
    paddingVertical: 8,
    shadowColor: Colors.charcoal,
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 11 },
  menuIconWrap: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: `${Colors.charcoal}0D` },
  menuIconWrapDanger: { backgroundColor: `${Colors.error}14` },
  menuLabel: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  menuDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 4, marginHorizontal: 8 },
  logoutLabel: { color: Colors.error, fontSize: 14, fontWeight: '700' },
  activeMenuLabel: { color: Colors.primary },

  content: { flex: 1 },

  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    paddingTop: 10,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    shadowColor: Colors.charcoal,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, minHeight: 44 },
  navIconWrap: { width: 40, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  navIconWrapActive: { backgroundColor: `${Colors.primary}18` },
  navLabel: { color: Colors.textSecondary, fontSize: 10, fontWeight: '600' },
  activeLabel: { color: Colors.primary, fontWeight: '800' },
});
