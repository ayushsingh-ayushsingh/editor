"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from '@/components/ui/label'
import { Switch } from "@/components/ui/switch"

import DogAnimation from "@/components/animations/dog-animation";

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [showAnimation, setShowAnimation] = useState<boolean>(true)

    useEffect(() => {
        setMounted(true)
        const storedValue = localStorage.getItem("showAnimation")
        if (storedValue !== null) {
            setShowAnimation(storedValue === "true")
        }
    }, [])

    useEffect(() => {
        if (mounted) {
            localStorage.setItem("showAnimation", showAnimation.toString())
        }
    }, [showAnimation, mounted])

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    if (!mounted) {
        return (
            <div className="fixed bottom-4 right-4 z-50 flex items-center">
                <div className='flex flex-col gap-3 fixed right-16'>
                    <div className='flex items-center space-x-2 bg-background'>
                        <Switch checked={true} aria-label="Loading animation toggle" />
                    </div>
                </div>
                <Button variant="secondary" size="icon" aria-label="Loading theme toggle">
                    <Sun className="h-[1.2rem] w-[1.2rem]" />
                </Button>
            </div>
        )
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center">
            {showAnimation && <DogAnimation />}
            <div className='flex flex-col gap-3 fixed right-16'>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className='flex items-center space-x-2 bg-background rounded-full'>
                            <Label htmlFor='toggle-dog-animation' className="sr-only">
                                Toggle Dog Animation
                            </Label>
                            <Switch
                                aria-label="Animated large switch"
                                id="large-switch"
                                checked={showAnimation}
                                onCheckedChange={setShowAnimation}
                            />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent><p>Dogs Animation</p></TooltipContent>
                </Tooltip>
            </div>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="secondary" size="icon" onClick={toggleTheme}>
                        <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Light / Dark</p></TooltipContent>
            </Tooltip>
        </div>
    )
}