import type { Config } from "tailwindcss";

function hsl(variable: string) {
    return `hsl(var(${variable}))`;
}

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                /* Hard-coded brand palette */
                brand: {
                    DEFAULT: "#1B4F72",
                    light: "#2980B9",
                    dark: "#154360",
                },
                /* CSS-variable semantic tokens */
                background: hsl("--background"),
                foreground: hsl("--foreground"),
                card: {
                    DEFAULT: hsl("--card"),
                    foreground: hsl("--card-foreground"),
                },
                muted: {
                    DEFAULT: hsl("--muted"),
                    foreground: hsl("--muted-foreground"),
                },
                border: hsl("--border"),
                input: hsl("--input"),
                ring: hsl("--ring"),
                primary: {
                    DEFAULT: hsl("--primary"),
                    foreground: hsl("--primary-foreground"),
                },
                secondary: {
                    DEFAULT: hsl("--secondary"),
                    foreground: hsl("--secondary-foreground"),
                },
                destructive: {
                    DEFAULT: hsl("--destructive"),
                    foreground: hsl("--destructive-foreground"),
                },
                accent: {
                    DEFAULT: hsl("--accent"),
                    foreground: hsl("--accent-foreground"),
                },
                success: {
                    DEFAULT: hsl("--success"),
                    foreground: hsl("--success-foreground"),
                },
                warning: {
                    DEFAULT: hsl("--warning"),
                    foreground: hsl("--warning-foreground"),
                },
            },
            fontFamily: {
                sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            boxShadow: {
                card: "0 1px 3px 0 rgb(0 0 0 / .06), 0 1px 2px -1px rgb(0 0 0 / .06)",
                "card-hover": "0 4px 12px 0 rgb(0 0 0 / .10)",
            },
            keyframes: {
                "fade-in": {
                    from: { opacity: "0", transform: "translateY(4px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
            },
            animation: {
                "fade-in": "fade-in 0.15s ease-out",
            },
        },
    },
    plugins: [],
};

export default config;
