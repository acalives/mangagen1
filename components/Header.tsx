
import React, { useRef } from 'react';
import { SaveIcon, UploadIcon, DownloadIcon } from './icons';

interface HeaderProps {
    onSave: () => void;
    onLoad: (file: File) => void;
    onDownload: () => void;
    isSaveDisabled: boolean;
}

export function Header({ onSave, onLoad, onDownload, isSaveDisabled }: HeaderProps): React.ReactNode {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onLoad(file);
        }
        // Reset file input to allow loading the same file again
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-20">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    <span className="font-bangers text-4xl md:text-5xl text-indigo-400 mr-2 tracking-wider">Manga-Gen</span>
                    <span className="hidden md:inline">AI Manga Creator</span>
                </h1>
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".json"
                        onChange={handleFileChange}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                        aria-label="Load manga project"
                    >
                        <UploadIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Load</span>
                    </button>
                    <button
                        onClick={onSave}
                        disabled={isSaveDisabled}
                        className="flex items-center gap-2 bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                        aria-label="Save manga project"
                    >
                        <SaveIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Save</span>
                    </button>
                     <button
                        onClick={onDownload}
                        disabled={isSaveDisabled}
                        className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                        aria-label="Download manga as ZIP"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Download</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
