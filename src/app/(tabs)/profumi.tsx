import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FLOATING_FOOTER_HEIGHT } from '@/components/floating-footer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function ProfumiScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const bottomPad = insets.bottom + FLOATING_FOOTER_HEIGHT + Spacing.four;

  return (
    <ThemedView
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.four, paddingBottom: bottomPad },
      ]}>
      <View style={styles.center}>
        <MaterialCommunityIcons
          name="bottle-tonic-outline"
          size={72}
          color={theme.textSecondary}
        />
        <ThemedText type="subtitle" style={styles.title}>
          Profumi
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          La collezione profumi sta arrivando.{'\n'}Torna presto!
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  title: {
    marginTop: Spacing.two,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
  },
});
