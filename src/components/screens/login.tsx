import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormField, PrimaryButton } from '@/components/form';
import { StackHeader } from '@/components/screen-header';
import { Font, Palette } from '@/constants/design';
import { useAuth } from '@/context/auth-context';

/** Login screen — RN implementation used on Android and web. */
export default function LoginScreen() {
  const { signIn, busy } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
          <Text style={styles.title}>
            Bentornato su <Text style={styles.accent}>Ruzza</Text>
          </Text>

          <View style={styles.form}>
            <FormField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="mario@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <FormField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="La tua password"
              secureTextEntry
              autoComplete="password"
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <PrimaryButton label="Accedi" onPress={onSubmit} loading={busy} />

            <Text style={styles.switch} onPress={() => router.replace('/account/register')}>
              Non hai un account? <Text style={styles.switchLink}>Registrati</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 16, gap: 24 },
  title: { color: Palette.white, fontSize: 30, fontFamily: Font.sansMedium, paddingTop: 12 },
  accent: { color: Palette.blue, fontFamily: Font.serifItalic },
  form: { gap: 16 },
  error: {
    color: Palette.orange,
    fontSize: 14,
    fontFamily: Font.sansMedium,
    lineHeight: 20,
  },
  switch: {
    color: Palette.whiteMuted,
    fontSize: 14,
    fontFamily: Font.sans,
    textAlign: 'center',
    marginTop: 8,
  },
  switchLink: { color: Palette.white, fontFamily: Font.sansSemibold },
});
