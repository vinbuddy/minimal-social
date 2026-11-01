import { useTranslation } from "react-i18next";

import { PlaceholderScreen } from "@/components/placeholder-screen";

export default function NotificationsScreen() {
    const { t } = useTranslation();
    return <PlaceholderScreen title={t("app:NOTIFICATIONS")} phase="Phase 5" />;
}
