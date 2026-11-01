import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

/**
 * How much of the screen the keyboard covers, on iOS. Android resizes the window itself (Expo's default
 * `softwareKeyboardLayoutMode: "resize"`), so there it's always 0. Used where KeyboardAvoidingView misjudges the
 * offset, as inside an iOS page-sheet modal.
 */
export function useKeyboardHeight() {
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (Platform.OS !== "ios") return;

        const show = Keyboard.addListener("keyboardWillShow", (event) => setHeight(event.endCoordinates.height));
        const hide = Keyboard.addListener("keyboardWillHide", () => setHeight(0));
        return () => {
            show.remove();
            hide.remove();
        };
    }, []);

    return height;
}
