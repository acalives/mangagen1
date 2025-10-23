
import React from 'react';
import { Header } from './components/Header';
import { PromptForm } from './components/PromptForm';
import { Loader } from './components/Loader';
import { MangaPage } from './components/MangaPage';
import { useMangaGenerator } from './hooks/useMangaGenerator';
import { MangaPanel } from './types';

export default function App(): React.ReactNode {
    const {
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
    } = useMangaGenerator();

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
            <Header 
                onSave={saveManga} 
                onLoad={loadManga}
                onDownload={downloadManga}
                isSaveDisabled={mangaPages.length === 0 || isLoading}
            />
            <main className="flex-grow container mx-auto px-4 py-8 flex flex-col">
                <PromptForm onSubmit={generateManga} isLoading={isLoading} />

                {isLoading && <Loader message={loadingMessage} />}

                {error && (
                    <div className="mt-8 bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg" role="alert">
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline ml-2">{error}</span>
                    </div>
                )}

                {!isLoading && mangaPages.length === 0 && !error && (
                     <div className="flex-grow flex items-center justify-center text-center">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl font-bold text-gray-400">Welcome to Manga-Gen</h2>
                            <p className="mt-4 text-lg text-gray-500">
                                Enter a story idea above to begin your AI-powered manga creation journey. Your generated pages will appear here.
                            </p>
                        </div>
                    </div>
                )}

                <div id="manga-container" className="mt-8 space-y-12">
                    {mangaPages.map((page, pageIndex) => (
                        <MangaPage
                            key={page.pageNumber}
                            page={page}
                            onUpdatePanel={(panelId, updatedData) => updatePanel(pageIndex, panelId, updatedData)}
                            onRegeneratePanel={(panelId, correctivePrompt) => regeneratePanel(pageIndex, panelId, correctivePrompt)}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
