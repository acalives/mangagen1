
import React, { useState, useEffect } from 'react';

interface EditableTextProps {
    initialText: string;
    onSave: (newText: string) => void;
    textClassName?: string;
    fontSize?: number;
}

export function EditableText({ initialText, onSave, textClassName, fontSize = 100 }: EditableTextProps): React.ReactNode {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(initialText);

    useEffect(() => {
        setText(initialText);
    }, [initialText]);

    const handleBlur = () => {
        setIsEditing(false);
        onSave(text);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleBlur();
        }
        if (e.key === 'Escape') {
            setText(initialText);
            setIsEditing(false);
        }
    };

    const style = { fontSize: `${fontSize}%` };

    if (isEditing) {
        return (
            <textarea
                data-no-drag="true"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="w-full h-full bg-gray-200 text-black rounded p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                autoFocus
                onClick={(e) => e.stopPropagation()}
                style={style}
            />
        );
    }

    return (
        <div data-no-drag="true" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className={`w-full h-full flex items-center justify-center text-center cursor-pointer ${textClassName}`} style={style}>
            <p>{text}</p>
        </div>
    );
}
