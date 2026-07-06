import { StyleSheet, View } from 'react-native';

import { Palette } from '@/constants/design';

export type GlassShape = 'capsule' | 'circle';

/**
 * Non-iOS fallback for {@link GlassSurface}: a plain translucent rounded surface
 * (no Liquid Glass — that requires SwiftUI on iOS 26). Matches the previous
 * `Palette.tabPill` look so Android / web keep their appearance.
 */
export function GlassSurface(_props: { shape?: GlassShape; tint?: string }) {
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.surface]}
    />
  );
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: Palette.tabPill,
    borderRadius: 100,
  },
});
