import { Host } from '@expo/ui';
import {
  HStack,
  Image as SUIImage,
  RNHostView,
  ScrollView as SUIScrollView,
  Spacer,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import { font, foregroundColor, frame, padding } from '@expo/ui/swift-ui/modifiers';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FLOATING_FOOTER_HEIGHT } from '@/components/floating-footer';
import { ScreenHeader } from '@/components/screen-header';
import { GridCard } from '@/components/watch-cards';
import { WatchCarousel } from '@/components/watch-carousel';
import { Palette } from '@/constants/design';
import { isShopifyConfigured } from '@/lib/config';
import { getCollectionProducts } from '@/lib/queries';
import type { Product } from '@/lib/types';

/**
 * Watch — iOS implementation. SwiftUI shell (headers, layout, scroll) that
 * embeds the existing RN carousel and product grid via `RNHostView`, because
 * those rely on gradients and a scroll-linked scale animation that
 * `@expo/ui/swift-ui` cannot reproduce.
 */
export default function WatchScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setProducts(await getCollectionProducts());
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const bottomPad = insets.bottom + FLOATING_FOOTER_HEIGHT + 24;
  const empty = !loading && products.length === 0;

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title="Watch" />
      </View>

      <Host style={styles.host}>
        <SUIScrollView>
          <VStack alignment="leading" spacing={24} modifiers={[padding({ top: 8, bottom: bottomPad })]}>
            {/* "I nuovi Ruzza Watch" */}
            <HStack spacing={6} modifiers={[frame({ maxWidth: 9999 }), padding({ leading: 16, trailing: 16 })]}>
              <Text modifiers={[font({ family: 'GeneralSans-Medium', size: 24 }), foregroundColor(Palette.white)]}>
                I nuovi
              </Text>
              <Text modifiers={[font({ family: 'LibreBaskerville-MediumItalic', size: 24 }), foregroundColor(Palette.blue)]}>
                Ruzza Watch
              </Text>
              <Spacer />
              <Text modifiers={[foregroundColor(Palette.white), font({ size: 16 })]}>Vedili tutti</Text>
              <SUIImage systemName="arrow.right" size={14} color={Palette.white} />
            </HStack>

            {empty ? (
              <VStack spacing={8} modifiers={[frame({ maxWidth: 9999 }), padding({ horizontal: 16, top: 40 })]}>
                <Text modifiers={[font({ family: 'GeneralSans-Semibold', size: 20 }), foregroundColor(Palette.white)]}>
                  {!isShopifyConfigured ? 'Shopify non configurato' : error ? 'Errore di caricamento' : 'Nessun prodotto'}
                </Text>
                <Text modifiers={[foregroundColor(Palette.whiteMuted), font({ size: 14 })]}>
                  {!isShopifyConfigured
                    ? 'Aggiungi dominio e token Storefront nel file .env, poi riavvia.'
                    : (error ?? 'La collezione non contiene ancora prodotti.')}
                </Text>
              </VStack>
            ) : (
              <>
                {/* Carousel (RN — gradient + scroll-zoom animation) */}
                <RNHostView matchContents>
                  <View style={[styles.carouselWrap, { width }]}>
                    {products.length > 0 ? <WatchCarousel products={products} /> : null}
                  </View>
                </RNHostView>

                {/* Collection header (left-aligned) */}
                <VStack
                  alignment="leading"
                  spacing={8}
                  modifiers={[padding({ leading: 16, trailing: 16 }), frame({ maxWidth: 9999, alignment: 'leading' })]}>
                  <HStack spacing={6}>
                    <Text modifiers={[font({ family: 'GeneralSans-Medium', size: 24 }), foregroundColor(Palette.white)]}>
                      Ruzza
                    </Text>
                    <Text modifiers={[font({ family: 'LibreBaskerville-MediumItalic', size: 24 }), foregroundColor(Palette.blue)]}>
                      Watch Basic
                    </Text>
                  </HStack>
                  <HStack spacing={4}>
                    <Text modifiers={[font({ family: 'GeneralSans-Semibold', size: 14 }), foregroundColor(Palette.white)]}>
                      {String(products.length)}
                    </Text>
                    <Text modifiers={[foregroundColor(Palette.whiteMuted), font({ size: 14 })]}>pezzi unici</Text>
                  </HStack>
                </VStack>

                {/* Collection grid (RN) — only the first 6 */}
                <RNHostView matchContents>
                  <ProductGrid products={products.slice(0, 6)} width={width} />
                </RNHostView>
              </>
            )}
          </VStack>
        </SUIScrollView>
      </Host>

      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={Palette.white} />
        </View>
      )}
    </View>
  );
}

/** Approx. height of one grid card (image 150 + gap + 2 text lines). */
const GRID_CARD_HEIGHT = 200;
const GRID_ROW_GAP = 16;

/**
 * 2-column grid embedded in the SwiftUI scroll. Uses a non-scrolling FlatList
 * (which lays out reliably inside `RNHostView`, like the carousel) wrapped in a
 * View with an EXPLICIT height so `RNHostView matchContents` can measure it —
 * plain nested flex Views collapse/overlap here.
 */
function ProductGrid({ products, width }: { products: Product[]; width: number }) {
  const rowCount = Math.ceil(products.length / 2);
  const height =
    rowCount * GRID_CARD_HEIGHT + Math.max(0, rowCount - 1) * GRID_ROW_GAP + 8;
  return (
    <View style={{ width, height }}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        removeClippedSubviews={false}
        initialNumToRender={products.length}
        columnWrapperStyle={gridStyles.row}
        contentContainerStyle={gridStyles.content}
        renderItem={({ item }) => (
          <View style={gridStyles.cell}>
            <GridCard product={item} />
          </View>
        )}
      />
    </View>
  );
}

const gridStyles = StyleSheet.create({
  row: { gap: 16, paddingHorizontal: 16 },
  content: { gap: 16 },
  cell: { flex: 1, maxWidth: '50%' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  host: { flex: 1 },
  carouselWrap: { width: '100%', height: 480 },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
