export function getEnv(key: string) {
    const env = {
        BLOCKNOTE_AI_SERVER_API_KEY:
            process.env.NEXT_PUBLIC_BLOCKNOTE_AI_SERVER_API_KEY,
        BLOCKNOTE_AI_SERVER_BASE_URL:
            process.env.NEXT_PUBLIC_BLOCKNOTE_AI_SERVER_BASE_URL,
    };
    const value = env[key as keyof typeof env];
    return value;
}