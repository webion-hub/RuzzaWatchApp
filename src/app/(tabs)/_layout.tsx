import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';

import { Palette } from '@/constants/design';
import { useCart } from '@/context/cart-context';

/**
 * Native tab bar (`expo-router/unstable-native-tabs`) — a real UITabBar, so on
 * iOS 26 it renders with the system **Liquid Glass** material automatically (we
 * leave `backgroundColor` unset there so the glass shows through). Android has
 * no Liquid Glass, so we give it an opaque dark bar instead of a translucent one.
 *
 * Icons reuse the app's MaterialCommunityIcons via `VectorIcon`; labels use the
 * General Sans family. Order: Carrello · Watch · Profumi · Search.
 */
const { Icon, Label, Badge, VectorIcon } = NativeTabs.Trigger;

// Opaque dark bar on Android; undefined on iOS to keep the Liquid Glass material.
const androidBarColor = Platform.OS === 'android' ? '#262626' : undefined;

export default function TabsLayout() {
  const { totalQuantity } = useCart();

  return (
    <NativeTabs
      backgroundColor={androidBarColor}
      indicatorColor={Palette.tabPill}
      badgeBackgroundColor={Palette.orange}
      iconColor={{ default: Palette.whiteMuted, selected: Palette.white }}
      labelStyle={{
        default: { color: Palette.whiteMuted, fontFamily: 'GeneralSans-Medium' },
        selected: { color: Palette.white, fontFamily: 'GeneralSans-Medium' },
      }}>
      <NativeTabs.Trigger name="carrello">
        <Icon src={<VectorIcon family={MaterialCommunityIcons} name="basket" />} />
        <Label>Carrello</Label>
        {totalQuantity > 0 ? <Badge>{String(totalQuantity)}</Badge> : null}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="index">
        <Icon src={<VectorIcon family={MaterialCommunityIcons} name="watch" />} />
        <Label>Watch</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profumi">
        <Icon src={<VectorIcon family={MaterialCommunityIcons} name="bottle-tonic" />} />
        <Label>Profumi</Label>
      </NativeTabs.Trigger>

      {/* iOS 26: renders as the separate Liquid-Glass search circle */}
      <NativeTabs.Trigger name="search" role="search">
        <Icon src={<VectorIcon family={MaterialCommunityIcons} name="magnify" />} />
        <Label>Cerca</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
