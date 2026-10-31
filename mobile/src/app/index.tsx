import { Redirect } from "expo-router";

// Phase 2 replaces this with the auth gate (sign in vs. feed)
export default function Index() {
    return <Redirect href="/kitchen-sink" />;
}
