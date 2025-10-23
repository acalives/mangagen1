
import React from 'react';
import { MangaPage as MangaPageType, MangaPanel as MangaPanelType } from '../types';
import { MangaPanel } from './MangaPanel';

interface MangaPageProps {
    page: MangaPageType;
    onUpdatePanel: (panelId: string, updatedData: Partial<MangaPanelType>) => void;
    onRegeneratePanel: (panelId: string, correctivePrompt?: string) => void;
}

export function MangaPage({ page, onUpdatePanel, onRegeneratePanel }: MangaPageProps): React.ReactNode {
    return (
        <div className="w-full max-w-4xl mx-auto bg-white shadow-2xl rounded-lg p-4 manga-page-container">
            <div className={`grid ${page.layout} gap-4`}>
                {page.panels.map((panel) => (
                    <MangaPanel
                        key={panel.id}
                        panel={panel}
                        onUpdate={(updatedData) => onUpdatePanel(panel.id, updatedData)}
                        onRegenerate={(correctivePrompt) => onRegeneratePanel(panel.id, correctivePrompt)}
                    />
                ))}
            </div>
            <div className="text-center mt-2 text-gray-500 font-semibold">
                - {page.pageNumber} -
            </div>
        </div>
    );
}
