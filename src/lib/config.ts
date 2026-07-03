/**
 * Shopify Storefront API configuration.
 *
 * Values come from EXPO_PUBLIC_ env vars (see .env / .env.example). They are
 * inlined into the bundle at build time, so after changing .env you must
 * restart the Expo dev server.
 */

export const SHOPIFY_STORE_DOMAIN =
  process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN ?? '';

export const SHOPIFY_STOREFRONT_TOKEN =
  process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ?? '';

/**
 * Storefront API version (date-based). Bump this to adopt a newer API version.
 * https://shopify.dev/docs/api/usage/versioning
 */
export const SHOPIFY_API_VERSION = '2025-01';

export const SHOPIFY_GRAPHQL_ENDPOINT = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

/**
 * The "RUZZA WATCH BASIC" collection. The Storefront API addresses collections
 * by their global ID (GID), built from the numeric collection id.
 */
export const WATCH_COLLECTION_ID = 'gid://shopify/Collection/708453892436';

/** True when both required Storefront credentials have been provided. */
export const isShopifyConfigured =
  SHOPIFY_STORE_DOMAIN.length > 0 &&
  SHOPIFY_STORE_DOMAIN !== 'your-shop.myshopify.com' &&
  SHOPIFY_STOREFRONT_TOKEN.length > 0 &&
  SHOPIFY_STOREFRONT_TOKEN !== 'your_storefront_access_token';
