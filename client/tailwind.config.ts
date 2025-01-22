import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            fontFamily: {
                teko: ["var(--font-teko)"],
            },
            colors: {
                link: "#0095f6",
                like: "#ff3040",
                verify: "#0095f6",
            },
        },
        container: {
            // you can configure the container to be centered
            center: true,

            // or have default horizontal padding
            padding: "1rem",

            // default breakpoints but with 40px removed
            screens: {
                sm: "540px",
                md: "720px",
                lg: "960px",
                xl: "1140px",
                "2xl": "1320px",
            },
        },
    },

    darkMode: "class",
    plugins: [
        heroui({
            themes: {
                light: {
                    colors: {
                        primary: {
                            DEFAULT: "#18181b",
                            foreground: "#fff",
                        },
                        background: "#ffffff", // Nền trắng
                        foreground: "#000000",
                    },
                },
                dark: {
                    colors: {
                        primary: {
                            DEFAULT: "#fff",
                            foreground: "#000",
                        },
                        // foreground: "#fff",
                        // background: "#191B19", // Nền đen
                        background: "#0a0a0a",
                        foreground: "#fafafa",
                    },
                },
            },
        }),
    ],
};
export default config;
