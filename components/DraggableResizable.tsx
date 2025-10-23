
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ElementGeometry } from '../types';

interface DraggableResizableProps {
    children: React.ReactNode;
    x: number;
    y: number;
    width: number;
    height: number;
    onUpdate: (geometry: Partial<ElementGeometry>) => void;
    boundaryRef: React.RefObject<HTMLDivElement>;
    onFontSizeChange: (direction: 'increase' | 'decrease') => void;
}

export function DraggableResizable({ children, x, y, width, height, onUpdate, boundaryRef, onFontSizeChange }: DraggableResizableProps): React.ReactNode {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);
    const startPos = useRef({ x: 0, y: 0, left: 0, top: 0, width: 0, height: 0 });

    const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.dataset.resizeHandle || target.closest('[data-no-drag]')) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        const rect = elementRef.current?.getBoundingClientRect();
        startPos.current = { x: e.clientX, y: e.clientY, left: rect?.left || 0, top: rect?.top || 0, width: 0, height: 0 };
    };

    const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        const rect = elementRef.current?.getBoundingClientRect();
        startPos.current = { x: e.clientX, y: e.clientY, left: 0, top: 0, width: rect?.width || 0, height: rect?.height || 0 };
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging && !isResizing) return;
        e.preventDefault();
        e.stopPropagation();

        const boundaryRect = boundaryRef.current?.getBoundingClientRect();
        if (!boundaryRect) return;

        if (isDragging) {
            const dx = e.clientX - startPos.current.x;
            const dy = e.clientY - startPos.current.y;
            const newLeft = startPos.current.left + dx;
            const newTop = startPos.current.top + dy;
            
            const newXPercent = ((newLeft - boundaryRect.left) / boundaryRect.width) * 100;
            const newYPercent = ((newTop - boundaryRect.top) / boundaryRect.height) * 100;

            onUpdate({ x: newXPercent, y: newYPercent });
        }

        if (isResizing) {
            const dx = e.clientX - startPos.current.x;
            const dy = e.clientY - startPos.current.y;
            const newWidthPx = startPos.current.width + dx;
            const newHeightPx = startPos.current.height + dy;

            const newWidthPercent = (newWidthPx / boundaryRect.width) * 100;
            const newHeightPercent = (newHeightPx / boundaryRect.height) * 100;

            onUpdate({ width: newWidthPercent, height: newHeightPercent });
        }
    }, [isDragging, isResizing, boundaryRef, onUpdate]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setIsResizing(false);
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const clampedWidth = Math.max(10, width);
    const clampedHeight = Math.max(10, height);
    const clampedX = Math.max(0, Math.min(x, 100 - clampedWidth));
    const clampedY = Math.max(0, Math.min(y, 100 - clampedHeight));

    return (
        <div
            ref={elementRef}
            className="absolute p-1 box-border cursor-move group/draggable border border-dashed border-transparent hover:border-indigo-500/50 z-10"
            style={{
                left: `${clampedX}%`,
                top: `${clampedY}%`,
                width: `${clampedWidth}%`,
                height: `${clampedHeight}%`,
            }}
            onMouseDown={handleDragStart}
        >
            <div className="w-full h-full relative">
                {children}
            </div>
            <div
                data-resize-handle="true"
                className="absolute -right-1 -bottom-1 w-4 h-4 bg-indigo-500 rounded-full cursor-se-resize opacity-0 group-hover/draggable:opacity-100 transition-opacity z-20"
                onMouseDown={handleResizeStart}
            />
            <div 
                data-no-drag="true"
                className="absolute top-0 -right-7 flex flex-col gap-1 opacity-0 group-hover/draggable:opacity-100 transition-opacity z-20"
            >
                <button onClick={() => onFontSizeChange('increase')} className="w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-lg font-bold hover:bg-indigo-500">+</button>
                <button onClick={() => onFontSizeChange('decrease')} className="w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-lg font-bold hover:bg-indigo-500">-</button>
            </div>
        </div>
    );
}
