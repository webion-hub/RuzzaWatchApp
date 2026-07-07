import { Host, HStack, Spacer } from '@expo/ui/swift-ui';
import { frame, glassEffect } from '@expo/ui/swift-ui/modifiers';
import { StyleSheet } from 'react-native';

export type GlassShape = 'capsule' | 'circle' | 'rectangle';

/**
 * A Liquid-Glass surface (iOS 26, real SwiftUI via `@expo/ui`). Render it as the
 * FIRST child of a rounded container whose own `backgroundColor` is transparent;
 * the RN content (icons / labels / Pressable) draws on top. `pointerEvents` is
 * disabled so touches fall through to the interactive RN content above it.
 *
 * The `.ios` variant uses `glassEffect`; the base `glass.tsx` renders a plain
 * translucent surface on Android / web.
 */
export function GlassSurface({
  shape = 'capsule',
  tint,
}: {
  shape?: GlassShape;
  tint?: string;
}) {
  return (
    <Host
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      colorScheme="dark"
      useViewportSizeMeasurement>
      <HStack
        modifiers={[
          frame({ maxWidth: 9999, maxHeight: 9999 }),
          glassEffect({
            glass: { variant: 'regular', ...(tint ? { tint } : {}) },
            shape,
          }),
        ]}>
        <Spacer />
      </HStack>
    </Host>
  );
}
