import { useState } from "react";
import { Animated } from "react-native";

/** React Native's `useAnimatedValue`, which react-native-web doesn't export */
export function useAnimatedValue(initialValue: number) {
    const [value] = useState(() => new Animated.Value(initialValue));
    return value;
}
