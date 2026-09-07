import { StyleSheet, Text, View } from 'react-native';
import { PortalShell } from '@/components/PortalShell';
import { Colors } from '@/constants/colors';

export function PortalSection({ title, description }: { title: string; description: string }) {
  return (
    <PortalShell>
      <View style={styles.container}>
        <Text style={styles.kicker}>Customer Portal</Text>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Coming next</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>
    </PortalShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 32, backgroundColor: Colors.background },
  kicker: { color: Colors.primary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  title: { color: Colors.charcoal, fontSize: 24, fontWeight: '900', marginTop: 5 },
  card: { backgroundColor: Colors.surface, borderRadius: 8, padding: 20, marginTop: 24, borderWidth: 1, borderColor: Colors.border },
  cardTitle: { color: Colors.charcoal, fontSize: 17, fontWeight: '800' },
  description: { color: Colors.textSecondary, lineHeight: 22, marginTop: 8 },
});
