import { Host } from '@expo/ui';
import { TextField, VStack } from '@expo/ui/swift-ui';
import {
  autocorrectionDisabled,
  frame,
  padding,
  submitLabel,
  textFieldStyle,
  textInputAutocapitalization,
} from '@expo/ui/swift-ui/modifiers';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text as RNText,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FLOATING_FOOTER_HEIGHT } from '@/components/floating-footer';
import { ScreenHeader } from '@/components/screen-header';
import { GridCard } from '@/components/watch-cards';
import { Font, Palette, watchColorName } from '@/constants/design';
import { getCollectionProducts } from '@/lib/queries';
import type { Product } from '@/lib/types';

/**
 * Search — iOS implementation. A SwiftUI (`@expo/ui`) search field over a native
 * React-Native results grid. The grid is a plain `FlatList` (not embedded via
 * `RNHostView`) so a result count that changes as you type lays out and scrolls
 * correctly. Reached from the search tab (the Liquid-Glass magnifier).
 */
export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
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
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title="Cerca" />
      </View>

      {/* SwiftUI search field */}
      <Host style={styles.fieldHost} matchContents={{ vertical: true }}>
        <VStack modifiers={[padding({ leading: 16, trailing: 16, top: 4, bottom: 12 })]}>
          <TextField
            placeholder="Cerca un Ruzza Watch…"
            onTextChange={setQuery}
            modifiers={[
              textFieldStyle('roundedBorder'),
              submitLabel('search'),
              autocorrectionDisabled(true),
              textInputAutocapitalization('never'),
              frame({ maxWidth: 9999 }),
            ]}
          />
        </VStack>
      </Host>

      {/* Native results grid */}
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
            <RNText style={styles.empty}>
              {hasQuery
                ? `Nessun risultato per “${query.trim()}”.`
                : 'Inizia a scrivere per cercare.'}
            </RNText>
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
  fieldHost: { height: 56 },
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
