import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
          <TabButton
            label="Carrello"
            active={tab === 'carrello'}
            onPress={() => setTab('carrello')}
          />
          <TabButton
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

/** Shared bottom padding so content clears the floating footer. */
function useBottomPad() {
  const insets = useSafeAreaInsets();
  return insets.bottom + FLOATING_FOOTER_HEIGHT + 24;
}

function TabButton({
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
        <Text
          style={[
            styles.tabLabel,
            active ? styles.tabLabelActive : styles.tabLabelInactive,
          ]}>
          {label}
        </Text>
        {badge != null && badge > 0 && (
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
      {active && <View style={styles.tabUnderline} />}
    </Pressable>
  );
}

/* ------------------------------- Cart tab -------------------------------- */

function CartTab() {
  const { cart, loading, updateItem, removeItem, refresh } = useCart();
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const bottomPad = useBottomPad();
  const [checkingOut, setCheckingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const lines = cart?.lines ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const onCheckout = useCallback(async () => {
    // Purchasing requires an account, so route guests to sign up / sign in.
    if (!isLoggedIn) {
      router.push('/account');
      return;
    }
    if (!cart?.checkoutUrl) return;
    setCheckingOut(true);
    try {
      // Shopify's hosted checkout (handles payment, incl. Apple/Google Pay).
      await WebBrowser.openBrowserAsync(cart.checkoutUrl);
      // Returning from checkout: the order may have completed — sync the cart.
      await refresh();
    } finally {
      setCheckingOut(false);
    }
  }, [isLoggedIn, cart?.checkoutUrl, router, refresh]);

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: 80 }]}>
        <ActivityIndicator size="large" color={Palette.white} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.tabContent, { paddingBottom: bottomPad }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Palette.white}
        />
      }>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitleSans}>
          Il tuo <Text style={styles.sectionTitleSerif}>carrello</Text>
        </Text>
        <MaterialCommunityIcons name="arrow-right" size={20} color={Palette.white} />
      </View>

      {lines.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons
            name="basket-outline"
            size={56}
            color={Palette.whiteMuted}
          />
          <Text style={styles.emptyText}>Il carrello è vuoto</Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionSub}>
            {cart?.totalQuantity} {cart?.totalQuantity === 1 ? 'articolo' : 'articoli'}
          </Text>

          <View style={styles.lines}>
            {lines.map((line) => (
              <CartItemRow
                key={line.id}
                line={line}
                onChange={(q) =>
                  q <= 0 ? removeItem(line.id) : updateItem(line.id, q)
                }
              />
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.summary}>
            <SummaryRow label="Articoli" value={`${cart?.totalQuantity} Qtà`} />
            <SummaryRow
              label="Subtotale"
              value={formatPriceBadge(cart?.cost.subtotalAmount)}
            />
            <SummaryRow label="Spedizione" value="Standard - Gratis" />
            <SummaryRow
              label="Totale"
              value={formatPriceBadge(cart?.cost.totalAmount)}
              emphasized
            />
          </View>

          <View style={styles.divider} />

          <Pressable
            onPress={onCheckout}
            disabled={checkingOut}
            style={({ pressed }) => [
              styles.payButton,
              (pressed || checkingOut) && styles.pressed,
            ]}>
            {checkingOut ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Text style={styles.payText}>Vai al pagamento</Text>
                <View style={styles.payDivider} />
                <MaterialCommunityIcons name="apple" size={18} color="#000" />
                <Text style={styles.payText}>Pay</Text>
              </>
            )}
          </Pressable>

          {!isLoggedIn && (
            <Text style={styles.payHint}>
              Crea un account per completare l&apos;acquisto.
            </Text>
          )}
        </>
      )}
    </ScrollView>
  );
}

function CartItemRow({
  line,
  onChange,
}: {
  line: CartLine;
  onChange: (quantity: number) => void;
}) {
  const image = line.merchandise.image;
  const name = watchColorName(line.merchandise.product.title);
  const description = line.merchandise.product.description?.trim();

  return (
    <View style={styles.itemRow}>
      <View style={styles.itemImage}>
        {image ? (
          <Image
            source={image.url}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.itemPlaceholder]} />
        )}
        <View style={styles.itemBadge}>
          <Text style={styles.itemBadgeText}>
            {formatPriceBadge(line.cost.totalAmount)}
          </Text>
        </View>
      </View>

      <View style={styles.itemInfo}>
        <Text style={styles.itemEyebrow}>Ruzza Watch</Text>
        <Text style={styles.itemName}>{name}</Text>
        {description ? (
          <Text style={styles.itemDesc} numberOfLines={3}>
            {description}
          </Text>
        ) : null}
        <View style={styles.qtyAnchor}>
          <QuantityControl quantity={line.quantity} onChange={onChange} />
        </View>
      </View>
    </View>
  );
}

/** Collapsed "Qtà n ›" pill that expands into a −/+ stepper (design-accurate). */
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
      <Pressable style={styles.qtyPill} onPress={() => setOpen(true)}>
        <Text style={styles.qtyPillText}>Qtà {quantity}</Text>
        <MaterialCommunityIcons name="chevron-right" size={16} color="#000" />
      </Pressable>
    );
  }

  return (
    <View style={styles.qtyStepper}>
      <Pressable
        onPress={() => onChange(quantity - 1)}
        hitSlop={8}
        style={styles.qtyStepButton}>
        <MaterialCommunityIcons
          name={quantity <= 1 ? 'trash-can-outline' : 'minus'}
          size={16}
          color="#000"
        />
      </Pressable>
      <Text style={styles.qtyPillText}>{quantity}</Text>
      <Pressable
        onPress={() => onChange(quantity + 1)}
        hitSlop={8}
        style={styles.qtyStepButton}>
        <MaterialCommunityIcons name="plus" size={16} color="#000" />
      </Pressable>
    </View>
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
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, emphasized && styles.summaryStrong]}>
        {label}
      </Text>
      <Text style={[styles.summaryValue, emphasized && styles.summaryStrong]}>
        {value}
      </Text>
    </View>
  );
}

/* ------------------------------ Orders tab ------------------------------- */

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
  const { isLoggedIn, token } = useAuth();
  const router = useRouter();
  const bottomPad = useBottomPad();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstLoad = useRef(true);

  const load = useCallback(
    async (withSpinner: boolean) => {
      if (!token) {
        setOrders([]);
        return;
      }
      if (withSpinner) setLoading(true);
      setError(null);
      try {
        setOrders(await getOrders(token));
      } catch (e) {
        setError((e as Error).message);
      } finally {
        if (withSpinner) setLoading(false);
      }
    },
    [token],
  );

  // Refetch whenever the screen regains focus (first time with a spinner, then
  // silently) — so a freshly placed order shows up on return without a restart.
  useFocusEffect(
    useCallback(() => {
      load(firstLoad.current);
      firstLoad.current = false;
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(false);
    setRefreshing(false);
  }, [load]);

  return (
    <ScrollView
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.tabContent, { paddingBottom: bottomPad }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Palette.white}
        />
      }>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitleSans}>
          Tutti i tuoi <Text style={styles.sectionTitleSerif}>ordini</Text>
        </Text>
        <MaterialCommunityIcons name="arrow-right" size={20} color={Palette.white} />
      </View>

      {!isLoggedIn ? (
        <View style={[styles.center, styles.ordersPlaceholder]}>
          <MaterialCommunityIcons
            name="receipt-text-outline"
            size={56}
            color={Palette.whiteMuted}
          />
          <Text style={styles.emptyText}>Accedi per vedere i tuoi ordini.</Text>
          <Pressable style={styles.smallButton} onPress={() => router.push('/account')}>
            <Text style={styles.smallButtonText}>Accedi</Text>
          </Pressable>
        </View>
      ) : loading ? (
        <View style={[styles.center, styles.ordersPlaceholder]}>
          <ActivityIndicator size="large" color={Palette.white} />
        </View>
      ) : orders.length === 0 ? (
        <View style={[styles.center, styles.ordersPlaceholder]}>
          <MaterialCommunityIcons
            name="receipt-text-outline"
            size={56}
            color={Palette.whiteMuted}
          />
          <Text style={styles.emptyText}>
            {error ?? 'Non hai ancora effettuato ordini.'}
          </Text>
        </View>
      ) : (
        <View style={styles.orders}>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function OrderCard({ order }: { order: Order }) {
  const date = new Date(order.processedAt).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const status =
    FULFILLMENT_LABEL[order.fulfillmentStatus] ?? 'In preparazione';
  const itemsCount = order.lineItems.reduce((n, li) => n + li.quantity, 0);

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderTop}>
        <Text style={styles.orderNumber}>Ordine #{order.orderNumber}</Text>
        <View style={styles.orderStatus}>
          <Text style={styles.orderStatusText}>{status}</Text>
        </View>
      </View>
      <Text style={styles.orderDate}>{date}</Text>
      {order.lineItems.length > 0 && (
        <Text style={styles.orderItems} numberOfLines={2}>
          {order.lineItems.map((li) => `${li.quantity}× ${li.title}`).join(', ')}
        </Text>
      )}
      <View style={styles.orderBottom}>
        <Text style={styles.orderItemsCount}>
          {itemsCount} {itemsCount === 1 ? 'articolo' : 'articoli'}
        </Text>
        <Text style={styles.orderTotal}>
          {formatPriceBadge(order.currentTotalPrice)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    gap: 24,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  tabButton: {
    paddingBottom: 12,
  },
  tabLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabLabel: {
    fontSize: 18,
    fontFamily: Font.sansMedium,
  },
  tabLabelActive: {
    color: Palette.white,
  },
  tabLabelInactive: {
    color: Palette.whiteMuted,
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    color: Palette.white,
    fontSize: 11,
    fontFamily: Font.sansSemibold,
  },
  tabUnderline: {
    height: 2,
    borderRadius: 2,
    backgroundColor: Palette.white,
  },

  tabContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontStyle: 'italic',
  },
  sectionSub: {
    color: Palette.whiteMuted,
    fontSize: 14,
    fontFamily: Font.sans,
    marginTop: 6,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 80,
  },
  ordersPlaceholder: {
    gap: 12,
    paddingTop: 64,
  },
  emptyText: {
    color: Palette.whiteMuted,
    fontSize: 16,
    fontFamily: Font.sansMedium,
    textAlign: 'center',
  },

  lines: {
    marginTop: 20,
    gap: 20,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 16,
  },
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
  itemPlaceholder: {
    backgroundColor: '#e6e6e6',
  },
  itemBadge: {
    backgroundColor: Palette.badgeBg,
    borderRadius: 73,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  itemBadgeText: {
    color: Palette.white,
    fontSize: 10,
    fontFamily: Font.sansMedium,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemEyebrow: {
    color: Palette.whiteMuted,
    fontSize: 12,
    fontFamily: Font.sansMedium,
  },
  itemName: {
    color: Palette.white,
    fontSize: 20,
    fontFamily: Font.sansMedium,
  },
  itemDesc: {
    color: Palette.whiteMuted,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Font.sans,
    marginTop: 4,
  },
  qtyAnchor: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  qtyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.white,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  qtyPillText: {
    color: '#000',
    fontSize: 14,
    fontFamily: Font.sansMedium,
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Palette.white,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  qtyStepButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.06)',
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginVertical: 24,
  },
  summary: {
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: Palette.whiteMuted,
    fontSize: 18,
    fontFamily: Font.sans,
  },
  summaryValue: {
    color: Palette.whiteMuted,
    fontSize: 18,
    fontFamily: Font.sans,
  },
  summaryStrong: {
    color: Palette.white,
    fontSize: 28,
    fontFamily: Font.sansSemibold,
  },

  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Palette.white,
    borderRadius: 100,
    paddingVertical: 17,
  },
  payText: {
    color: '#000',
    fontSize: 16,
    fontFamily: Font.sansSemibold,
  },
  payDivider: {
    width: StyleSheet.hairlineWidth,
    height: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  pressed: {
    opacity: 0.85,
  },
  payHint: {
    color: Palette.whiteMuted,
    fontSize: 13,
    fontFamily: Font.sans,
    textAlign: 'center',
    marginTop: 12,
  },

  smallButton: {
    marginTop: 8,
    backgroundColor: Palette.white,
    borderRadius: 100,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  smallButtonText: {
    color: '#000',
    fontSize: 14,
    fontFamily: Font.sansSemibold,
  },

  orders: {
    marginTop: 20,
    gap: 12,
  },
  orderCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  orderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderNumber: {
    color: Palette.white,
    fontSize: 16,
    fontFamily: Font.sansSemibold,
  },
  orderStatus: {
    backgroundColor: 'rgba(75,136,255,0.18)',
    borderRadius: 73,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  orderStatusText: {
    color: Palette.blue,
    fontSize: 11,
    fontFamily: Font.sansSemibold,
  },
  orderDate: {
    color: Palette.whiteMuted,
    fontSize: 13,
    fontFamily: Font.sans,
  },
  orderItems: {
    color: Palette.white,
    fontSize: 14,
    fontFamily: Font.sans,
    marginTop: 2,
  },
  orderBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  orderItemsCount: {
    color: Palette.whiteMuted,
    fontSize: 13,
    fontFamily: Font.sans,
  },
  orderTotal: {
    color: Palette.white,
    fontSize: 18,
    fontFamily: Font.sansSemibold,
  },
});
