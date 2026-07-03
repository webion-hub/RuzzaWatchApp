/**
 * Shopify customer accounts via the (classic) Storefront customer API.
 *
 * Flow: `createCustomer` registers, `login` returns an access token,
 * `getCustomer` reads the profile with that token, `logout` revokes it. The
 * token is what associates a cart/checkout with the account (see
 * `updateCartBuyerIdentity` in queries.ts).
 */

import { shopifyFetch } from '@/lib/shopify';
import type {
  Customer,
  CustomerAccessToken,
  CustomerError,
  Order,
} from '@/lib/types';

const CUSTOMER_FRAGMENT = /* GraphQL */ `
  fragment CustomerFields on Customer {
    id
    firstName
    lastName
    displayName
    email
    phone
    numberOfOrders
  }
`;

/* --------------------------------- Sign up -------------------------------- */

type CustomerCreateResponse = {
  customerCreate: {
    customer: { id: string } | null;
    customerUserErrors: CustomerError[];
  };
};

const CUSTOMER_CREATE_MUTATION = /* GraphQL */ `
  mutation CustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer { id }
      customerUserErrors { code field message }
    }
  }
`;

export type SignUpInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

/** Register a new customer. Returns userErrors (empty on success). */
export async function createCustomer(
  input: SignUpInput,
): Promise<{ ok: boolean; errors: CustomerError[] }> {
  const data = await shopifyFetch<CustomerCreateResponse>(
    CUSTOMER_CREATE_MUTATION,
    { input },
  );
  const errors = data.customerCreate.customerUserErrors;
  return { ok: errors.length === 0 && !!data.customerCreate.customer, errors };
}

/* ---------------------------------- Login --------------------------------- */

type TokenCreateResponse = {
  customerAccessTokenCreate: {
    customerAccessToken: CustomerAccessToken | null;
    customerUserErrors: CustomerError[];
  };
};

const TOKEN_CREATE_MUTATION = /* GraphQL */ `
  mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken { accessToken expiresAt }
      customerUserErrors { code field message }
    }
  }
`;

/** Log in and obtain an access token. */
export async function login(
  email: string,
  password: string,
): Promise<{ token: CustomerAccessToken | null; errors: CustomerError[] }> {
  const data = await shopifyFetch<TokenCreateResponse>(TOKEN_CREATE_MUTATION, {
    input: { email, password },
  });
  return {
    token: data.customerAccessTokenCreate.customerAccessToken,
    errors: data.customerAccessTokenCreate.customerUserErrors,
  };
}

/* --------------------------------- Logout --------------------------------- */

const TOKEN_DELETE_MUTATION = /* GraphQL */ `
  mutation CustomerAccessTokenDelete($token: String!) {
    customerAccessTokenDelete(customerAccessToken: $token) {
      deletedAccessToken
    }
  }
`;

export async function logout(token: string): Promise<void> {
  try {
    await shopifyFetch(TOKEN_DELETE_MUTATION, { token });
  } catch {
    // Revocation failures are non-fatal — the client drops the token anyway.
  }
}

/* ------------------------------- Read profile ----------------------------- */

type CustomerResponse = { customer: Customer | null };

const CUSTOMER_QUERY = /* GraphQL */ `
  ${CUSTOMER_FRAGMENT}
  query Customer($token: String!) {
    customer(customerAccessToken: $token) {
      ...CustomerFields
    }
  }
`;

/** Read the profile for an access token (null if the token is invalid/expired). */
export async function getCustomer(token: string): Promise<Customer | null> {
  const data = await shopifyFetch<CustomerResponse>(CUSTOMER_QUERY, { token });
  return data.customer;
}

/* -------------------------------- Orders ---------------------------------- */

type RawOrder = Omit<Order, 'lineItems'> & {
  lineItems: { nodes: Order['lineItems'] };
};
type OrdersResponse = {
  customer: { orders: { nodes: RawOrder[] } } | null;
};

const ORDERS_QUERY = /* GraphQL */ `
  query CustomerOrders($token: String!) {
    customer(customerAccessToken: $token) {
      orders(first: 25, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          orderNumber
          processedAt
          financialStatus
          fulfillmentStatus
          currentTotalPrice { amount currencyCode }
          lineItems(first: 5) {
            nodes { title quantity }
          }
        }
      }
    }
  }
`;

/** List the customer's orders (most recent first). */
export async function getOrders(token: string): Promise<Order[]> {
  const data = await shopifyFetch<OrdersResponse>(ORDERS_QUERY, { token });
  if (!data.customer) return [];
  return data.customer.orders.nodes.map((o) => ({
    ...o,
    lineItems: o.lineItems.nodes,
  }));
}
