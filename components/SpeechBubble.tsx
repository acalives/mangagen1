
import React, { useState, useRef, useCallback, useEffect } from 'react';

interface SpeechBubbleProps {
    children: React.ReactNode;
    tail: { x: number; y: number };
    onTailUpdate: (newTail: { x: number; y: number }) => void;
}

export function SpeechBubble({ children, tail, onTailUpdate }: SpeechBubbleProps): React.ReactNode {
    const bubbleRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !bubbleRef.current) return;
        const rect = bubbleRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
        onTailUpdate({ x, y });
    }, [isDragging, onTailUpdate]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const angle = (Math.atan2(tail.y - 50, tail.x - 50) * 180) / Math.PI + 90;
    const distance = Math.sqrt(Math.pow(tail.x - 50, 2) + Math.pow(tail.y - 50, 2));
    
    const isOutside = distance > 48;

    return (
        <div ref={bubbleRef} className="w-full h-full bg-white rounded-lg shadow-md relative text-black flex items-center justify-center p-1 group/bubble" data-no-drag="true">
            {children}
            {isOutside && (
                <div
                    className="absolute"
                    style={{
                        left: '50%',
                        top: '50%',
                        transform: `rotate(${angle}deg) translateY(-50%)`,
                        transformOrigin: 'top center',
                        height: '50%',
                    }}
                >
                    <svg width="24" height="12" viewBox="0 0 24 12" className="fill-current text-white" style={{position: 'absolute', top: 'calc(50% - 6px)', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))'}}>
                        <path d="M0 0 L12 12 L24 0 Z" />
                    </svg>
                </div>
            )}
            <div
                className="absolute w-4 h-4 bg-indigo-500 rounded-full cursor-pointer -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/bubble:opacity-100 transition-opacity border-2 border-white shadow-lg"
                style={{ left: `${tail.x}%`, top: `${tail.y}%` }}
                onMouseDown={handleMouseDown}
            />
        </div>
    );
}
