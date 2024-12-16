import { useState, useEffect } from "react";

const breakpoints = {
    mobile: 0,
    tablet: 768,
    laptop: 1024,
    desktop: 1280,
};

export default function useBreakpoint() {
    const [breakpoint, setBreakpoint] = useState<keyof typeof breakpoints>("mobile");

    useEffect(() => {
        const calculateBreakpoint = () => {
            const width = window.innerWidth;

            if (width >= breakpoints.desktop) {
                setBreakpoint("desktop");
            } else if (width >= breakpoints.laptop) {
                setBreakpoint("laptop");
            } else if (width >= breakpoints.tablet) {
                setBreakpoint("tablet");
            } else {
                setBreakpoint("mobile");
            }
        };

        calculateBreakpoint();

        window.addEventListener("resize", calculateBreakpoint);

        return () => window.removeEventListener("resize", calculateBreakpoint);
    }, []);

    return breakpoint;
}
