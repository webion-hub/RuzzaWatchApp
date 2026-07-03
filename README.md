# RUZZA WATCH — Expo + Shopify app

An [Expo](https://expo.dev) (SDK 57, expo-router) app connected to a Shopify
store via the **Storefront API** (GraphQL). Three screens with a custom floating
footer:

- **Watch** (`/`, default) — products from the `RUZZA WATCH BASIC` collection.
- **Profumi** (`/profumi`) — placeholder until the perfumes collection exists.
- **Carrello** (`/carrello`) — Shopify cart with quantity controls and hosted checkout.

## 1. Configure Shopify

The app talks to Shopify with a **public Storefront API token** (safe to embed
in a client app — it is not your admin password).

1. Shopify admin → **Settings → Apps and sales channels → Develop apps → Create an app**.
2. **Configure Storefront API scopes** — enable at least:
   `unauthenticated_read_product_listings`, `unauthenticated_read_product_inventory`,
   and the cart scopes (`unauthenticated_write_checkouts`, `unauthenticated_read_checkouts`).
3. **Install app**, then copy the **Storefront API access token**.
4. Copy `.env.example` to `.env` and fill in your values:

   ```bash
   cp .env.example .env
   ```

   ```
   EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN=your-shop.myshopify.com
   EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=your_storefront_access_token
   ```

   > These `EXPO_PUBLIC_` values are inlined at build time — **restart the dev
   > server after editing `.env`.**

The watch collection id is set in [`src/lib/config.ts`](src/lib/config.ts)
(`WATCH_COLLECTION_ID`, currently `gid://shopify/Collection/708453892436`). When
the perfumes collection exists, add its id and wire up the Profumi screen the
same way the Watch screen uses `getCollectionProducts`.

## 2. Run

```bash
npm install
npx expo start
```

Open on an [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/),
[Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/), or
the web.

## Project structure

```
src/
  app/
    _layout.tsx      # Tabs (expo-router/ui) + CartProvider + floating footer
    index.tsx        # Watch screen (collection products grid)
    carrello.tsx     # Cart screen + checkout
    profumi.tsx      # Perfumes placeholder
  components/
    floating-footer.tsx   # custom floating tab bar
    product-card.tsx      # product tile with "Aggiungi"
  context/
    cart-context.tsx      # Shopify Cart API state (persisted cart id)
  lib/
    config.ts        # env + Storefront endpoint + collection id
    shopify.ts       # GraphQL fetch client
    queries.ts       # product query + cart mutations
    format.ts        # money formatting
    types.ts         # Storefront data types
```

## Notes

- Cart state lives on Shopify; the cart id is persisted with AsyncStorage so it
  survives restarts. "Vai al checkout" opens Shopify's hosted checkout via
  `expo-web-browser`.
- Until `.env` is configured, the Watch screen shows a "Shopify non configurato"
  message instead of crashing.
