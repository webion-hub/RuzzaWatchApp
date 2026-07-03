/**
 * GraphQL documents + typed helpers for the Storefront API.
 *
 * Products are read from a collection (by GID). The cart flow uses the
 * Storefront Cart API: create a cart, add/update/remove lines, and read the
 * hosted `checkoutUrl` to complete the purchase in the browser.
 */

import { WATCH_COLLECTION_ID } from '@/lib/config';
import { shopifyFetch } from '@/lib/shopify';
import type { Cart, Product } from '@/lib/types';

/* ----------------------------------------------------------------------- */
/* Fragments                                                               */
/* ----------------------------------------------------------------------- */

const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    availableForSale
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 8) {
      nodes {
        url
        altText
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 10) {
      nodes {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
      }
    }
  }
`;

const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            image {
              url
              altText
              width
              height
            }
            price {
              amount
              currencyCode
            }
            product {
              title
              handle
              description
            }
          }
        }
      }
    }
  }
`;

/* ----------------------------------------------------------------------- */
/* Product queries                                                         */
/* ----------------------------------------------------------------------- */

type CollectionProductsResponse = {
  collection: {
    id: string;
    title: string;
    products: { nodes: RawProduct[] };
  } | null;
};

// Raw shape mirrors the query (connections nested under `nodes`), flattened below.
type RawProduct = Omit<Product, 'variants' | 'images'> & {
  variants: { nodes: Product['variants'] };
  images: { nodes: Product['images'] };
};

function flattenProduct(raw: RawProduct): Product {
  return { ...raw, variants: raw.variants.nodes, images: raw.images.nodes };
}

const COLLECTION_PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query CollectionProducts($id: ID!, $first: Int!) {
    collection(id: $id) {
      id
      title
      products(first: $first) {
        nodes {
          ...ProductFields
        }
      }
    }
  }
`;

/** Fetch products belonging to a collection (defaults to RUZZA WATCH BASIC). */
export async function getCollectionProducts(
  collectionId: string = WATCH_COLLECTION_ID,
  first = 50,
): Promise<Product[]> {
  const data = await shopifyFetch<CollectionProductsResponse>(
    COLLECTION_PRODUCTS_QUERY,
    { id: collectionId, first },
  );
  if (!data.collection) return [];
  return data.collection.products.nodes.map(flattenProduct);
}

type ProductByHandleResponse = { product: RawProduct | null };

const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
`;

/** Fetch a single product by its handle (for the detail page). */
export async function getProductByHandle(handle: string): Promise<Product | null> {
  const data = await shopifyFetch<ProductByHandleResponse>(PRODUCT_BY_HANDLE_QUERY, {
    handle,
  });
  return data.product ? flattenProduct(data.product) : null;
}

/* ----------------------------------------------------------------------- */
/* Cart mutations                                                          */
/* ----------------------------------------------------------------------- */

// The query returns cart lines nested under `nodes`; flatten to `Cart.lines[]`.
type RawCart = Omit<Cart, 'lines'> & { lines: { nodes: Cart['lines'] } };

function flattenCart<T extends RawCart | null>(raw: T): Cart | null {
  if (!raw) return null;
  return { ...raw, lines: raw.lines.nodes };
}

type CartResponse = { cart: RawCart | null };
type CartCreateResponse = { cartCreate: { cart: RawCart | null } };
type CartLinesAddResponse = { cartLinesAdd: { cart: RawCart | null } };
type CartLinesUpdateResponse = { cartLinesUpdate: { cart: RawCart | null } };
type CartLinesRemoveResponse = { cartLinesRemove: { cart: RawCart | null } };

const CART_CREATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartCreate($lines: [CartLineInput!], $buyerIdentity: CartBuyerIdentityInput) {
    cartCreate(input: { lines: $lines, buyerIdentity: $buyerIdentity }) {
      cart {
        ...CartFields
      }
    }
  }
`;

const CART_BUYER_IDENTITY_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        ...CartFields
      }
    }
  }
`;

const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
    }
  }
`;

const CART_QUERY = /* GraphQL */ `
  ${CART_FRAGMENT}
  query Cart($id: ID!) {
    cart(id: $id) {
      ...CartFields
    }
  }
`;

/** Create a new cart, optionally seeding it with one line and/or a customer. */
export async function createCart(
  variantId?: string,
  quantity = 1,
  customerAccessToken?: string | null,
): Promise<Cart> {
  const lines = variantId ? [{ merchandiseId: variantId, quantity }] : [];
  const buyerIdentity = customerAccessToken ? { customerAccessToken } : undefined;
  const data = await shopifyFetch<CartCreateResponse>(CART_CREATE_MUTATION, {
    lines,
    buyerIdentity,
  });
  const cart = flattenCart(data.cartCreate.cart);
  if (!cart) throw new Error('Failed to create cart.');
  return cart;
}

type CartBuyerIdentityResponse = {
  cartBuyerIdentityUpdate: { cart: RawCart | null };
};

/** Associate (or clear) the logged-in customer on an existing cart. */
export async function updateCartBuyerIdentity(
  cartId: string,
  customerAccessToken: string | null,
): Promise<Cart | null> {
  const data = await shopifyFetch<CartBuyerIdentityResponse>(
    CART_BUYER_IDENTITY_MUTATION,
    { cartId, buyerIdentity: { customerAccessToken } },
  );
  return flattenCart(data.cartBuyerIdentityUpdate.cart);
}

/** Re-fetch an existing cart by id (returns null if it expired/was completed). */
export async function fetchCart(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<CartResponse>(CART_QUERY, { id: cartId });
  return flattenCart(data.cart);
}

export async function addCartLine(
  cartId: string,
  variantId: string,
  quantity = 1,
): Promise<Cart> {
  const data = await shopifyFetch<CartLinesAddResponse>(
    CART_LINES_ADD_MUTATION,
    { cartId, lines: [{ merchandiseId: variantId, quantity }] },
  );
  const cart = flattenCart(data.cartLinesAdd.cart);
  if (!cart) throw new Error('Failed to add item to cart.');
  return cart;
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<Cart> {
  const data = await shopifyFetch<CartLinesUpdateResponse>(
    CART_LINES_UPDATE_MUTATION,
    { cartId, lines: [{ id: lineId, quantity }] },
  );
  const cart = flattenCart(data.cartLinesUpdate.cart);
  if (!cart) throw new Error('Failed to update cart.');
  return cart;
}

export async function removeCartLine(
  cartId: string,
  lineId: string,
): Promise<Cart> {
  const data = await shopifyFetch<CartLinesRemoveResponse>(
    CART_LINES_REMOVE_MUTATION,
    { cartId, lineIds: [lineId] },
  );
  const cart = flattenCart(data.cartLinesRemove.cart);
  if (!cart) throw new Error('Failed to remove item.');
  return cart;
}
