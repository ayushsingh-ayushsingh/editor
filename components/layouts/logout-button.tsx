"use client"

import React from 'react'
import { redirect, useRouter } from 'next/navigation'
import { toast } from "sonner"
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export default function LogoutButton() {
    const handleSignOut = async () => {
        try {
            await authClient.signOut();

            return {
                success: true,
                message: "Logged out successfully!"
            }
        } catch (error) {
            let errorMessage: string;

            if (error instanceof Error) {
                errorMessage = error.message;
            } else {
                errorMessage = "An unknown error occurred while logging out.";
            }

            return {
                success: false,
                message: errorMessage
            };
        }
    }

    const [isLoading, setIsLoading] = React.useState(false);
    const router = useRouter();

    async function onLogoutClick() {
        setIsLoading(true);
        const { success, message } = await handleSignOut();
        if (success) {
            toast.success(message as string || "Logout successful!");
            router.push("/login");
        } else {
            toast.error(message as string || "Login failed. Please try again.");
        }
        setIsLoading(false);
    }
    return (
        <Button onClick={onLogoutClick} disabled={isLoading}>
            {isLoading ? "Logging out..." : "Logout"}<LogOut className='size-4' />
        </Button>
    )
}
