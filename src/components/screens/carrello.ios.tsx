import { Host } from '@expo/ui';
import {
  Button,
  Divider,
  HStack,
  Image as SUIImage,
  RNHostView,
  ScrollView as SUIScrollView,
  Spacer,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import {
  background,
  buttonStyle,
  controlSize,
  font,
  foregroundColor,
  frame,
  lineLimit,
  padding,
  refreshable,
  shapes,
  tint,
} from '@expo/ui/swift-ui/modifiers';
import { Image as ExpoImage } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FLOATING_FOOTER_HEIGHT } from '@/components/floating-footer';
import { ScreenHeader } from '@/components/screen-header';
import { Font, Palette, watchColorName } from '@/constants/design';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import { getOrders } from '@/lib/customer';
import { formatPriceBadge } from '@/lib/format';
import type { CartLine, Order } from '@/lib/types';

type Tab = 'carrello' | 'ordini';

/** Carrello — iOS implementation. RN header + tabs; content in SwiftUI (`Host`). */
export default function CarrelloScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('carrello');
  const { customer, isLoggedIn } = useAuth();
  const ordersCount = isLoggedIn ? Number(customer?.numberOfOrders ?? 0) : 0;

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader title="Carrello" />
        <View style={styles.tabs}>
          <RNTab label="Carrello" active={tab === 'carrello'} onPress={() => setTab('carrello')} />
          <RNTab
            label="Ordini"
            badge={ordersCount}
            active={tab === 'ordini'}
            onPress={() => setTab('ordini')}
          />
        </View>
      </View>
      {tab === 'carrello' ? <CartTab /> : <OrdersTab />}
    </View>
  );
}

/* --------------------------- RN tab switcher ------------------------------ */

function RNTab({
  label,
  active,
  badge,
  onPress,
}: {
  label: string;
  active: boolean;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.tabButton}>
      <View style={styles.tabLabelRow}>
        <RNText style={[styles.tabLabel, active ? styles.tabActive : styles.tabInactive]}>
          {label}
        </RNText>
        {badge != null && badge > 0 && (
          <View style={styles.tabBadge}>
            <RNText style={styles.tabBadgeText}>{badge}</RNText>
          </View>
        )}
      </View>
      {active && <View style={styles.tabUnderline} />}
    </Pressable>
  );
}

/* ------------------------------- Cart tab --------------------------------- */

function CartTab() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cart, loading, updateItem, removeItem, refresh } = useCart();
  const { isLoggedIn } = useAuth();
  const lines = cart?.lines ?? [];
  const bottomPad = insets.bottom + FLOATING_FOOTER_HEIGHT + 24;

  const onCheckout = useCallback(async () => {
    if (!isLoggedIn) {
      router.push('/account');
      return;
    }
    if (!cart?.checkoutUrl) return;
    await WebBrowser.openBrowserAsync(cart.checkoutUrl);
    await refresh();
  }, [isLoggedIn, cart?.checkoutUrl, router, refresh]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Palette.white} />
      </View>
    );
  }

  return (
    <Host style={styles.host}>
      <SUIScrollView modifiers={[refreshable(refresh)]}>
        <VStack
          alignment="leading"
          spacing={16}
          modifiers={[padding({ leading: 16, trailing: 16, top: 24, bottom: bottomPad })]}>
          <HStack spacing={6} modifiers={[frame({ maxWidth: 9999 })]}>
            <Text modifiers={[font({ family: 'GeneralSans-Medium', size: 24 }), foregroundColor(Palette.white)]}>
              Il tuo
            </Text>
            <Text modifiers={[font({ family: 'LibreBaskerville-MediumItalic', size: 24 }), foregroundColor(Palette.blue)]}>
              carrello
            </Text>
            <Spacer />
            <SUIImage systemName="arrow.right" color={Palette.white} />
          </HStack>

          {lines.length === 0 ? (
            <VStack spacing={12} modifiers={[frame({ maxWidth: 9999 }), padding({ top: 80 })]}>
              <SUIImage systemName="cart" size={56} color={Palette.whiteMuted} />
              <Text modifiers={[foregroundColor(Palette.whiteMuted), font({ size: 16 })]}>
                Il carrello è vuoto
              </Text>
            </VStack>
          ) : (
            <>
              <Text modifiers={[foregroundColor(Palette.whiteMuted), font({ size: 14 })]}>
                {cart?.totalQuantity} {cart?.totalQuantity === 1 ? 'articolo' : 'articoli'}
              </Text>

              {lines.map((line) => (
                <CartItemRow
                  key={line.id}
                  line={line}
                  onChange={(q) => (q <= 0 ? removeItem(line.id) : updateItem(line.id, q))}
                />
              ))}

              <Divider />

              <SummaryRow label="Articoli" value={`${cart?.totalQuantity} Qtà`} />
              <SummaryRow label="Subtotale" value={formatPriceBadge(cart?.cost.subtotalAmount)} />
              <SummaryRow label="Spedizione" value="Standard - Gratis" />
              <SummaryRow label="Totale" value={formatPriceBadge(cart?.cost.totalAmount)} emphasized />

              <Divider />

              <Button
                onPress={onCheckout}
                modifiers={[
                  buttonStyle('borderedProminent'),
                  controlSize('large'),
                  tint('#ffffff'),
                  frame({ maxWidth: 9999 }),
                ]}>
                <HStack spacing={10}>
                  <Text modifiers={[foregroundColor('#000000'), font({ family: 'GeneralSans-Semibold', size: 16 })]}>
                    Vai al pagamento
                  </Text>
                  <Divider modifiers={[frame({ height: 18 })]} />
                  <SUIImage systemName="apple.logo" size={16} color="#000000" />
                  <Text modifiers={[foregroundColor('#000000'), font({ family: 'GeneralSans-Semibold', size: 16 })]}>
                    Pay
                  </Text>
                </HStack>
              </Button>

              {!isLoggedIn ? (
                <Text
                  modifiers={[
                    foregroundColor(Palette.whiteMuted),
                    font({ size: 13 }),
                    frame({ maxWidth: 9999, alignment: 'center' }),
                  ]}>
                  Crea un account per completare l&apos;acquisto.
                </Text>
              ) : null}
            </>
          )}
        </VStack>
      </SUIScrollView>
    </Host>
  );
}

function CartItemRow({
  line,
  onChange,
}: {
  line: CartLine;
  onChange: (quantity: number) => void;
}) {
  const name = watchColorName(line.merchandise.product.title);
  const description = line.merchandise.product.description?.trim();
  const imageUrl = line.merchandise.image?.url;
  const price = formatPriceBadge(line.cost.totalAmount);

  return (
    <HStack alignment="top" spacing={16} modifiers={[frame({ maxWidth: 9999 })]}>
      <RNHostView matchContents>
        <CartItemImage imageUrl={imageUrl} price={price} />
      </RNHostView>

      <VStack alignment="leading" spacing={2} modifiers={[frame({ maxWidth: 9999 })]}>
        <Text modifiers={[foregroundColor(Palette.whiteMuted), font({ size: 12 })]}>Ruzza Watch</Text>
        <Text modifiers={[foregroundColor(Palette.white), font({ size: 20, weight: 'medium' })]}>
          {name}
        </Text>
        {description ? (
          <Text
            modifiers={[
              foregroundColor(Palette.whiteMuted),
              font({ size: 14 }),
              lineLimit(3),
              padding({ top: 4 }),
            ]}>
            {description}
          </Text>
        ) : null}

        <HStack modifiers={[padding({ top: 8 }), frame({ maxWidth: 9999 })]}>
          <Spacer />
          <QuantityControl quantity={line.quantity} onChange={onChange} />
        </HStack>
      </VStack>
    </HStack>
  );
}

/** White image tile (rounded) with a black price badge overlaid at bottom-left. */
function CartItemImage({ imageUrl, price }: { imageUrl?: string; price: string }) {
  return (
    <View style={rnStyles.itemImage}>
      {imageUrl ? (
        <ExpoImage source={imageUrl} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, rnStyles.itemPlaceholder]} />
      )}
      <View style={rnStyles.itemBadge}>
        <RNText style={rnStyles.itemBadgeText}>{price}</RNText>
      </View>
    </View>
  );
}

/** Collapsed "Qtà n ›" white pill that expands into a −/+ stepper (design-accurate). */
function QuantityControl({
  quantity,
  onChange,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button onPress={() => setOpen(true)} modifiers={[buttonStyle('plain')]}>
        <Text
          modifiers={[
            foregroundColor('#000000'),
            font({ family: 'GeneralSans-Medium', size: 14 }),
            padding({ leading: 14, trailing: 14, top: 8, bottom: 8 }),
            background('#ffffff', shapes.capsule()),
          ]}>
          {`Qtà ${quantity}  ›`}
        </Text>
      </Button>
    );
  }

  return (
    <HStack
      spacing={18}
      modifiers={[padding({ leading: 16, trailing: 16, top: 8, bottom: 8 }), background('#ffffff', shapes.capsule())]}>
      {/* Trash on the LEFT removes the item from the cart entirely */}
      <Button onPress={() => onChange(0)} modifiers={[buttonStyle('plain')]}>
        <SUIImage systemName="trash" size={16} color="#000000" />
      </Button>
      <Text modifiers={[foregroundColor('#000000'), font({ family: 'GeneralSans-Medium', size: 16 })]}>
        {quantity}
      </Text>
      {/* Plus on the RIGHT increases the quantity */}
      <Button onPress={() => onChange(quantity + 1)} modifiers={[buttonStyle('plain')]}>
        <SUIImage systemName="plus" size={16} color="#000000" />
      </Button>
    </HStack>
  );
}

function SummaryRow({
  label,
  value,
  emphasized,
}: {
  label: string;
  value?: string;
  emphasized?: boolean;
}) {
  const size = emphasized ? 28 : 18;
  return (
    <HStack modifiers={[frame({ maxWidth: 9999 })]}>
      <Text
        modifiers={[
          foregroundColor(emphasized ? Palette.white : Palette.whiteMuted),
          font({ size, weight: emphasized ? 'semibold' : 'regular' }),
        ]}>
        {label}
      </Text>
      <Spacer />
      <Text
        modifiers={[
          foregroundColor(emphasized ? Palette.white : Palette.whiteMuted),
          font({ size, weight: emphasized ? 'semibold' : 'regular' }),
        ]}>
        {value}
      </Text>
    </HStack>
  );
}

/* ------------------------------ Orders tab -------------------------------- */

const FULFILLMENT_LABEL: Record<string, string> = {
  FULFILLED: 'Consegnato',
  IN_PROGRESS: 'In lavorazione',
  ON_HOLD: 'In attesa',
  OPEN: 'Aperto',
  PARTIALLY_FULFILLED: 'Parzialmente spedito',
  PENDING_FULFILLMENT: 'In preparazione',
  RESTOCKED: 'Rimborsato',
  SCHEDULED: 'Programmato',
  UNFULFILLED: 'In preparazione',
};

function OrdersTab() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isLoggedIn, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const firstLoad = useRef(true);
  const bottomPad = insets.bottom + FLOATING_FOOTER_HEIGHT + 24;

  const load = useCallback(
    async (withSpinner: boolean) => {
      if (!token) {
        setOrders([]);
        return;
      }
      if (withSpinner) setLoading(true);
      try {
        setOrders(await getOrders(token));
      } catch {
        // ignore — keep whatever we have
      } finally {
        if (withSpinner) setLoading(false);
      }
    },
    [token],
  );

  useFocusEffect(
    useCallback(() => {
      load(firstLoad.current);
      firstLoad.current = false;
    }, [load]),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Palette.white} />
      </View>
    );
  }

  return (
    <Host style={styles.host}>
      <SUIScrollView modifiers={[refreshable(() => load(false))]}>
        <VStack
          alignment="leading"
          spacing={12}
          modifiers={[padding({ leading: 16, trailing: 16, top: 24, bottom: bottomPad })]}>
          <HStack spacing={6} modifiers={[frame({ maxWidth: 9999 })]}>
            <Text modifiers={[font({ family: 'GeneralSans-Medium', size: 24 }), foregroundColor(Palette.white)]}>
              Tutti i tuoi
            </Text>
            <Text modifiers={[font({ family: 'LibreBaskerville-MediumItalic', size: 24 }), foregroundColor(Palette.blue)]}>
              ordini
            </Text>
            <Spacer />
            <SUIImage systemName="arrow.right" color={Palette.white} />
          </HStack>

          {!isLoggedIn ? (
            <VStack spacing={12} modifiers={[frame({ maxWidth: 9999 }), padding({ top: 64 })]}>
              <SUIImage systemName="doc.text" size={56} color={Palette.whiteMuted} />
              <Text modifiers={[foregroundColor(Palette.whiteMuted), font({ size: 16 })]}>
                Accedi per vedere i tuoi ordini.
              </Text>
              <Button
                onPress={() => router.push('/account')}
                modifiers={[buttonStyle('borderedProminent'), controlSize('large'), tint('#ffffff')]}>
                <Text modifiers={[foregroundColor('#000000'), font({ family: 'GeneralSans-Semibold', size: 15 })]}>
                  Accedi
                </Text>
              </Button>
            </VStack>
          ) : orders.length === 0 ? (
            <VStack spacing={12} modifiers={[frame({ maxWidth: 9999 }), padding({ top: 64 })]}>
              <SUIImage systemName="doc.text" size={56} color={Palette.whiteMuted} />
              <Text modifiers={[foregroundColor(Palette.whiteMuted), font({ size: 16 })]}>
                Non hai ancora effettuato ordini.
              </Text>
            </VStack>
          ) : (
            orders.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </VStack>
      </SUIScrollView>
    </Host>
  );
}

function OrderCard({ order }: { order: Order }) {
  const date = new Date(order.processedAt).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const status = FULFILLMENT_LABEL[order.fulfillmentStatus] ?? 'In preparazione';
  const itemsCount = order.lineItems.reduce((n, li) => n + li.quantity, 0);

  return (
    <VStack alignment="leading" spacing={6} modifiers={[frame({ maxWidth: 9999 }), padding({ vertical: 8 })]}>
      <HStack modifiers={[frame({ maxWidth: 9999 })]}>
        <Text modifiers={[foregroundColor(Palette.white), font({ size: 16, weight: 'semibold' })]}>
          Ordine #{order.orderNumber}
        </Text>
        <Spacer />
        <Text modifiers={[foregroundColor(Palette.blue), font({ size: 12, weight: 'semibold' })]}>
          {status}
        </Text>
      </HStack>
      <Text modifiers={[foregroundColor(Palette.whiteMuted), font({ size: 13 })]}>{date}</Text>
      <HStack modifiers={[frame({ maxWidth: 9999 })]}>
        <Text modifiers={[foregroundColor(Palette.whiteMuted), font({ size: 13 })]}>
          {itemsCount} {itemsCount === 1 ? 'articolo' : 'articoli'}
        </Text>
        <Spacer />
        <Text modifiers={[foregroundColor(Palette.white), font({ size: 18, weight: 'semibold' })]}>
          {formatPriceBadge(order.currentTotalPrice)}
        </Text>
      </HStack>
      <Divider />
    </VStack>
  );
}

const rnStyles = StyleSheet.create({
  itemImage: {
    width: 132,
    height: 132,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Palette.cardWhite,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 8,
  },
  itemPlaceholder: { backgroundColor: '#e6e6e6' },
  itemBadge: {
    backgroundColor: Palette.badgeBg,
    borderRadius: 73,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  itemBadgeText: { color: Palette.white, fontSize: 10, fontFamily: Font.sansMedium },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  host: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  tabs: {
    flexDirection: 'row',
    gap: 24,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  tabButton: { paddingBottom: 12 },
  tabLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tabLabel: { fontSize: 18, fontFamily: Font.sansMedium },
  tabActive: { color: Palette.white },
  tabInactive: { color: Palette.whiteMuted },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: { color: Palette.white, fontSize: 11, fontFamily: Font.sansSemibold },
  tabUnderline: { height: 2, borderRadius: 2, backgroundColor: Palette.white },
});
