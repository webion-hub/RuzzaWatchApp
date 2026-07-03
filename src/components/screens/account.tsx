import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/form';
import { StackHeader } from '@/components/screen-header';
import { Font, Palette } from '@/constants/design';
import { useAuth } from '@/context/auth-context';

/** Account screen — RN implementation used on Android and web. */
export default function AccountScreen() {
  const { customer, isLoggedIn, loading, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StackHeader title="Account" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Palette.white} />
          </View>
        ) : isLoggedIn && customer ? (
          <LoggedIn
            name={customer.displayName}
            email={customer.email ?? ''}
            orders={customer.numberOfOrders}
            onLogout={signOut}
          />
        ) : (
          <Gate
            onLogin={() => router.push('/account/login')}
            onRegister={() => router.push('/account/register')}
          />
        )}
      </ScrollView>
    </View>
  );
}

function LoggedIn({
  name,
  email,
  orders,
  onLogout,
}: {
  name: string;
  email: string;
  orders: string;
  onLogout: () => void;
}) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <LinearGradient
            colors={['#4b88ff', '#e95935']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.avatarText}>{initials || '👤'}</Text>
        </View>
        <Text style={styles.name}>{name}</Text>
        {email ? <Text style={styles.email}>{email}</Text> : null}
      </View>

      <View style={styles.rows}>
        <InfoRow icon="email-outline" label="Email" value={email} />
        <InfoRow icon="receipt-text-outline" label="Ordini" value={orders} />
      </View>

      <Pressable
        onPress={onLogout}
        style={({ pressed }) => [styles.logout, pressed && styles.pressed]}>
        <MaterialCommunityIcons name="logout" size={18} color={Palette.orange} />
        <Text style={styles.logoutText}>Esci</Text>
      </Pressable>
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <MaterialCommunityIcons name={icon} size={20} color={Palette.whiteMuted} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Gate({
  onLogin,
  onRegister,
}: {
  onLogin: () => void;
  onRegister: () => void;
}) {
  return (
    <View style={styles.gate}>
      <Text style={styles.gateTitle}>
        Il tuo <Text style={styles.gateAccent}>account</Text>
      </Text>
      <Text style={styles.gateSub}>
        Crea un account Ruzza per salvare il carrello e completare gli acquisti.
      </Text>
      <View style={styles.gateButtons}>
        <PrimaryButton label="Crea account" onPress={onRegister} />
        <Pressable
          onPress={onLogin}
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
          <Text style={styles.secondaryText}>Ho già un account</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { paddingHorizontal: 24, paddingTop: 16, gap: 24 },
  center: { paddingTop: 80, alignItems: 'center' },

  hero: { alignItems: 'center', gap: 8, paddingTop: 24 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 100,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Palette.white, fontSize: 30, fontFamily: Font.sansSemibold },
  name: { color: Palette.white, fontSize: 24, fontFamily: Font.sansSemibold },
  email: { color: Palette.whiteMuted, fontSize: 14, fontFamily: Font.sans },

  rows: { gap: 4 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  infoLabel: { color: Palette.whiteMuted, fontSize: 16, fontFamily: Font.sans, flex: 1 },
  infoValue: { color: Palette.white, fontSize: 16, fontFamily: Font.sansMedium },

  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(233,89,53,0.5)',
  },
  logoutText: { color: Palette.orange, fontSize: 16, fontFamily: Font.sansSemibold },
  pressed: { opacity: 0.8 },

  gate: { paddingTop: 40, gap: 16 },
  gateTitle: { color: Palette.white, fontSize: 32, fontFamily: Font.sansMedium },
  gateAccent: { color: Palette.blue, fontFamily: Font.serifItalic, fontStyle: 'italic' },
  gateSub: { color: Palette.whiteMuted, fontSize: 16, lineHeight: 24, fontFamily: Font.sans },
  gateButtons: { gap: 12, marginTop: 16 },
  secondary: { paddingVertical: 16, alignItems: 'center' },
  secondaryText: { color: Palette.white, fontSize: 15, fontFamily: Font.sansMedium },
});
