# Minimal Social — Mobile

React Native app for Minimal Social, built with Expo (SDK 58) and Expo Router. It talks to the same API as the web client in `/client`, using bearer tokens instead of cookies (`X-Client-Type: mobile`).

## Getting started

```bash
cd mobile
npm install
cp .env.example .env.local   # set EXPO_PUBLIC_API_BASE_URL
npx expo start
```

On a physical device or the Android emulator, `localhost` is the device itself: use your machine's LAN IP, or `http://10.0.2.2:5000` on the Android emulator.

### Google Sign-In

Google Sign-In uses a native module, so it only works in a development build (`npx expo run:android` / `run:ios`, or EAS), not in Expo Go or the web preview, where the button is hidden. Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (the server's `GOOGLE_CLIENT_ID`), and for iOS `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` and `GOOGLE_IOS_URL_SCHEME` (see `.env.example`). The app sends the ID token to `POST /auth/google/mobile`.

## Structure

| Path | What |
| --- | --- |
| `src/app/` | Routes (Expo Router). Auth screens at the root, the signed-in app in `(tabs)/`; `_layout.tsx` switches between them with `Stack.Protected`. `kitchen-sink.tsx` shows every UI primitive in both themes |
| `src/stores/auth-store.ts` | Session state: restore on launch, sign in/out, the pending sign-up and password reset between OTP screens |
| `src/services/` | API calls |
| `src/theme/` | Design tokens from the Minimal Social design system, and the light/dark `ThemeProvider` |
| `src/components/ui/` | Primitives: Text, Button, Input, Avatar, UserName, Divider, Skeleton, Badge, Toast, Logo, Screen |
| `src/components/icons/` | The app's own outline/filled icon set (ported from the web). Other icons come from `lucide-react-native` |
| `src/i18n/` | i18next with `en` and `vi`. `locales/` is copied from `client/public/locales`: update both when strings change |
| `src/lib/http.ts` | Axios client: bearer token, single-flight token refresh, session-expired hook |
| `src/lib/token-storage.ts` | Tokens in `expo-secure-store` |

## Design rules

The app follows the Minimal Social design system: ink (`primary`) is the only accent, lists are separated by `divider` hairlines (no cards, no shadows in content), colour only means state (`danger` for a liked heart, `success` for a repost), and every text style comes from `typography` in `src/theme/tokens.ts`. Use the tokens instead of raw values.

## Checks

```bash
npx tsc --noEmit
npx expo lint
npx expo-doctor
```
