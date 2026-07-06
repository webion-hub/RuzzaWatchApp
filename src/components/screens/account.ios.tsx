import { Host } from '@expo/ui';
import {
  Button,
  Divider,
  HStack,
  Image,
  Spacer,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import {
  buttonStyle,
  controlSize,
  font,
  foregroundColor,
  frame,
  multilineTextAlignment,
  padding,
  tint,
} from '@expo/ui/swift-ui/modifiers';
import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { StackHeader } from '@/components/screen-header';
import { Palette } from '@/constants/design';
import { useAuth } from '@/context/auth-context';

/** Account screen — iOS implementation using SwiftUI via `@expo/ui/swift-ui`. */
export default function AccountScreen() {
  const { customer, isLoggedIn, loading, signOut } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StackHeader title="Account" />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Palette.white} />
        </View>
      ) : (
        <Host style={styles.host}>
          {isLoggedIn && customer ? (
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
        </Host>
      )}
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
  return (
    <VStack spacing={20} modifiers={[padding({ all: 24 })]}>
      <VStack spacing={8} modifiers={[padding({ top: 12 })]}>
        <Image systemName="person.crop.circle.fill" size={88} color={Palette.blue} />
        <Text modifiers={[font({ family: 'GeneralSans-Semibold', size: 24 }), foregroundColor(Palette.white)]}>
          {name}
        </Text>
        {email ? (
          <Text modifiers={[foregroundColor(Palette.whiteMuted), font({ size: 14 })]}>
            {email}
          </Text>
        ) : null}
      </VStack>

      <VStack spacing={0} modifiers={[frame({ maxWidth: 9999 })]}>
        <InfoRow label="Email" value={email} />
        <Divider />
        <InfoRow label="Ordini" value={orders} />
      </VStack>

      <Button
        role="destructive"
        onPress={onLogout}
        modifiers={[buttonStyle('bordered'), controlSize('large'), tint(Palette.orange), frame({ maxWidth: 9999 })]}>
        <Text>Esci</Text>
      </Button>
    </VStack>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <HStack modifiers={[padding({ vertical: 16 }), frame({ maxWidth: 9999 })]}>
      <Text modifiers={[foregroundColor(Palette.whiteMuted), font({ size: 16 })]}>
        {label}
      </Text>
      <Spacer />
      <Text modifiers={[foregroundColor(Palette.white), font({ size: 16, weight: 'medium' })]}>
        {value}
      </Text>
    </HStack>
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
    <VStack alignment="center" spacing={16} modifiers={[padding({ leading: 24, trailing: 24, top: 40 })]}>
      <Text
        modifiers={[
          font({ family: 'GeneralSans-Medium', size: 32 }),
          foregroundColor(Palette.white),
          multilineTextAlignment('center'),
          frame({ maxWidth: 9999, alignment: 'center' }),
        ]}>
        Il tuo account
      </Text>
      <Text
        modifiers={[
          foregroundColor(Palette.whiteMuted),
          font({ size: 16 }),
          multilineTextAlignment('center'),
          frame({ maxWidth: 9999, alignment: 'center' }),
        ]}>
        Crea un account Ruzza per salvare il carrello e completare gli acquisti.
      </Text>
      <Button
        onPress={onRegister}
        modifiers={[buttonStyle('borderedProminent'), controlSize('large'), tint('#ffffff'), frame({ maxWidth: 9999 })]}>
        <Text modifiers={[foregroundColor('#000000'), font({ family: 'GeneralSans-Semibold', size: 15 })]}>
          Crea account
        </Text>
      </Button>
      <Button onPress={onLogin} modifiers={[frame({ maxWidth: 9999 })]}>
        <Text modifiers={[foregroundColor(Palette.white)]}>Ho già un account</Text>
      </Button>
    </VStack>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  host: { flex: 1 },
  center: { paddingTop: 80, alignItems: 'center' },
});
