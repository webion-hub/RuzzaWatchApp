import { Host } from '@expo/ui';
import {
  Button,
  HStack,
  Image as SUIImage,
  RNHostView,
  ScrollView as SUIScrollView,
  Spacer,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import {
  buttonStyle,
  controlSize,
  disabled as disabledModifier,
  font,
  foregroundColor,
  frame,
  kerning,
  multilineTextAlignment,
  padding,
  tint,
} from '@expo/ui/swift-ui/modifiers';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView as RNScrollView,
  StyleSheet,
  Text as RNText,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/glass';
import { ProductGallery } from '@/components/product-gallery';
import { GridCard } from '@/components/watch-cards';
import { Font, Palette, watchColorName } from '@/constants/design';
import { formatDescription } from '@/lib/format';
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

/** Product detail — iOS implementation using SwiftUI via `@expo/ui/swift-ui`. */
export default function ProductDetailScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { addItem, mutating } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [p, all] = await Promise.all([
          getProductByHandle(handle),
          getCollectionProducts(),
        ]);
        if (!active) return;
        setProduct(p);
        setRelated(all.filter((x) => x.handle !== handle).slice(0, 8));
      } catch {
        // handled by empty state
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

  // Header bar height, and the hero that fills exactly the viewport below it so
  // the price + button sit at the bottom of the first screen (description below).
  const headerHeight = insets.top + 50;
  const heroHeight = height - headerHeight;
  const soldOut = !!product && !product.availableForSale;
  const price = product && priceParts(product.priceRange.minVariantPrice.amount);

  // Header ABOVE the images — solid (blends with the dark top), no overlap.
  const header = (
    <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
      <View style={styles.backButton}>
        <GlassSurface shape="circle" />
        <Pressable onPress={() => router.back()} style={styles.backTap} accessibilityLabel="Indietro">
          <MaterialCommunityIcons name="chevron-left" size={26} color={Palette.white} />
        </Pressable>
      </View>
      <RNText style={styles.headerTitle}>Dettaglio prodotto</RNText>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {header}
        <View style={[styles.center, { paddingTop: 120 }]}>
          <ActivityIndicator size="large" color={Palette.white} />
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        {header}
        <View style={styles.notFound}>
          <RNText style={styles.notFoundTitle}>Prodotto non trovato</RNText>
          <RNText style={styles.notFoundText}>
            Questo prodotto non è disponibile o è stato rimosso.
          </RNText>
          <Pressable style={styles.homeButton} onPress={() => router.replace('/')} accessibilityLabel="Torna alla home">
            <RNText style={styles.homeButtonLabel}>TORNA ALLA HOME</RNText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {header}
      <Host style={styles.host}>
          <SUIScrollView>
            <VStack alignment="leading" spacing={0} modifiers={[frame({ maxWidth: 9999, alignment: 'leading' })]}>
              {/* HERO — fills the viewport below the header: image + name on top,
                  price + button pinned to the bottom */}
              <VStack
                alignment="leading"
                spacing={0}
                modifiers={[frame({ maxWidth: 9999, height: heroHeight, alignment: 'top' })]}>
                {/* Images: FULL WIDTH (no padding) */}
                <RNHostView matchContents>
                  <ProductGallery
                    images={product.images}
                    fallback={product.featuredImage}
                    width={width}
                  />
                </RNHostView>

                {/* Name directly under the images */}
                <VStack
                  alignment="leading"
                  spacing={40}
                  modifiers={[frame({ maxWidth: 9999, alignment: 'leading' }), padding({ top: 20 })]}>
                  <HStack modifiers={[frame({ maxWidth: 9999 }), padding({ leading: 16, trailing: 16 })]}>
                    <Text modifiers={[foregroundColor(Palette.white), font({ size: 12 })]}>
                      Ruzza Watch
                    </Text>
                    <Spacer />
                    <Text modifiers={[foregroundColor(Palette.whiteMuted), font({ size: 12 })]}>
                      Ruzza Certificato
                    </Text>
                  </HStack>

                  <Text
                    modifiers={[
                      font({ family: 'LibreBaskerville-Medium', size: 32 }),
                      foregroundColor(Palette.white),
                      multilineTextAlignment('center'),
                      frame({ maxWidth: 9999, alignment: 'center' }),
                      padding({ leading: 16, trailing: 16 }),
                    ]}>
                    Ruzza Watch {watchColorName(product.title)}
                  </Text>
                </VStack>

                <Spacer />

                {/* Price + add-to-cart pinned to the bottom of the first screen */}
                <VStack
                  alignment="leading"
                  spacing={20}
                  modifiers={[frame({ maxWidth: 9999, alignment: 'leading' }), padding({ bottom: insets.bottom + 16 })]}>
                  <HStack
                    alignment="lastTextBaseline"
                    spacing={0}
                    modifiers={[frame({ maxWidth: 9999 }), padding({ leading: 16, trailing: 16 })]}>
                    <Spacer />
                    <Text modifiers={[font({ family: 'LibreBaskerville-Medium', size: 40 }), foregroundColor(Palette.orange)]}>
                      {price?.int}
                    </Text>
                    <Text modifiers={[font({ family: 'LibreBaskerville-Medium', size: 16 }), foregroundColor(Palette.orange)]}>
                      {price?.dec}
                    </Text>
                    <Spacer />
                  </HStack>

                  <Button
                    onPress={onAdd}
                    modifiers={[
                      buttonStyle('borderedProminent'),
                      controlSize('large'),
                      tint(soldOut ? 'rgba(255,255,255,0.18)' : '#ffffff'),
                      frame({ maxWidth: 9999 }),
                      ...(soldOut || mutating ? [disabledModifier(true)] : []),
                    ]}>
                    <Text
                      modifiers={[
                        foregroundColor(soldOut ? Palette.whiteMuted : '#000000'),
                        font({ family: 'GeneralSans-Semibold', size: 14 }),
                        kerning(1.44),
                        padding({ leading: 32, trailing: 32 }),
                      ]}>
                      {soldOut ? 'ESAURITO' : added ? 'AGGIUNTO ✓' : 'AGGIUNGI AL CARRELLO'}
                    </Text>
                  </Button>

                  {addError ? (
                    <Text
                      modifiers={[
                        foregroundColor(Palette.orange),
                        font({ size: 13 }),
                        multilineTextAlignment('center'),
                        frame({ maxWidth: 9999, alignment: 'center' }),
                        padding({ leading: 16, trailing: 16 }),
                      ]}>
                      Impossibile aggiungere al carrello. Riprova.
                    </Text>
                  ) : null}
                </VStack>
              </VStack>

              {/* ---- Below the fold ---- */}
              {product.description?.trim() ? (
                <VStack
                  alignment="leading"
                  spacing={12}
                  modifiers={[frame({ maxWidth: 9999 }), padding({ leading: 16, trailing: 16, top: 40 })]}>
                  <Text modifiers={[font({ family: 'GeneralSans-Medium', size: 24 }), foregroundColor(Palette.white)]}>
                    Descrizione
                  </Text>
                  <Text modifiers={[foregroundColor(Palette.white), font({ size: 16 })]}>
                    {formatDescription(product.description)}
                  </Text>
                </VStack>
              ) : null}

              {related.length > 0 ? (
                <VStack alignment="leading" spacing={16} modifiers={[frame({ maxWidth: 9999 }), padding({ top: 32 })]}>
                  <HStack alignment="top" modifiers={[frame({ maxWidth: 9999 }), padding({ leading: 16, trailing: 16 })]}>
                    <VStack alignment="leading" spacing={4}>
                      <HStack spacing={6}>
                        <Text modifiers={[font({ family: 'GeneralSans-Medium', size: 24 }), foregroundColor(Palette.white)]}>
                          Abbinamenti
                        </Text>
                        <Text modifiers={[font({ family: 'LibreBaskerville-MediumItalic', size: 24 }), foregroundColor(Palette.orange)]}>
                          unici
                        </Text>
                      </HStack>
                      <Text modifiers={[foregroundColor(Palette.whiteMuted), font({ size: 14 })]}>
                        Da non perdere
                      </Text>
                    </VStack>
                    <Spacer />
                    <HStack spacing={4}>
                      <Text modifiers={[foregroundColor(Palette.white), font({ size: 16 })]}>Scopri</Text>
                      <SUIImage systemName="arrow.right" size={14} color={Palette.white} />
                    </HStack>
                  </HStack>
                  <RNHostView matchContents>
                    <RNScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={rn.relatedRow}
                      style={{ width, height: 210 }}>
                      {related.map((item) => (
                        <View key={item.id} style={rn.relatedCard}>
                          <GridCard product={item} />
                        </View>
                      ))}
                    </RNScrollView>
                  </RNHostView>
                </VStack>
              ) : null}

              <Spacer modifiers={[frame({ height: insets.bottom + 40 })]} />
            </VStack>
          </SUIScrollView>
        </Host>
    </View>
  );
}

const rn = StyleSheet.create({
  relatedRow: { gap: 16, paddingLeft: 16, paddingRight: 16 },
  relatedCard: { width: 160 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  host: { flex: 1 },
  center: { flex: 1, alignItems: 'center' },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  notFoundTitle: {
    color: Palette.white,
    fontFamily: Font.serif,
    fontSize: 24,
    textAlign: 'center',
  },
  notFoundText: {
    color: Palette.whiteMuted,
    fontFamily: Font.sans,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 12,
  },
  homeButton: {
    backgroundColor: Palette.white,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 100,
  },
  homeButtonLabel: {
    color: '#000000',
    fontFamily: Font.sansSemibold,
    fontSize: 14,
    letterSpacing: 1.2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    color: Palette.white,
    fontSize: 20,
    fontFamily: Font.sansSemibold,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 100,
    backgroundColor: 'transparent',
  },
  backTap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
