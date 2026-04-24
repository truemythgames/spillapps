# History Tea — Mobile setup

Cloned from `apps/bible-tea/mobile`. This is the bare scaffold; the native
`ios/` and `android/` folders are intentionally absent and will be generated
by Expo prebuild from `app.json` + the config plugins in `plugins/`.

## First-time setup

```bash
# from repo root
npm install

# generate native projects (creates ios/ and android/ from app.json)
cd apps/history-tea/mobile
npx expo prebuild
```

The `now-playing-plugin` in `plugins/` will inject the `NowPlayingBridge`
Swift/ObjC/Kotlin sources during prebuild. Custom Kotlin sources live in
`plugins/native-android/` and are written into the package matching
`android.package` in `app.json` (currently `app.historytea`).

## What's stripped vs Bible Tea

To keep the first build green without account provisioning, these were
removed from the clone — re-add when you're ready to wire each service:

- **Firebase** (`@react-native-firebase/*`): no `GoogleService-Info.plist`,
  no `google-services.json`, no Firebase plugins in `app.json`, Crashlytics
  init removed from `AppDelegate.swift`. `lib/analytics.ts` already wraps
  every call in try/catch so JS won't crash.
- **Facebook SDK** (`react-native-fbsdk-next`): plugin + dep removed.
- **Google Sign-In**: dep kept, but `googleWebClientId` / `googleIosClientId`
  in `app.json > extra` are blank — set them once you create OAuth clients.
- **RevenueCat** (`react-native-purchases`): dep kept, no API keys yet.
- **Bible Tea's release keystore**: not copied; generate a new one when you
  ship the first Play Store build.

## What stayed

- All app code (routes, components, stores, services, lib).
- Theme tokens (`lib/theme.ts`) — repainted to a parchment/amber palette to
  visually distinguish from Bible Tea's violet.
- Config plugins (`now-playing-plugin`, `hermes-dsym-plugin`).
- Apple Sign-In (works without extra config beyond entitlement + bundle ID).

## Running

```bash
# from repo root
npm run dev:mobile:history          # Metro + content server
npm run dev:mobile:history:native   # native build to connected device
```

## Bundle / app IDs

- iOS: `app.historytea`
- Android: `app.historytea`
- Scheme: `historytea`
- App slug: `historytea`

## Content

`apps/history-tea/content/` was reset to empty catalogs. Generate with:

```bash
npm run generate:history -- --story <story-id>
npm run sync:r2:history
```

Both honor `CONTENT_APP_ID=history-tea` and `R2_APP_PREFIX=history-tea`.
