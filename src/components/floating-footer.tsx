/**
 * Pieces for the floating footer navigation (see Figma "Floating Tab").
 *
 * NOTE: `expo-router/ui` discovers tab screens by statically walking the JSX
 * children of `<Tabs>` for `<TabList>` / `<TabTrigger>` — it does NOT descend
 * into custom component boundaries. So the `<Tabs>`/`<TabList>`/`<TabTrigger>`
 * tree is assembled in `src/app/_layout.tsx`; this file only exports the
 * reusable tab button + shared styles.
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { forwardRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Font, Palette } from '@/constants/design';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Height reserved for the floating bar; add to `insets.bottom` for content padding. */
export const FLOATING_FOOTER_HEIGHT = 78;

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

type TabButtonProps = {
  /** Injected by TabTrigger via `asChild`. */
  isFocused?: boolean;
  onPress?: (event: unknown) => void;
  icon: IconName;
  iconActive: IconName;
  label: string;
  badge?: number;
};

export const TabButton = forwardRef<View, TabButtonProps>(function TabButton(
  { isFocused, onPress, icon, iconActive, label, badge, ...rest },
  ref,
) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      ref={ref}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.92, { duration: 120 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 });
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: !!isFocused }}
      accessibilityLabel={label}
      style={[styles.button, isFocused && styles.buttonActive, animatedStyle]}
      {...rest}>
      <View>
        <MaterialCommunityIcons
          name={isFocused ? iconActive : icon}
          size={24}
          color={Palette.white}
        />
        {badge != null && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText} numberOfLines={1}>
              {badge > 99 ? '99+' : badge}
            </Text>
          </View>
        )}
      </View>
      <Text
        style={[styles.label, { fontFamily: isFocused ? Font.sansMedium : Font.sans }]}
        numberOfLines={1}>
        {label}
      </Text>
    </AnimatedPressable>
  );
});

export const footerStyles = StyleSheet.create({
  // The tab pill (TabList). Leaves room on the right for the search circle.
  bar: {
    position: 'absolute',
    left: 16,
    right: 16 + 56 + 8,
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 100,
    padding: 4,
    backgroundColor: Palette.tabPill,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.16,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 10 },
      default: { boxShadow: '0 4px 16px rgba(0,0,0,0.16)' },
    }),
  },
  searchWrap: {
    position: 'absolute',
    right: 16,
    height: 64,
    justifyContent: 'center',
  },
  searchButton: {
    width: 56,
    height: 56,
    borderRadius: 100,
    backgroundColor: Palette.tabPill,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.16,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 10 },
      default: { boxShadow: '0 4px 16px rgba(0,0,0,0.16)' },
    }),
  },
});

const styles = StyleSheet.create({
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 100,
  },
  buttonActive: {
    backgroundColor: Palette.tabActive,
  },
  label: {
    fontSize: 12,
    color: Palette.white,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -12,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: Palette.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: Font.sansSemibold,
  },
});
