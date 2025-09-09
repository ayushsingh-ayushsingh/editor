import { heroui } from "@heroui/react";

const config = {
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./node_modules/@heroui/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [
        heroui(),
    ],
};
export default config;
