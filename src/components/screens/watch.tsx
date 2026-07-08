import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FLOATING_FOOTER_HEIGHT } from '@/components/floating-footer';
import { ScreenHeader } from '@/components/screen-header';
import { GridCard } from '@/components/watch-cards';
import { WatchCarousel } from '@/components/watch-carousel';
import { Font, Palette } from '@/constants/design';
import { isShopifyConfigured } from '@/lib/config';
import { getCollectionProducts } from '@/lib/queries';
import type { Product } from '@/lib/types';

export default function WatchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const bottomPad = insets.bottom + FLOATING_FOOTER_HEIGHT + 24;

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => <GridCard product={item} />}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: bottomPad },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Palette.white}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Header */}
            <ScreenHeader title="Watch" />

            {/* Novità header */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitleSans}>
                I nuovi <Text style={styles.sectionTitleSerif}>Ruzza Watch</Text>
              </Text>
              <Pressable style={styles.linkRow} onPress={() => router.navigate('/search')}>
                <Text style={styles.linkText}>Vedili tutti</Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={16}
                  color={Palette.white}
                />
              </Pressable>
            </View>

            {/* Carousel */}
            <View style={styles.carouselWrap}>
              {products.length > 0 && <WatchCarousel products={products} />}
            </View>

            {/* Collection header */}
            <View style={styles.collectionHeader}>
              <Text style={styles.sectionTitleSans}>
                Ruzza <Text style={styles.sectionTitleSerif}>Watch Basic</Text>
              </Text>
              <View style={styles.statRow}>
                <Text style={styles.statNumber}>{products.length}</Text>
                <Text style={styles.statLabel}>pezzi unici</Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.stateBox}>
              <Text style={styles.stateTitle}>
                {!isShopifyConfigured
                  ? 'Shopify non configurato'
                  : error
                    ? 'Errore di caricamento'
                    : 'Nessun prodotto'}
              </Text>
              <Text style={styles.stateDetail}>
                {!isShopifyConfigured
                  ? 'Aggiungi il dominio e il token Storefront nel file .env, poi riavvia il server.'
                  : (error ?? 'La collezione non contiene ancora prodotti.')}
              </Text>
            </View>
          ) : null
        }
      />

      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={Palette.white} />
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
  content: {
    gap: 16,
  },
  row: {
    gap: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  pageTitle: {
    color: Palette.white,
    fontSize: 32,
    fontFamily: Font.sansSemibold,
  },
  profileChip: {
    width: 53,
    height: 53,
    borderRadius: 100,
    backgroundColor: Palette.profileChip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitleSans: {
    color: Palette.white,
    fontSize: 24,
    fontFamily: Font.sansMedium,
  },
  sectionTitleSerif: {
    color: Palette.blue,
    fontSize: 24,
    fontFamily: Font.serifItalic,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    color: Palette.white,
    fontSize: 16,
    fontFamily: Font.sansMedium,
  },
  carouselWrap: {
    marginBottom: 140,
  },
  collectionHeader: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    color: Palette.white,
    fontSize: 14,
    fontFamily: Font.sansSemibold,
  },
  statLabel: {
    color: Palette.whiteMuted,
    fontSize: 14,
    fontFamily: Font.sans,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateBox: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 24,
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  stateTitle: {
    color: Palette.white,
    fontSize: 20,
    fontFamily: Font.sansSemibold,
  },
  stateDetail: {
    color: Palette.whiteMuted,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Font.sans,
  },
});
