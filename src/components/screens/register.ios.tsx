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

/**
 * Register screen — iOS implementation using real SwiftUI via `@expo/ui/swift-ui`.
 * The RN StackHeader + marble background stay; the form itself is native SwiftUI
 * inside a `Host`.
 */
export default function RegisterScreen() {
  const { signUp, busy } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (!firstName || !email || !password) {
      setError('Compila nome, email e password.');
      return;
    }
    const { ok, errors } = await signUp({ firstName, lastName, email, password });
    if (ok) {
      router.back();
    } else {
      setError(
        errors.map((e) => e.message).join('\n') || 'Registrazione non riuscita.',
      );
    }
  };

  return (
    <View style={styles.container}>
      <StackHeader title="Crea account" />
      <Host style={styles.host}>
        <VStack alignment="leading" spacing={16} modifiers={[padding({ all: 24 })]}>
          <Text
            modifiers={[
              font({ family: 'GeneralSans-Semibold', size: 28 }),
              foregroundColor(Palette.white),
            ]}>
            Crea account
          </Text>

          <TextField
            placeholder="Nome"
            onTextChange={setFirstName}
            modifiers={[
              textFieldStyle('roundedBorder'),
              textInputAutocapitalization('words'),
            ]}
          />
          <TextField
            placeholder="Cognome"
            onTextChange={setLastName}
            modifiers={[
              textFieldStyle('roundedBorder'),
              textInputAutocapitalization('words'),
            ]}
          />
          <TextField
            placeholder="Email"
            onTextChange={setEmail}
            modifiers={[
              textFieldStyle('roundedBorder'),
              keyboardType('email-address'),
              textInputAutocapitalization('never'),
              autocorrectionDisabled(true),
            ]}
          />
          <SecureField
            placeholder="Password (min 5 caratteri)"
            onTextChange={setPassword}
            modifiers={[textFieldStyle('roundedBorder')]}
          />

          {error ? (
            <Text
              modifiers={[
                foregroundColor(Palette.orange),
                font({ size: 14, weight: 'medium' }),
              ]}>
              {error}
            </Text>
          ) : null}

          <Button
            onPress={onSubmit}
            modifiers={[
              buttonStyle('borderedProminent'),
              controlSize('large'),
              tint(Palette.blue),
              frame({ maxWidth: 9999 }),
              ...(busy ? [disabledModifier(true)] : []),
            ]}>
            <Text>{busy ? 'Attendere…' : 'Crea account'}</Text>
          </Button>

          <Button role="cancel" onPress={() => router.replace('/account/login')}>
            <Text modifiers={[foregroundColor(Palette.whiteMuted)]}>
              Hai già un account? Accedi
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
