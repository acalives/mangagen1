
export interface Character {
    name: string;
    description: string;
}

export interface ElementGeometry {
    x: number; // percentage
    y: number; // percentage
    width: number; // percentage
    height: number; // percentage;
}

export interface Dialogue extends ElementGeometry {
    character: string;
    text: string;
    tail: { x: number; y: number }; // Percentage relative to the bubble's own dimensions
    fontSize?: number; // Percentage, e.g., 100 for default
}

export interface Narration extends ElementGeometry {
    text: string;
    fontSize?: number; // Percentage, e.g., 100 for default
}

export interface PlotNode {
    panelId: string;
    description: string;
    charactersInPanel: string[];
    dialogue: { 
        character: string; 
        text: string;
        suggestedGeometry: ElementGeometry;
    }[];
    narration: {
        text: string;
        suggestedGeometry: ElementGeometry;
    } | null;
    emotionalTone: string;
}

export interface Story {
    synopsis: string;
    characters: Character[];
    plotNodes: PlotNode[];
}

export interface MangaPanel {
    id: string;
    imageUrl: string;
    dialogue: Dialogue[];
    narration: Narration | null;
    isGenerating: boolean;
}

export interface MangaPage {
    pageNumber: number;
    panels: MangaPanel[];
    layout: string; // e.g., '2x2', '1x3'
}
