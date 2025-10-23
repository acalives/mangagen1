
import React, { useState, useCallback } from 'react';
import { Story, MangaPage, MangaPanel, PlotNode, Character, Dialogue, Narration } from '../types';
// Removed static import: import * as geminiService from '../services/geminiService';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';

const PANELS_PER_PAGE = 4;

const getPageLayout = (panelCount: number): string => {
    if (panelCount <= 2) return 'grid-cols-1 grid-rows-2';
    if (panelCount === 3) return 'grid-cols-1 grid-rows-3';
    return 'grid-cols-2 grid-rows-2';
};

export const useMangaGenerator = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [mangaPages, setMangaPages] = useState<MangaPage[]>([]);
    const [story, setStory] = useState<Story | null>(null);

    const generateManga = useCallback(async (prompt: string) => {
        setIsLoading(true);
        setError(null);
        setMangaPages([]);
        setStory(null);

        try {
            // Dynamically import the service only when needed
            const geminiService = await import('../services/geminiService');

            setLoadingMessage('Crafting a compelling narrative...');
            const generatedStory = await geminiService.generateStory(prompt);
            setStory(generatedStory);

            setLoadingMessage(`Drawing ${generatedStory.plotNodes.length} panels... This may take a few minutes.`);
            
            const initialPanels: MangaPanel[] = generatedStory.plotNodes.map((node, index) => {
                const dialogues: Dialogue[] = node.dialogue.map((d, i) => ({
                    character: d.character,
                    text: d.text,
                    ...d.suggestedGeometry,
                    tail: { x: 50, y: 115 },
                    fontSize: 100,
                }));

                const narration: Narration | null = node.narration
                    ? {
                        text: node.narration.text,
                        ...node.narration.suggestedGeometry,
                        fontSize: 100,
                    }
                    : null;

                return {
                    id: node.panelId,
                    imageUrl: '',
                    dialogue: dialogues,
                    narration: narration,
                    isGenerating: true,
                };
            });

            const pages: MangaPage[] = [];
            for (let i = 0; i < initialPanels.length; i += PANELS_PER_PAGE) {
                const pagePanels = initialPanels.slice(i, i + PANELS_PER_PAGE);
                pages.push({
                    pageNumber: pages.length + 1,
                    panels: pagePanels,
                    layout: getPageLayout(pagePanels.length),
                });
            }
            setMangaPages(pages);
            
            for (let i = 0; i < generatedStory.plotNodes.length; i++) {
                const node = generatedStory.plotNodes[i];
                try {
                    const imageUrl = await geminiService.generatePanelImage(node, generatedStory.characters);
                    setMangaPages(prevPages => {
                        const newPages = JSON.parse(JSON.stringify(prevPages));
                        for (const page of newPages) {
                            const panel = page.panels.find(p => p.id === node.panelId);
                            if (panel) {
                                panel.imageUrl = imageUrl;
                                panel.isGenerating = false;
                                break;
                            }
                        }
                        return newPages;
                    });
                } catch (panelErr) {
                     console.error(`Failed to generate panel ${node.panelId}`, panelErr);
                     setMangaPages(prevPages => {
                        const newPages = JSON.parse(JSON.stringify(prevPages));
                        for (const page of newPages) {
                            const panel = page.panels.find(p => p.id === node.panelId);
                            if (panel) {
                                panel.isGenerating = false;
                            }
                        }
                        return newPages;
                    });
                }
            }
            
            setLoadingMessage('Assembling the manga pages...');

        } catch (err) {
            console.error(err);
            let errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            if (errorMessage.includes('Failed to fetch')) {
                errorMessage = 'Failed to fetch. This may be due to a network issue or a Content Security Policy (CSP) / CORS error. Please check your network connection and ensure the execution environment allows requests to Google Cloud services.';
            }
            setError(`Generation failed: ${errorMessage}`);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, []);

    const updatePanel = useCallback((pageIndex: number, panelId: string, updatedPanelData: Partial<MangaPanel>) => {
        setMangaPages(prevPages => {
            const newPages = JSON.parse(JSON.stringify(prevPages));
            const page = newPages[pageIndex];
            if (page) {
                const panelIndex = page.panels.findIndex(p => p.id === panelId);
                if (panelIndex !== -1) {
                    page.panels[panelIndex] = {
                        ...page.panels[panelIndex],
                        ...updatedPanelData,
                    };
                }
            }
            return newPages;
        });
    }, []);

    const regeneratePanel = useCallback(async (pageIndex: number, panelId: string, correctivePrompt?: string) => {
        if (!story) return;

        const plotNode = story.plotNodes.find(node => node.panelId === panelId);
        if (!plotNode) return;

        updatePanel(pageIndex, panelId, { isGenerating: true });

        try {
            // Dynamically import the service only when needed
            const geminiService = await import('../services/geminiService');
            const newImageUrl = await geminiService.generatePanelImage(plotNode, story.characters, correctivePrompt);
            updatePanel(pageIndex, panelId, { imageUrl: newImageUrl, isGenerating: false });
        } catch (err) {
            console.error("Regeneration failed:", err);
            setError(err instanceof Error ? err.message : "Regeneration failed.");
            updatePanel(pageIndex, panelId, { isGenerating: false });
        }
    }, [story, updatePanel]);

    const saveManga = useCallback(() => {
        if (!story || mangaPages.length === 0) {
            setError("Nothing to save.");
            return;
        }
        try {
            const saveData = {
                story,
                mangaPages,
                savedAt: new Date().toISOString(),
            };
            const jsonString = JSON.stringify(saveData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `manga-gen-story-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setError(null);
        } catch (err) {
            console.error("Save failed:", err);
            setError("Could not save the manga file.");
        }
    }, [story, mangaPages]);

    const loadManga = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const result = event.target?.result;
                if (typeof result !== 'string') {
                    throw new Error("File is not readable.");
                }
                const loadedData = JSON.parse(result);
                if (loadedData.story && loadedData.mangaPages) {
                    setStory(loadedData.story);
                    setMangaPages(loadedData.mangaPages);
                    setError(null);
                } else {
                    throw new Error("Invalid save file format.");
                }
            } catch (err) {
                console.error("Load failed:", err);
                setError(err instanceof Error ? err.message : "Could not load or parse the file.");
            }
        };
        reader.onerror = () => {
            setError("Failed to read the file.");
        };
        reader.readAsText(file);
    }, []);

    const downloadManga = useCallback(async () => {
        if (mangaPages.length === 0) {
            setError("Nothing to download.");
            return;
        }
        setIsLoading(true);
        setLoadingMessage("Preparing your manga for download...");
        setError(null);

        try {
            const zip = new JSZip();
            const pageElements = document.querySelectorAll('.manga-page-container');

            for (let i = 0; i < pageElements.length; i++) {
                const element = pageElements[i] as HTMLElement;
                setLoadingMessage(`Rendering page ${i + 1} of ${pageElements.length}...`);
                
                const canvas = await html2canvas(element, {
                    scale: 2, // Increase resolution
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                });

                const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
                if (blob) {
                    zip.file(`page-${i + 1}.png`, blob);
                }
            }

            setLoadingMessage("Zipping files...");
            const zipBlob = await zip.generateAsync({ type: 'blob' });

            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `manga-gen-${Date.now()}.zip`;
            document.body.appendChild(a);
a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (err) {
            console.error("Download failed:", err);
            setError("Could not download the manga. See console for details.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [mangaPages]);

    return {
        isLoading,
        loadingMessage,
        error,
        mangaPages,
        generateManga,
        updatePanel,
        regeneratePanel,
        saveManga,
        loadManga,
        downloadManga,
    };
};
