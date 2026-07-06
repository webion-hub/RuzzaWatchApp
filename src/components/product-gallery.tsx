import { Image } from 'expo-image';
import { useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import type { ProductImage } from '@/lib/types';

/**
 * Horizontal, paging product image gallery with page dots (React Native).
 * Reused by the RN detail screen directly and embedded inside the SwiftUI
 * detail screen via `RNHostView` (remote images work reliably through expo-image).
 */
export function ProductGallery({
  images,
  fallback,
  width: fixedWidth,
}: {
  images: ProductImage[];
  fallback: ProductImage | null;
  /** Explicit page width (used when embedded in a Host where window width differs). */
  width?: number;
}) {
  const window = useWindowDimensions();
  const width = fixedWidth ?? window.width;
  const [index, setIndex] = useState(0);

  const list = images.length > 0 ? images : fallback ? [fallback] : [];
  if (list.length === 0) {
    return <View style={{ height: width, backgroundColor: '#fff' }} />;
  }

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
  dot: { height: 3, borderRadius: 100 },
  dotActive: { width: 15, backgroundColor: '#000' },
  dotInactive: { width: 5, backgroundColor: 'rgba(0,0,0,0.25)' },
});
