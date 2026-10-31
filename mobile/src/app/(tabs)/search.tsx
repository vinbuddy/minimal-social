import { useTranslation } from "react-i18next";

import { PlaceholderScreen } from "@/components/placeholder-screen";

export default function SearchScreen() {
    const { t } = useTranslation();
    return <PlaceholderScreen title={t("SEARCH", { defaultValue: "Search" })} phase="Phase 4" />;
}
