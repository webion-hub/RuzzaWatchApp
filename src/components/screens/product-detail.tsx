import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductGallery } from '@/components/product-gallery';
import { GridCard } from '@/components/watch-cards';
import { Font, Palette, watchColorName } from '@/constants/design';
import { useCart } from '@/context/cart-context';
import { getCollectionProducts, getProductByHandle } from '@/lib/queries';
import type { Product } from '@/lib/types';

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
  const [addError, setAddError] = useState(false);

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
    setAddError(false);
    try {
      await addItem(variant.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch {
      setAddError(true);
    }
  }, [product, addItem]);

  const { height: windowHeight } = useWindowDimensions();
  const headerHeight = insets.top + 50;
  // The first block (image + name + price + button) fills the viewport below the
  // header, so the empty space falls AFTER the button and the description stays
  // below the fold — while the name→price gap stays moderate.
  const heroHeight = windowHeight - headerHeight;

  return (
    <View style={styles.container}>
      {/* Header ABOVE the image (in normal flow, not overlaying it) */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Indietro">
          <MaterialCommunityIcons name="chevron-left" size={26} color={Palette.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Dettaglio prodotto</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {loading ? (
          <View style={[styles.center, { paddingTop: 120 }]}>
            <ActivityIndicator size="large" color={Palette.white} />
          </View>
        ) : !product ? (
          <View style={[styles.center, styles.notFound, { paddingTop: 120 }]}>
            <Text style={styles.notFoundTitle}>Prodotto non trovato</Text>
            <Text style={styles.errorText}>
              {error ?? 'Questo prodotto non è disponibile o è stato rimosso.'}
            </Text>
            <Pressable
              style={styles.homeButton}
              onPress={() => router.replace('/')}
              accessibilityLabel="Torna alla home">
              <Text style={styles.homeButtonLabel}>TORNA ALLA HOME</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={{ minHeight: heroHeight }}>
              <ProductGallery images={product.images} fallback={product.featuredImage} />

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
              </View>

              <View style={styles.buyBlock}>
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

                {addError ? (
                  <Text style={styles.addErrorText}>
                    Impossibile aggiungere al carrello. Riprova.
                  </Text>
                ) : null}
              </View>
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
    textAlign: 'center',
    lineHeight: 22,
  },
  notFound: {
    paddingHorizontal: 32,
    gap: 12,
  },
  notFoundTitle: {
    color: Palette.white,
    fontFamily: Font.serif,
    fontSize: 24,
    textAlign: 'center',
  },
  homeButton: {
    backgroundColor: Palette.white,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 100,
    marginTop: 12,
  },
  homeButtonLabel: {
    color: '#000000',
    fontFamily: Font.sansSemibold,
    fontSize: 14,
    letterSpacing: 1.2,
  },
  addErrorText: {
    color: Palette.orange,
    fontFamily: Font.sans,
    fontSize: 13,
    textAlign: 'center',
  },

  // Header — sits above the image, blends with the dark background
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 100,
    backgroundColor: Palette.profileChip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: Palette.white,
    fontSize: 20,
    fontFamily: Font.sansSemibold,
  },

  // Featured — image + name at the top
  featured: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 32,
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
    textAlign: 'center',
  },
  // Buy block — price + add-to-cart, kept up near the name
  buyBlock: {
    paddingHorizontal: 16,
    gap: 20,
    marginTop: 56,
  },
  priceRow: {
    alignItems: 'center',
  },
  priceInt: {
    color: Palette.orange,
    fontSize: 40,
    fontFamily: Font.serifRegular,
    textAlign: 'center',
  },
  priceDec: {
    fontSize: 16,
    color: Palette.orange,
    fontFamily: Font.serifRegular,
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

  // Sections (start below the fold; the hero fill provides the large gap)
  section: {
    paddingHorizontal: 16,
    paddingTop: 40,
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
});
