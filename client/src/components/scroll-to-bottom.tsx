"use client";

import { useEffect, useRef } from "react";

export default function ScrollToBottom() {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (elementRef.current) {
            elementRef.current.scrollIntoView();
        }
    }, []);

    return <div ref={elementRef} />;
}
