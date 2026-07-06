import { Host } from '@expo/ui';
import { Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  font,
  foregroundColor,
  frame,
  multilineTextAlignment,
  padding,
} from '@expo/ui/swift-ui/modifiers';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette } from '@/constants/design';

/** Profumi placeholder — iOS implementation using SwiftUI via `@expo/ui/swift-ui`. */
export default function ProfumiScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Host style={styles.host}>
        <VStack spacing={12} modifiers={[frame({ maxWidth: 9999, maxHeight: 9999 }), padding({ all: 24 })]}>
          <Spacer />
          <Image systemName="sparkles" size={72} color={Palette.whiteMuted} />
          <Text modifiers={[font({ family: 'GeneralSans-Semibold', size: 28 }), foregroundColor(Palette.white)]}>
            Profumi
          </Text>
          <Text
            modifiers={[
              foregroundColor(Palette.whiteMuted),
              font({ size: 16 }),
              multilineTextAlignment('center'),
            ]}>
            La collezione profumi sta arrivando. Torna presto!
          </Text>
          <Spacer />
        </VStack>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  host: { flex: 1 },
});
