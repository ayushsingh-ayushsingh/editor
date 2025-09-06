"use client"

import Iridescence from "@/components/react-bits/Iridescence";
import { useTheme } from 'next-themes';
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const Silk = dynamic(() => import("@/components/react-bits/Silk"), { ssr: false });

function Background() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    // During SSR and before client mount render a stable wrapper that matches server HTML.
    if (!mounted) {
        return <div className="w-[100vw] h-[100vh] fixed top-0 left-0 -z-10" />;
    }

    return (
        <div>
            {theme === "dark" ? <Silk /> : <Iridescence />}
        </div>
    )
}

export default Background