import { GoogleGenAI, Type } from "@google/genai";
import { SurpriseContent } from "../types";

let ai: GoogleGenAI | null = null;

export const initializeAi = (apiKey: string) => {
    if (!apiKey) {
        console.error("API key is missing for AI initialization.");
        ai = null;
        return;
    }
    ai = new GoogleGenAI({ apiKey });
};

const getAiClient = (): GoogleGenAI => {
    if (!ai) {
        throw new Error("API_KEY_MISSING");
    }
    return ai;
};

const handleApiError = (error: unknown): never => {
    console.error("API Error:", error);
    if (error instanceof Error) {
        const lowerCaseMessage = error.message.toLowerCase();
        // Check for specific Gemini API error codes or messages
        if (lowerCaseMessage.includes("api key not valid")) {
             throw new Error("The provided API key is invalid. Please check and try again.");
        }
        if (lowerCaseMessage.includes("429") || lowerCaseMessage.includes("resource_exhausted") || lowerCaseMessage.includes("quota")) {
            throw new Error("QUOTA_EXCEEDED");
        }
        throw new Error(error.message);
    }
    throw new Error("An unknown error occurred during the API call.");
};


export const generateImagePrompt = async (params: {
    artStyle: string;
    characterDescription?: string;
    pageText?: string;
    isCover?: boolean;
    isBackCover?: boolean;
    title?: string;
}): Promise<string> => {
    const aiClient = getAiClient();
    try {
        const { artStyle, characterDescription, pageText, isCover, isBackCover, title } = params;
        let content = "";
        const systemInstruction = "You are an expert prompt engineer for a generative AI that creates illustrations. Your output is ONLY the final, ready-to-use prompt for the image AI. Do not add any conversational text or explanations around it."

        if (isCover) {
            content = `Generate a rich, detailed, and effective prompt for a text-to-image AI. The goal is a beautiful, purely visual children's storybook cover.
- Art Style: ${artStyle}.
- Main Character: ${characterDescription}.
- Story Title (for context only, DO NOT include in image): ${title}.
- Scene: The main character should be the central focus, looking friendly and welcoming. The background should be whimsical and hint at the story's world without being too busy.
- CRITICAL RULE: The prompt you generate must instruct the AI to create a purely visual image with absolutely NO text, words, or letters. Any text is a failure.`;
        } else if (isBackCover) {
            content = `Generate a rich, detailed, and effective prompt for a text-to-image AI. The goal is the final page of a children's storybook.
- Art Style: ${artStyle}.
- Scene: The image should feature the words "The End" in a beautiful, artistic, and easy-to-read font that perfectly matches the '${artStyle}' style. The background should be a simple, complementary decorative pattern, also in the same art style.
- CRITICAL RULE: The prompt you generate must instruct the AI to ONLY include the text "The End". No other characters, objects, or words should be present.`;
        } else { // Story page
            content = `Generate a rich, detailed, and effective prompt for a text-to-image AI. The goal is a full-page illustration for a children's storybook.
- Art Style: ${artStyle}.
- Main Character: ${characterDescription}.
- Scene to Illustrate: ${pageText}.
- Instructions: Create a prompt that vividly describes the scene, focusing on the character's actions, emotions, and the environment.
- CRITICAL RULE: The prompt you generate must instruct the AI to create a purely visual image with absolutely NO text, words, or letters. Any text is a failure.`;
        }

        const response = await aiClient.models.generateContent({ model: "gemini-2.5-flash", contents: content, config: { systemInstruction }});
        return response.text.trim();
    } catch (error) {
        handleApiError(error);
    }
};

export const generateTitle = async (character: string, story: string[]): Promise<string> => {
    const aiClient = getAiClient();
    try {
        const response = await aiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a short, catchy, and appropriate title for a children's storybook. The main character is: "${character}". The story is about: "${story.join(" ")}". The title should be 6 words or less. Do not use quotes in the output.`,
        });
        return response.text.trim().replace(/"/g, '');
    } catch (error) {
        handleApiError(error);
    }
};

export const generateSurpriseContent = async (pageCount: number): Promise<SurpriseContent> => {
    const aiClient = getAiClient();
    try {
         const response = await aiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a creative and whimsical main character description for a children's storybook, and a story for it split into exactly ${pageCount} parts (one sentence per part). The character should be an animal or a cute creature.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        character: { type: Type.STRING, description: "A whimsical description of a main character for a children's storybook. e.g., A tiny, shy gnome with a beard made of moss and a hat shaped like a mushroom." },
                        story: {
                            type: Type.ARRAY,
                            description: `A story for the character, split into an array of exactly ${pageCount} sentences.`,
                            items: { type: Type.STRING },
                            minItems: pageCount,
                            maxItems: pageCount,
                        }
                    },
                    required: ["character", "story"],
                },
            },
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        handleApiError(error);
    }
};

export const generateImage = async (prompt: string): Promise<string> => {
    const aiClient = getAiClient();
    try {
        const response = await aiClient.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '4:3' },
        });
        
        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated. The response may have been blocked due to safety policies.");
        }
    } catch (error) {
        handleApiError(error);
    }
};