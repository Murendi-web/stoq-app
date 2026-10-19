# Stoq
atabase-driven mobile app for South African small-retailer stock management.
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



 Install dependencies:
   ```
   npm install
   ```
 Run the app:
   ```
   npx expo start
   ```
   Scan the QR code with Expo Go on your phone, or press `a` for an Android emulator.



