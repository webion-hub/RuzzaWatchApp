import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Palette } from '@/constants/design';

/**
 * Full-screen dark background with the marble texture overlay, matching the
 * Figma design (dark #1a1a1a→black gradient + faint marble). Rendered once
 * behind the tab content.
 */
export function AppBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[Palette.bgTop, Palette.bgBottom]}
        style={StyleSheet.absoluteFill}
      />
      <Image
        source={require('@/assets/images/marble-bg.png')}
        style={[StyleSheet.absoluteFill, styles.marble]}
        contentFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  marble: {
    opacity: 0.16,
  },
});
