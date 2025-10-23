
import React from 'react';
import { SpinnerIcon } from './icons';

interface LoaderProps {
    message: string;
}

export function Loader({ message }: LoaderProps): React.ReactNode {
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
            <SpinnerIcon className="w-16 h-16 text-indigo-400" />
            <p className="mt-4 text-lg text-gray-300 font-medium animate-pulse">{message}</p>
        </div>
    );
}
