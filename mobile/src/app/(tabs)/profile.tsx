import { ProfileView } from "@/components/user/profile-view";
import useAuthStore from "@/stores/auth-store";

/** Your own profile; theme, language and log out moved to Settings (the gear) */
export default function MyProfileScreen() {
    const currentUser = useAuthStore((state) => state.currentUser);
    if (!currentUser) return null;

    return <ProfileView userId={currentUser._id} isOwnTab />;
}
