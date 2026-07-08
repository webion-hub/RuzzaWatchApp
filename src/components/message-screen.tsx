import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBackground } from '@/components/app-background';
import { Font, Palette } from '@/constants/design';

type Props = {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
  /** Optional secondary action (e.g. "Riprova"). */
  secondaryLabel?: string;
  onSecondary?: () => void;
};

/**
 * Full-screen branded fallback used by the global ErrorBoundary and the 404
 * route: dark marble background, a short message, and a way back to safety so
 * the user is never stranded on a blank/error screen.
 */
export function MessageScreen({
  title,
  message,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <AppBackground />
      <View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <TouchableOpacity style={styles.button} onPress={onAction} activeOpacity={0.85}>
          <Text style={styles.buttonLabel}>{actionLabel}</Text>
        </TouchableOpacity>

        {secondaryLabel && onSecondary ? (
          <TouchableOpacity style={styles.secondary} onPress={onSecondary} activeOpacity={0.7}>
            <Text style={styles.secondaryLabel}>{secondaryLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.bgBottom },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  title: {
    color: Palette.white,
    fontFamily: Font.serif,
    fontSize: 26,
    textAlign: 'center',
  },
  message: {
    color: Palette.whiteMuted,
    fontFamily: Font.sans,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    backgroundColor: Palette.white,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 100,
  },
  buttonLabel: {
    color: '#000000',
    fontFamily: Font.sansSemibold,
    fontSize: 14,
    letterSpacing: 1.2,
  },
  secondary: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  secondaryLabel: {
    color: Palette.whiteMuted,
    fontFamily: Font.sansMedium,
    fontSize: 14,
  },
});
