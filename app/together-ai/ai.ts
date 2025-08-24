import { togetherai } from '@ai-sdk/togetherai';
import { streamText } from 'ai';
import { wrapLanguageModel, extractReasoningMiddleware } from 'ai';
import dotenv from "dotenv"
import { customProvider } from 'ai';

dotenv.config()

export const customAiProvider = customProvider({
    languageModels: {
        'llama-3.3': wrapLanguageModel({
            model: togetherai('meta-llama/Llama-3.3-70B-Instruct-Turbo-Free'),
            middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'deepseek-r1': wrapLanguageModel({
            model: togetherai('deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free'),
            middleware: extractReasoningMiddleware({ tagName: 'think' }),
        })
    },
    fallbackProvider: togetherai,
});

export const togetherAiModel = wrapLanguageModel({
    model: togetherai('deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free'),
    middleware: extractReasoningMiddleware({ tagName: 'think' }),
});

async function main(prompt = "") {
    const { textStream } = await streamText({
        model: customAiProvider.languageModel("llama-3.3"),
        prompt,
    });
    let response = "";
    for await (const textPart of textStream) {
        process.stdout.write(textPart);
        response += textPart;
    }
    console.log();
    return response;
}

main("Write a vegetarian lasagna recipe for 4 people.")
