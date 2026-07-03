/** Shared types for data returned by the Shopify Storefront API. */

export type Money = {
  amount: string;
  currencyCode: string;
};

export type ProductImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  availableForSale: boolean;
  featuredImage: ProductImage | null;
  /** Gallery images for the detail page. */
  images: ProductImage[];
  priceRange: {
    minVariantPrice: Money;
  };
  /** First available (or first) variant, used as the default "add to cart" target. */
  variants: ProductVariant[];
};

export type CartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    image: ProductImage | null;
    price: Money;
    product: {
      title: string;
      handle: string;
      description: string;
    };
  };
  cost: {
    totalAmount: Money;
  };
};

export type Customer = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  email: string | null;
  phone: string | null;
  numberOfOrders: string;
};

export type CustomerAccessToken = {
  accessToken: string;
  expiresAt: string;
};

export type OrderLineItem = {
  title: string;
  quantity: number;
};

export type Order = {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string;
  currentTotalPrice: Money;
  lineItems: OrderLineItem[];
};

/** A user-facing error from a customer mutation (customerUserErrors). */
export type CustomerError = {
  code: string | null;
  field: string[] | null;
  message: string;
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
  lines: CartLine[];
};
