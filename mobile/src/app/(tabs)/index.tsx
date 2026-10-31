import { View } from "react-native";

import { ConversationIcon } from "@/components/icons";
import { PlaceholderScreen } from "@/components/placeholder-screen";
import { Button, Divider, Logo } from "@/components/ui";
import { spacing } from "@/theme";

export default function HomeScreen() {
    return (
        <PlaceholderScreen
            title="Feed"
            phase="Phase 3"
            header={
                <View>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingHorizontal: spacing[4],
                            paddingVertical: spacing[2],
                        }}
                    >
                        <Logo size={32} />
                        {/* Conversations land in Phase 6 */}
                        <Button isIconOnly variant="light" color="default" radius="full" accessibilityLabel="Direct" isDisabled>
                            <ConversationIcon size={24} />
                        </Button>
                    </View>
                    <Divider />
                </View>
            }
        />
    );
}
