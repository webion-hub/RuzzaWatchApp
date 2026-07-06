import { Host } from '@expo/ui';
import { Button, SecureField, Text, TextField, VStack } from '@expo/ui/swift-ui';
import {
  autocorrectionDisabled,
  buttonStyle,
  controlSize,
  disabled as disabledModifier,
  font,
  foregroundColor,
  frame,
  keyboardType,
  multilineTextAlignment,
  padding,
  textFieldStyle,
  textInputAutocapitalization,
  tint,
} from '@expo/ui/swift-ui/modifiers';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { StackHeader } from '@/components/screen-header';
import { Palette } from '@/constants/design';
import { useAuth } from '@/context/auth-context';

/** Login screen — iOS implementation using SwiftUI via `@expo/ui/swift-ui`. */
export default function LoginScreen() {
  const { signIn, busy } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (!email || !password) {
      setError('Inserisci email e password.');
      return;
    }
    const { ok, errors } = await signIn(email, password);
    if (!ok) {
      setError(errors.map((e) => e.message).join('\n') || 'Accesso non riuscito.');
      return;
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      <StackHeader title="Accedi" />
      <Host style={styles.host}>
        <VStack alignment="center" spacing={16} modifiers={[padding({ all: 24 })]}>
          <Text
            modifiers={[
              font({ family: 'GeneralSans-Semibold', size: 28 }),
              foregroundColor(Palette.white),
              multilineTextAlignment('center'),
              frame({ maxWidth: 9999, alignment: 'center' }),
            ]}>
            Bentornato
          </Text>

          <TextField
            placeholder="Email"
            onTextChange={setEmail}
            modifiers={[
              textFieldStyle('roundedBorder'),
              keyboardType('email-address'),
              textInputAutocapitalization('never'),
              autocorrectionDisabled(true),
              frame({ maxWidth: 9999 }),
            ]}
          />
          <SecureField
            placeholder="Password"
            onTextChange={setPassword}
            modifiers={[textFieldStyle('roundedBorder'), frame({ maxWidth: 9999 })]}
          />

          {error ? (
            <Text
              modifiers={[
                foregroundColor(Palette.orange),
                font({ size: 14, weight: 'medium' }),
                multilineTextAlignment('center'),
                frame({ maxWidth: 9999, alignment: 'center' }),
              ]}>
              {error}
            </Text>
          ) : null}

          <Button
            onPress={onSubmit}
            modifiers={[
              buttonStyle('borderedProminent'),
              controlSize('large'),
              tint('#ffffff'),
              frame({ maxWidth: 9999 }),
              ...(busy ? [disabledModifier(true)] : []),
            ]}>
            <Text modifiers={[foregroundColor('#000000'), font({ family: 'GeneralSans-Semibold', size: 15 })]}>
              {busy ? 'Attendere…' : 'Accedi'}
            </Text>
          </Button>

          <Button role="cancel" onPress={() => router.replace('/account/register')}>
            <Text modifiers={[foregroundColor(Palette.whiteMuted)]}>
              Non hai un account? Registrati
            </Text>
          </Button>
        </VStack>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  host: { flex: 1 },
});
