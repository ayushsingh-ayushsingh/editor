import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL
})


const authClientGithub = createAuthClient()
export const signInWithGithub = async () => {
    await authClientGithub.signIn.social({
        provider: "github",
        callbackURL: "/dashboard"
    })
}

const authClientGoogle = createAuthClient()
export const signInWithGoogle = async () => {
    await authClientGoogle.signIn.social({
        provider: "google",
        callbackURL: "/dashboard"
    })
}