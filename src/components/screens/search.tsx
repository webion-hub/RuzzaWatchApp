import { Stack } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FLOATING_FOOTER_HEIGHT } from '@/components/floating-footer';
import { GridCard } from '@/components/watch-cards';
import { Font, Palette, watchColorName } from '@/constants/design';
import { getCollectionProducts } from '@/lib/queries';
import type { Product } from '@/lib/types';

/**
 * Search — uses the NATIVE iOS search bar wired into the search tab's header
 * (`headerSearchBarOptions`, backed by `UISearchController` via react-native-
 * screens). Typing in it filters the product grid live. The header/Stack that
 * hosts the search bar is `src/app/(tabs)/search/_layout.tsx`.
 */
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
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Cerca',
          headerSearchBarOptions: {
            placeholder: 'Cerca un Ruzza Watch…',
            onChangeText: (e) => setQuery(e.nativeEvent.text),
            autoCapitalize: 'none',
            hideWhenScrolling: false,
            textColor: Palette.white,
            headerIconColor: Palette.white,
            tintColor: Palette.blue,
          },
        }}
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
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
                : 'Cerca tra i Ruzza Watch.'}
            </Text>
          )
        }
      />
      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={Palette.white} />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  row: { gap: 16, paddingHorizontal: 16 },
  content: { gap: 16, paddingTop: 12 },
  cell: { flex: 1, maxWidth: '50%' },
  empty: {
    color: Palette.whiteMuted,
    fontSize: 15,
    fontFamily: Font.sans,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
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
