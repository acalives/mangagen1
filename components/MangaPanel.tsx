
import React, { useRef, useState } from 'react';
import { MangaPanel as MangaPanelType } from '../types';
import { SpeechBubble } from './SpeechBubble';
import { EditableText } from './EditableText';
import { RegenerateIcon, SpinnerIcon } from './icons';
import { DraggableResizable } from './DraggableResizable';

interface MangaPanelProps {
    panel: MangaPanelType;
    onUpdate: (updatedPanelData: Partial<MangaPanelType>) => void;
    onRegenerate: (correctivePrompt?: string) => void;
}

export function MangaPanel({ panel, onUpdate, onRegenerate }: MangaPanelProps): React.ReactNode {
    const panelRef = useRef<HTMLDivElement>(null);
    const [correctivePrompt, setCorrectivePrompt] = useState('');

    const handleDialogueUpdate = (index: number, updates: object) => {
        const newDialogue = [...panel.dialogue];
        newDialogue[index] = { ...newDialogue[index], ...updates };
        onUpdate({ dialogue: newDialogue });
    };

    const handleNarrationUpdate = (updates: object) => {
        if (panel.narration) {
            const newNarration = { ...panel.narration, ...updates };
            onUpdate({ narration: newNarration });
        }
    };

    const handleFontSizeChange = (
        type: 'dialogue' | 'narration',
        index: number,
        direction: 'increase' | 'decrease'
    ) => {
        const amount = direction === 'increase' ? 10 : -10;
        if (type === 'dialogue') {
            const currentSize = panel.dialogue[index].fontSize || 100;
            const newSize = Math.max(50, currentSize + amount); // Min size 50%
            handleDialogueUpdate(index, { fontSize: newSize });
        } else if (type === 'narration' && panel.narration) {
            const currentSize = panel.narration.fontSize || 100;
            const newSize = Math.max(50, currentSize + amount);
            handleNarrationUpdate({ fontSize: newSize });
        }
    };

    return (
        <div ref={panelRef} className="relative aspect-[4/3] bg-gray-700 border-2 border-black overflow-hidden group">
            {panel.imageUrl ? (
                <img src={panel.imageUrl} alt="Manga panel" className="w-full h-full object-cover" />
            ) : (
                 <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    {panel.isGenerating && <SpinnerIcon className="w-10 h-10 text-white" />}
                 </div>
            )}
            
            {panel.isGenerating && panel.imageUrl && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-30">
                    <SpinnerIcon className="w-10 h-10 text-white" />
                </div>
            )}

            {panel.dialogue.map((d, index) => (
                <DraggableResizable
                    key={`dialogue-${index}`}
                    boundaryRef={panelRef}
                    x={d.x} y={d.y} width={d.width} height={d.height}
                    onUpdate={(geometry) => handleDialogueUpdate(index, geometry)}
                    onFontSizeChange={(dir) => handleFontSizeChange('dialogue', index, dir)}
                >
                    <SpeechBubble
                        tail={d.tail}
                        onTailUpdate={(newTail) => handleDialogueUpdate(index, { tail: newTail })}
                    >
                        <EditableText
                            initialText={d.text}
                            onSave={(newText) => handleDialogueUpdate(index, { text: newText })}
                            fontSize={d.fontSize}
                            textClassName="text-black leading-tight p-2"
                        />
                    </SpeechBubble>
                </DraggableResizable>
            ))}

            {panel.narration && (
                <DraggableResizable
                    key="narration"
                    boundaryRef={panelRef}
                    x={panel.narration.x} y={panel.narration.y} width={panel.narration.width} height={panel.narration.height}
                    onUpdate={(geometry) => handleNarrationUpdate(geometry)}
                    onFontSizeChange={(dir) => handleFontSizeChange('narration', 0, dir)}
                >
                    <div className="bg-gray-900/75 backdrop-blur-sm w-full h-full p-2 border-2 border-dashed border-gray-500/50 flex items-center justify-center rounded-md">
                        <EditableText
                            initialText={panel.narration.text}
                            onSave={(newText) => handleNarrationUpdate({ text: newText })}
                            fontSize={panel.narration.fontSize}
                            textClassName="text-white italic"
                        />
                    </div>
                </DraggableResizable>
            )}

            <div className="absolute top-1 right-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <input 
                    type="text"
                    value={correctivePrompt}
                    onChange={(e) => setCorrectivePrompt(e.target.value)}
                    placeholder="Corrective prompt..."
                    className="bg-black/60 text-white text-xs rounded-md p-1 border border-gray-500 focus:ring-2 focus:ring-indigo-400 outline-none"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                />
                <button
                    onClick={() => onRegenerate(correctivePrompt)}
                    disabled={panel.isGenerating}
                    className="bg-black/60 text-white p-1.5 rounded-full disabled:opacity-50"
                    aria-label="Regenerate panel with correction"
                >
                    <RegenerateIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
