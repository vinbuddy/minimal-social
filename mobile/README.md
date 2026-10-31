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

## Structure

| Path | What |
| --- | --- |
| `src/app/` | Routes (Expo Router). `kitchen-sink.tsx` shows every UI primitive in both themes |
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
