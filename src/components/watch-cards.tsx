import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { accentColor, Font, Palette, watchColorName } from '@/constants/design';
import { formatPriceBadge } from '@/lib/format';
import type { Product } from '@/lib/types';

function PriceBadge({ product }: { product: Product }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>
        {formatPriceBadge(product.priceRange.minVariantPrice)}
      </Text>
    </View>
  );
}

function SoldOutBadge({ style }: { style?: object }) {
  return (
    <View style={[styles.soldOutBadge, style]}>
      <Text style={styles.soldOutText}>Esaurito</Text>
    </View>
  );
}

function useOpenProduct(handle: string) {
  const router = useRouter();
  return () =>
    router.push({ pathname: '/product/[handle]', params: { handle } });
}

/** Large carousel card — colored gradient, price badge (top), serif color name (bottom). */
export function CarouselCard({ product }: { product: Product }) {
  const color = watchColorName(product.title);
  const accent = accentColor(product.title);
  const onPress = useOpenProduct(product.handle);
  const soldOut = !product.availableForSale;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.carouselCard, pressed && styles.pressed]}>
      {product.featuredImage && (
        <Image
          source={product.featuredImage.url}
          style={[StyleSheet.absoluteFill, soldOut && styles.dimmed]}
          contentFit="cover"
          transition={200}
        />
      )}
      <LinearGradient
        colors={['transparent', 'transparent', accent]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      {soldOut && <SoldOutBadge style={styles.soldOutCarousel} />}
      <View style={styles.carouselContent}>
        <PriceBadge product={product} />
        <View style={styles.nameBlock}>
          <Text style={styles.eyebrowLarge}>Ruzza Watch</Text>
          <Text style={styles.carouselName}>{color}</Text>
        </View>
      </View>
    </Pressable>
  );
}

/** Grid card — white image tile with a price badge at bottom-left, name below. */
export function GridCard({ product }: { product: Product }) {
  const color = watchColorName(product.title);
  const onPress = useOpenProduct(product.handle);
  const soldOut = !product.availableForSale;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.gridCard, pressed && styles.pressed]}>
      <View style={styles.gridImageCard}>
        {product.featuredImage ? (
          <Image
            source={product.featuredImage.url}
            style={[StyleSheet.absoluteFill, soldOut && styles.dimmed]}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.gridPlaceholder]} />
        )}
        {soldOut && <SoldOutBadge style={styles.soldOutGrid} />}
        <PriceBadge product={product} />
      </View>
      <View style={styles.gridText}>
        <Text style={styles.eyebrowSmall}>Ruzza Watch</Text>
        <Text style={styles.gridName} numberOfLines={1}>
          {color}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
  dimmed: {
    opacity: 0.5,
  },
  soldOutBadge: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 73,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  soldOutText: {
    color: '#000',
    fontSize: 10,
    fontFamily: Font.sansSemibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  soldOutGrid: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  soldOutCarousel: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Palette.badgeBg,
    borderRadius: 73,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: Palette.white,
    fontSize: 10,
    fontFamily: Font.sansMedium,
  },

  // Carousel card
  carouselCard: {
    width: 270,
    height: 460,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Palette.cardWhite,
  },
  carouselContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameBlock: {
    gap: 8,
  },
  eyebrowLarge: {
    color: Palette.whiteMuted,
    fontSize: 16,
    fontFamily: Font.sansMedium,
  },
  carouselName: {
    color: Palette.white,
    fontSize: 32,
    lineHeight: 36,
    fontFamily: Font.serif,
  },

  // Grid card
  gridCard: {
    flex: 1,
    gap: 10,
  },
  gridImageCard: {
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 4,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    backgroundColor: Palette.cardWhite,
  },
  gridPlaceholder: {
    backgroundColor: '#e6e6e6',
  },
  gridText: {
    gap: 2,
  },
  eyebrowSmall: {
    color: Palette.whiteMuted,
    fontSize: 10,
    fontFamily: Font.sansMedium,
  },
  gridName: {
    color: Palette.white,
    fontSize: 14,
    fontFamily: Font.sansMedium,
  },
});
