import { useState } from "react";

interface VisibilityOutput {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    toggle: () => void;
}

const useVisibility = (initialState = false): VisibilityOutput => {
    const [isVisible, setIsVisible] = useState<boolean>(initialState);

    const show = () => {
        setIsVisible(true);
    };

    const hide = () => {
        setIsVisible(false);
    };

    const toggle = () => {
        setIsVisible((prevVisibility) => !prevVisibility);
    };

    return {
        isVisible,
        show,
        hide,
        toggle,
    };
};

export default useVisibility;
