import { useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { CarouselCard } from '@/components/watch-cards';
import type { Product } from '@/lib/types';

const CARD_WIDTH = 260;
const SPACING = 16;
/** Full stride per item (card + gap). Each card lives in a wrapper of this width. */
const ITEM = CARD_WIDTH + SPACING;

/** Scale of the centered (active) card vs. the neighbours. */
const ACTIVE_SCALE = 1;
const SIDE_SCALE = 0.88;

function CarouselItem({
  product,
  index,
  scrollX,
}: {
  product: Product;
  index: number;
  scrollX: SharedValue<number>;
}) {
  // The list is centered, so item `i` is centered when scrollX === i * ITEM.
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * ITEM, index * ITEM, (index + 1) * ITEM];
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [SIDE_SCALE, ACTIVE_SCALE, SIDE_SCALE],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.6, 1, 0.6],
      Extrapolation.CLAMP,
    );
    return { transform: [{ scale }], opacity };
  });

  return (
    <Animated.View style={[{ width: ITEM, paddingHorizontal: SPACING / 2 }, animatedStyle]}>
      <CarouselCard product={product} />
    </Animated.View>
  );
}

/** Centered, snapping carousel that enlarges the card resting in the middle. */
export function WatchCarousel({ products }: { products: Product[] }) {
  const { width } = useWindowDimensions();
  const sidePad = Math.max((width - ITEM) / 2, 0);
  const initialIndex = Math.floor(products.length / 2);

  // Seed the scroll position so the initial centered card starts already zoomed.
  const scrollX = useSharedValue(initialIndex * ITEM);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  return (
    <Animated.FlatList
      data={products}
      keyExtractor={(item) => (item as Product).id}
      horizontal
      showsHorizontalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
      snapToInterval={ITEM}
      decelerationRate="fast"
      contentContainerStyle={{ paddingHorizontal: sidePad }}
      initialScrollIndex={initialIndex}
      getItemLayout={(_, index) => ({ length: ITEM, offset: ITEM * index, index })}
      renderItem={({ item, index }) => (
        <CarouselItem product={item as Product} index={index} scrollX={scrollX} />
      )}
    />
  );
}
