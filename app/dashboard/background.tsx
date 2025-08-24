"use client"

import Silk from '@/components/react-bits/Silk';
import Iridescence from "@/components/react-bits/Iridescence";
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

function Background() {
    const { theme } = useTheme();

    return (
        <div>
            {theme === "dark" ? <Silk /> : <Iridescence />}
        </div>
    )
}

export default Background