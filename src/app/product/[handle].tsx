import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GridCard } from '@/components/watch-cards';
import { Font, Palette, watchColorName } from '@/constants/design';
import { useCart } from '@/context/cart-context';
import { getCollectionProducts, getProductByHandle } from '@/lib/queries';
import type { Product, ProductImage } from '@/lib/types';

function priceParts(amount: string) {
  const n = Number(amount);
  const int = Math.floor(n);
  const dec = Math.round((n - int) * 100)
    .toString()
    .padStart(2, '0');
  return { int: `€${int.toLocaleString('it-IT')}`, dec: `,${dec}` };
}

function defaultVariant(product: Product) {
  return product.variants.find((v) => v.availableForSale) ?? product.variants[0];
}

export default function ProductDetailScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addItem, mutating } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [p, all] = await Promise.all([
          getProductByHandle(handle),
          getCollectionProducts(),
        ]);
        if (!active) return;
        setProduct(p);
        setRelated(all.filter((x) => x.handle !== handle).slice(0, 8));
      } catch (err) {
        if (active) setError((err as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [handle]);

  const onAdd = useCallback(async () => {
    if (!product || !product.availableForSale) return;
    const variant = defaultVariant(product);
    if (!variant) return;
    try {
      await addItem(variant.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch {
      // surfaced via cart context
    }
  }, [product, addItem]);

  const headerHeight = insets.top + 52;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {loading ? (
          <View style={[styles.center, { paddingTop: headerHeight + 120 }]}>
            <ActivityIndicator size="large" color={Palette.white} />
          </View>
        ) : !product ? (
          <View style={[styles.center, { paddingTop: headerHeight + 120 }]}>
            <Text style={styles.errorText}>
              {error ?? 'Prodotto non trovato.'}
            </Text>
          </View>
        ) : (
          <>
            <Gallery images={product.images} fallback={product.featuredImage} />

            <View style={styles.featured}>
              <View style={styles.eyebrowRow}>
                <Text style={styles.eyebrow}>Ruzza Watch</Text>
                <Text style={[styles.eyebrow, styles.eyebrowMuted]}>
                  Ruzza Certificato
                </Text>
              </View>

              <Text style={styles.title}>
                Ruzza Watch {watchColorName(product.title)}
              </Text>

              <View style={styles.priceRow}>
                <Text style={styles.priceInt}>
                  {priceParts(product.priceRange.minVariantPrice.amount).int}
                  <Text style={styles.priceDec}>
                    {priceParts(product.priceRange.minVariantPrice.amount).dec}
                  </Text>
                </Text>
              </View>

              <Pressable
                onPress={onAdd}
                disabled={mutating || !product.availableForSale}
                style={({ pressed }) => [
                  styles.addButton,
                  !product.availableForSale && styles.addButtonDisabled,
                  pressed && product.availableForSale && styles.addButtonPressed,
                ]}>
                {mutating ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text
                    style={[
                      styles.addButtonText,
                      !product.availableForSale && styles.addButtonTextDisabled,
                    ]}>
                    {!product.availableForSale
                      ? 'ESAURITO'
                      : added
                        ? 'AGGIUNTO ✓'
                        : 'AGGIUNGI AL CARRELLO'}
                  </Text>
                )}
              </Pressable>
            </View>

            {product.description?.trim().length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Descrizione</Text>
                <Text style={styles.descText}>{product.description.trim()}</Text>
              </View>
            )}

            {related.length > 0 && (
              <View style={styles.section}>
                <View style={styles.abbinamentiHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>
                      Abbinamenti <Text style={styles.sectionTitleAccent}>unici</Text>
                    </Text>
                    <Text style={styles.abbinamentiSub}>Da non perdere</Text>
                  </View>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.relatedRow}>
                  {related.map((item) => (
                    <View key={item.id} style={styles.relatedCard}>
                      <GridCard product={item} />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Fixed header */}
      <View style={[styles.header, { paddingTop: insets.top + 4, height: headerHeight }]}>
        <LinearGradient
          colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Indietro">
          <MaterialCommunityIcons name="chevron-left" size={26} color={Palette.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Dettaglio prodotto</Text>
        <View style={styles.backButton} />
      </View>
    </View>
  );
}

function Gallery({
  images,
  fallback,
}: {
  images: ProductImage[];
  fallback: ProductImage | null;
}) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const list = images.length > 0 ? images : fallback ? [fallback] : [];
  if (list.length === 0) return <View style={{ height: width, backgroundColor: '#fff' }} />;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={{ width, height: width }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}>
        {list.map((img, i) => (
          <Image
            key={`${img.url}-${i}`}
            source={img.url}
            style={{ width, height: width, backgroundColor: '#fff' }}
            contentFit="cover"
            transition={200}
          />
        ))}
      </ScrollView>
      {list.length > 1 && (
        <View style={styles.dots}>
          {list.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: Palette.whiteMuted,
    fontFamily: Font.sans,
    fontSize: 16,
  },

  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 100,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: Palette.white,
    fontSize: 20,
    fontFamily: Font.sansSemibold,
  },

  // Featured
  featured: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 24,
  },
  eyebrowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    color: Palette.white,
    fontSize: 12,
    letterSpacing: 1,
    fontFamily: Font.sans,
  },
  eyebrowMuted: {
    opacity: 0.5,
  },
  title: {
    color: Palette.white,
    fontSize: 32,
    lineHeight: 40,
    fontFamily: Font.serif,
    letterSpacing: 0.34,
  },
  priceRow: {
    marginTop: 4,
  },
  priceInt: {
    color: Palette.orange,
    fontSize: 40,
    fontFamily: Font.serif,
  },
  priceDec: {
    fontSize: 16,
    color: Palette.orange,
    fontFamily: Font.serif,
  },
  addButton: {
    backgroundColor: Palette.white,
    borderRadius: 100,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonPressed: {
    opacity: 0.85,
  },
  addButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  addButtonText: {
    color: '#000',
    fontSize: 14,
    letterSpacing: 1.44,
    fontFamily: Font.sansSemibold,
  },
  addButtonTextDisabled: {
    color: Palette.whiteMuted,
  },

  // Sections
  section: {
    paddingHorizontal: 16,
    paddingTop: 32,
    gap: 16,
  },
  sectionTitle: {
    color: Palette.white,
    fontSize: 24,
    fontFamily: Font.sansMedium,
  },
  sectionTitleAccent: {
    color: Palette.orange,
    fontFamily: Font.serifItalic,
    fontStyle: 'italic',
  },
  descText: {
    color: Palette.white,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Font.sans,
  },
  abbinamentiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  abbinamentiSub: {
    color: Palette.whiteMuted,
    fontSize: 14,
    fontFamily: Font.sans,
    marginTop: 8,
  },
  relatedRow: {
    gap: 16,
    paddingRight: 16,
  },
  relatedCard: {
    width: 160,
  },

  // Gallery dots
  dots: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
  },
  dot: {
    height: 3,
    borderRadius: 100,
  },
  dotActive: {
    width: 15,
    backgroundColor: '#000',
  },
  dotInactive: {
    width: 5,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
});
