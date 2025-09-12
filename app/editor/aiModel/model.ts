import { createGoogleGenerativeAI } from "@ai-sdk/google";

const model = createGoogleGenerativeAI({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
})("gemini-2.5-flash")

