import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { footerStyles, TabButton } from '@/components/floating-footer';
import { Palette } from '@/constants/design';
import { useCart } from '@/context/cart-context';

/**
 * Tab navigator with the custom floating footer. The <Tabs>/<TabList>/
 * <TabTrigger> tree must be assembled here directly — `expo-router/ui`
 * discovers screens by statically walking these children. The search circle is
 * a sibling of TabList (it isn't a route). Order: Carrello · Watch · Profumi.
 */
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { totalQuantity } = useCart();
  const bottom = Math.max(insets.bottom, 12);

  return (
    <Tabs>
      <TabSlot />

      <TabList style={[footerStyles.bar, { bottom }]}>
        <TabTrigger name="carrello" href="/carrello" asChild>
          <TabButton
            icon="basket-outline"
            iconActive="basket"
            label="Carrello"
            badge={totalQuantity}
          />
        </TabTrigger>

        <TabTrigger name="index" href="/" asChild>
          <TabButton icon="watch-variant" iconActive="watch" label="Watch" />
        </TabTrigger>

        <TabTrigger name="profumi" href="/profumi" asChild>
          <TabButton
            icon="bottle-tonic-outline"
            iconActive="bottle-tonic"
            label="Profumi"
          />
        </TabTrigger>
      </TabList>

      <View style={[footerStyles.searchWrap, { bottom }]} pointerEvents="box-none">
        <Pressable style={footerStyles.searchButton} accessibilityLabel="Cerca">
          <MaterialCommunityIcons name="magnify" size={24} color={Palette.white} />
        </Pressable>
      </View>
    </Tabs>
  );
}
