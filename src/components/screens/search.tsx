import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FLOATING_FOOTER_HEIGHT } from '@/components/floating-footer';
import { ScreenHeader } from '@/components/screen-header';
import { GridCard } from '@/components/watch-cards';
import { Font, Palette, watchColorName } from '@/constants/design';
import { getCollectionProducts } from '@/lib/queries';
import type { Product } from '@/lib/types';

/** Search — RN implementation (Android / web): text field + live-filtered grid. */
export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const all = await getCollectionProducts();
        if (active) setProducts(all);
      } catch {
        // handled by the empty state
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        watchColorName(p.title).toLowerCase().includes(q),
    );
  }, [query, products]);

  const bottomPad = insets.bottom + FLOATING_FOOTER_HEIGHT + 24;
  const hasQuery = query.trim().length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Cerca" />
      <TextInput
        style={styles.field}
        placeholder="Cerca un Ruzza Watch…"
        placeholderTextColor={Palette.whiteMuted}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <GridCard product={item} />
          </View>
        )}
        ListEmptyComponent={
          loading ? null : (
            <Text style={styles.empty}>
              {hasQuery
                ? `Nessun risultato per “${query.trim()}”.`
                : 'Inizia a scrivere per cercare.'}
            </Text>
          )
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
  container: { flex: 1, backgroundColor: 'transparent' },
  field: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: Palette.white,
    fontSize: 16,
    fontFamily: Font.sans,
  },
  row: { gap: 16, paddingHorizontal: 16 },
  content: { gap: 16, paddingTop: 4 },
  cell: { flex: 1, maxWidth: '50%' },
  empty: {
    color: Palette.whiteMuted,
    fontSize: 15,
    fontFamily: Font.sans,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
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
});
