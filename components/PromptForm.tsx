
import React, { useState } from 'react';

interface PromptFormProps {
    onSubmit: (prompt: string) => void;
    isLoading: boolean;
}

export function PromptForm({ onSubmit, isLoading }: PromptFormProps): React.ReactNode {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() && !isLoading) {
            onSubmit(prompt.trim());
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-2 flex items-center gap-2 shadow-lg">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A sci-fi mystery about a lone android detective on a rain-slicked, futuristic Earth..."
                    className="flex-grow bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none resize-none p-3 h-16"
                    disabled={isLoading}
                    aria-label="Manga story prompt"
                />
                <button
                    type="submit"
                    disabled={isLoading || !prompt.trim()}
                    className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    {isLoading ? 'Generating...' : 'Generate'}
                </button>
            </form>
        </div>
    );
}
