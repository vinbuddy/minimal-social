import { useLocalSearchParams } from "expo-router";

import { ProfileView } from "@/components/user/profile-view";

export default function UserProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return <ProfileView userId={id} />;
}
