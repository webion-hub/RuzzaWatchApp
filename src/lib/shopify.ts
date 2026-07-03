/**
 * Minimal Shopify Storefront GraphQL client.
 *
 * A single fetch wrapper is all we need — no Apollo/urql. Every call posts a
 * query + variables to the Storefront GraphQL endpoint with the public token.
 */

import {
  SHOPIFY_GRAPHQL_ENDPOINT,
  SHOPIFY_STOREFRONT_TOKEN,
  isShopifyConfigured,
} from '@/lib/config';

type GraphQLError = { message: string };

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};

export class ShopifyError extends Error {}

export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  if (!isShopifyConfigured) {
    throw new ShopifyError(
      'Shopify is not configured. Set EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN and ' +
        'EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN in your .env file, then restart the dev server.',
    );
  }

  let response: Response;
  try {
    response = await fetch(SHOPIFY_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch (err) {
    throw new ShopifyError(
      `Network request to Shopify failed: ${(err as Error).message}`,
    );
  }

  if (!response.ok) {
    throw new ShopifyError(
      `Shopify responded with HTTP ${response.status} ${response.statusText}`,
    );
  }

  const json = (await response.json()) as GraphQLResponse<T>;

  if (json.errors && json.errors.length > 0) {
    throw new ShopifyError(json.errors.map((e) => e.message).join('; '));
  }

  if (!json.data) {
    throw new ShopifyError('Shopify returned no data.');
  }

  return json.data;
}
