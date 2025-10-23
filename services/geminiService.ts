
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { Story, PlotNode, Character } from '../types';

// ===================================================================================
//  API KEY INSTRUCTIONS - THIS IS THE ONLY PLACE YOU NEED TO EDIT
// ===================================================================================
//
// Paste your Google Gemini API key into the quotes below.
//
// For detailed instructions, see the LOCAL_DEVELOPMENT.md file.
//
// ===================================================================================
const API_KEY = "Insert_Your_API_Key_Here";


// --- Do not edit below this line ---

let ai: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
    if (ai) {
        return ai;
    }

    if (!API_KEY || API_KEY === "PASTE_YOUR_API_KEY_HERE") {
        throw new Error("API Key is missing. Please open 'services/geminiService.ts' and paste your key into the `API_KEY` variable.");
    }

    ai = new GoogleGenAI({ apiKey: API_KEY });
    return ai;
}


const geometrySchema = {
    type: Type.OBJECT,
    description: "The position and size of the element as percentages of the panel's dimensions.",
    properties: {
        x: { type: Type.NUMBER, description: "Left edge position (0-100)." },
        y: { type: Type.NUMBER, description: "Top edge position (0-100)." },
        width: { type: Type.NUMBER, description: "Width of the element (10-100)." },
        height: { type: Type.NUMBER, description: "Height of the element (10-100)." },
    },
    required: ['x', 'y', 'width', 'height']
};

const storySchema = {
    type: Type.OBJECT,
    properties: {
        synopsis: { type: Type.STRING, description: "A one-paragraph summary of the story." },
        characters: {
            type: Type.ARRAY,
            description: "A list of the main characters.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The character's name." },
                    description: { type: Type.STRING, description: "A detailed visual and personality description of the character." }
                },
                required: ['name', 'description']
            }
        },
        plotNodes: {
            type: Type.ARRAY,
            description: "A sequence of plot nodes representing manga panels. This MUST be a strict chronological sequence.",
            items: {
                type: Type.OBJECT,
                properties: {
                    panelId: { type: Type.STRING, description: "A unique ID for the panel, e.g., 'page1_panel1'." },
                    description: { type: Type.STRING, description: "A highly detailed visual description of the scene, action, character poses, and expressions. Crucially, describe where each character is looking." },
                    charactersInPanel: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Names of unique characters present in the panel." },
                    dialogue: {
                        type: Type.ARRAY,
                        description: "Dialogue spoken by characters. Use sparingly. Maximum of 1 entry per panel.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                character: { type: Type.STRING, description: "The name of the character speaking." },
                                text: { type: Type.STRING, description: "The dialogue text. Keep it concise." },
                                suggestedGeometry: geometrySchema,
                            },
                            required: ['character', 'text', 'suggestedGeometry']
                        }
                    },
                    narration: {
                        type: Type.OBJECT,
                        description: "Narrator text. Use for brief scene-setting. Null if not needed.",
                        properties: {
                            text: { type: Type.STRING },
                            suggestedGeometry: geometrySchema,
                        },
                        required: ['text', 'suggestedGeometry']
                    },
                    emotionalTone: { type: Type.STRING, description: "The dominant emotion or mood of the panel." }
                },
                required: ['panelId', 'description', 'charactersInPanel', 'dialogue', 'narration', 'emotionalTone']
            }
        }
    },
    required: ['synopsis', 'characters', 'plotNodes']
};

export async function generateStory(prompt: string): Promise<Story> {
    const client = getAiClient();
    const result: GenerateContentResponse = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            role: 'user',
            parts: [{ text: `Create a manga story based on this prompt: "${prompt}". Follow the provided JSON schema precisely.` }]
        },
        config: {
            systemInstruction: `You are a master storyteller and manga scriptwriter. Your absolute top priority is creating a linear, coherent, and chronological story.
- **Strictly Sequential Plot**: Each plot node MUST be a direct causal consequence of the one immediately preceding it.
- **Visual Storytelling**: 'Show, don't tell'. Focus on rich, detailed visual descriptions, including character poses, expressions, and where they are looking.
- **Minimal Dialogue**: Use dialogue and narration only when absolutely necessary.
- **Layout Awareness**: For each piece of dialogue or narration, suggest a sensible placement and size for its text box.`,
            responseMimeType: 'application/json',
            responseSchema: storySchema,
        },
    });

    const jsonString = result.text;
    try {
        return JSON.parse(jsonString) as Story;
    } catch (e) {
        console.error("Failed to parse story JSON:", jsonString);
        throw new Error("The AI failed to return a valid story structure. Please try again.");
    }
}

export async function generatePanelImage(node: PlotNode, characters: Character[], correctivePrompt?: string): Promise<string> {
    const client = getAiClient();
    const uniqueCharacters = [...new Set(node.charactersInPanel)];
    const characterCount = uniqueCharacters.length;
    
    let characterTags = '';
    if (characterCount === 0) {
        characterTags = 'no people, ';
    } else if (characterCount === 1) {
        const char = characters.find(c => c.name === uniqueCharacters[0]);
        const isFemale = char && (char.description.toLowerCase().includes('woman') || char.description.toLowerCase().includes('girl'));
        characterTags = `solo, 1${isFemale ? 'girl' : 'boy'}, `;
    } else {
        characterTags = `${characterCount}people, `;
    }

    const characterDescriptions = characters
        .filter(c => uniqueCharacters.includes(c.name))
        .map(c => `${c.name} (${c.description})`)
        .join('; ');

    const imagePrompt = `
        (high quality, sharp focus, finely detailed), (monochrome, black and white manga panel), ${characterTags}
        (style: sharp line art, high contrast, dramatic shadows, screentones),
        (composition: anatomically correct, correct proportions, dynamic pose, natural physics, accurate gaze direction based on content description),
        (mood: ${node.emotionalTone}),
        (content: ${node.description}),
        (characters: ${characterDescriptions || 'None'}),
        ${correctivePrompt ? `(correction: ${correctivePrompt}),` : ''}
        (negative prompt: worst quality, low quality, blurry, text, letters, words, font, signature, watermark, speech bubble, dialogue, label, writing, artifacts, color, colorized, deformed, disfigured, bad anatomy, extra limbs, missing limbs, fused fingers, extra fingers)
    `;

    const response = await client.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: imagePrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '4:3',
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0 || !response.generatedImages[0].image.imageBytes) {
        throw new Error('Image generation failed to produce an image.');
    }

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
}
