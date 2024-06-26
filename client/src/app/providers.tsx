"use client";

import { NextUIProvider } from "@nextui-org/react";

export function NextProvider({ children }: { children: React.ReactNode }) {
    return <NextUIProvider className="h-full">{children}</NextUIProvider>;
}
