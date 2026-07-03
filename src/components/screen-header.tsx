import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Font, Palette } from '@/constants/design';
import { useAuth } from '@/context/auth-context';

/** Back button + centered title, for stacked (non-tab) screens. */
export function StackHeader({ title }: { title: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[stackStyles.header, { paddingTop: insets.top + 4 }]}>
      <Pressable
        onPress={() => router.back()}
        style={stackStyles.back}
        accessibilityLabel="Indietro">
        <MaterialCommunityIcons name="chevron-left" size={26} color={Palette.white} />
      </Pressable>
      <Text style={stackStyles.title}>{title}</Text>
      <View style={stackStyles.back} />
    </View>
  );
}

const stackStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Palette.white,
    fontSize: 20,
    fontFamily: Font.sansSemibold,
  },
});

/** Page title + profile chip (tapping the chip opens the account screen). */
export function ScreenHeader({ title }: { title: string }) {
  const router = useRouter();
  const { customer, isLoggedIn } = useAuth();

  const initials =
    isLoggedIn && customer
      ? [customer.firstName?.[0], customer.lastName?.[0]]
          .filter(Boolean)
          .join('')
          .toUpperCase()
      : '';

  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <Pressable
        style={styles.chip}
        onPress={() => router.push('/account')}
        accessibilityLabel="Account">
        <LinearGradient
          colors={['#4b88ff', '#e95935']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {initials ? (
          <Text style={styles.initials}>{initials}</Text>
        ) : (
          <MaterialCommunityIcons name="account" size={22} color={Palette.white} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    color: Palette.white,
    fontSize: 32,
    fontFamily: Font.sansSemibold,
  },
  chip: {
    width: 53,
    height: 53,
    borderRadius: 100,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Palette.white,
    fontSize: 18,
    fontFamily: Font.sansSemibold,
  },
});
