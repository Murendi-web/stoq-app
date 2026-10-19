# Stoq

Database-driven mobile app for South African small-retailer stock management.
Built with React Native (Expo) + Firebase, per Deliverable 3 (Modelling).

## What's already built

- Auth: register (creates a shop) / login / logout — FR1
- Stock: add / edit / delete products, reorder threshold — FR2, FR10
- Sales: log a sale (atomic stock deduction via Firestore transaction) — FR3
- Restock: record stock received — FR4
- Stock list with search — FR5
- Stockout alerts, auto-raised by a Cloud Function, delivered via push — FR6, FR7 (full loop: device registers its native push token on login → Cloud Function sends to it)
- Sales report (today / last 7 days) — FR8
- Supplier CRUD — FR9
- Owner can create staff accounts on the spot, without losing their own session (uses a secondary Firebase app instance under the hood) — FR1, FR11
- Role-based access (owner vs staff) in Firestore rules — FR11
- Offline queue for sales/restocks (AsyncStorage-backed, auto-flushes on reconnect) — NFR3
- Loading spinners on save actions and inline validation on the Add Staff form (pattern to extend to other forms)

Every screen and the Cloud Functions type-check clean (`npx tsc --noEmit`) and
the whole app has been bundle-tested end-to-end with Metro (642 modules,
zero errors) — this has not been run on an actual device/emulator yet
(that needs your own machine/network), so treat first-launch testing as
still your job before you trust it fully.

## Getting started

1. **Create a Firebase project** at https://console.firebase.google.com
   - Enable **Authentication** → Email/Password
   - Enable **Firestore** (production mode)
   - Enable **Cloud Messaging** (for push alerts)
2. Copy your Firebase web app config into `app.json` under `expo.extra.firebase`
   (replace every `"REPLACE_ME"`).
3. Install dependencies:
   ```
   npm install
   ```
4. Run the app:
   ```
   npx expo start
   ```
   Scan the QR code with Expo Go on your phone, or press `a` for an Android emulator.

## Deploying the backend

```
npm install -g firebase-tools
firebase login
firebase use --add            # select your Firebase project
firebase deploy --only firestore:rules,firestore:indexes,functions
```

This deploys:
- `firestore.rules` — shop-level data isolation + owner/staff permissions
- `firestore.indexes.json` — composite indexes the sales/alerts queries need
- `functions/` — `onProductWrite` (raises/resolves stockout alerts) and
  `sendStockoutPush` (pushes a notification when an alert opens)

## Project structure

```
src/
  navigation/   Auth stack, bottom tabs, per-tab stacks
  screens/      One folder per feature area (auth, dashboard, stock, sales, alerts, suppliers, settings)
  components/   Shared UI (ProductCard, AlertBanner, QuantityStepper)
  services/     All Firestore/Auth calls — screens never call Firebase directly
  hooks/        useNetworkStatus, useOfflineQueue
  context/      AuthContext (current user/shop/role), OfflineQueueContext
  types/        TypeScript interfaces mirroring the ER model (Deliverable 3, Section 7)
functions/      Cloud Functions (separate npm project, deployed separately)
firestore.rules, firestore.indexes.json, firebase.json
```

## Still to do (good next PRs)

- **Testing**: none written yet — this is the focus of Deliverable 5. Cloud
  Functions (`onProductWrite`) are pure enough to unit test with the
  Firebase emulator suite; screens are good candidates for manual test-plan
  screenshots since they map directly to the FR list above.
- **App icons/splash**: currently using Expo's default placeholders in `assets/`.
- **Password reset / "change temporary password"** flow for staff accounts
  created via the Add Staff screen — currently the owner just shares a
  password directly.
- **Inline validation everywhere**: the Add Staff form has proper inline
  validation (see `StaffFormScreen.tsx`) — worth carrying that same pattern
  into Product/Supplier forms, which still use `Alert.alert` popups.
- Push notifications need a **physical device or a development build** to
  test — `expo-notifications`' native push token API returns nothing usable
  in the iOS Simulator (Android emulators with Play Services generally work).
