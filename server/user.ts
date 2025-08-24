"use server";

import { auth } from "@/lib/auth"

export const signIn = async (email: string, password: string) => {
    try {
        await auth.api.signInEmail({
            body: {
                email,
                password,
            }
        })
        return {
            success: true,
            message: "Logged in successfully."
        }
    } catch (error) {
        let errorMessage: string;

        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            errorMessage = "An unknown error occurred while signing in.";
        }

        return {
            success: false,
            message: errorMessage
        };
    }
}

export const signUp = async (name: string, email: string, password: string) => {
    try {
        await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
            }
        })
        return {
            success: true,
            message: "Registered successfully."
        }
    } catch (error) {
        let errorMessage: string;

        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            errorMessage = "An unknown error occurred while registering.";
        }

        return {
            success: false,
            message: errorMessage
        };
    }
}
