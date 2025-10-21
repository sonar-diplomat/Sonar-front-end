import React from 'react';

export const useClickOutside = (
    ref: React.RefObject<HTMLElement>,
    handler: () => void,
    isActive: boolean
) => {
    React.useEffect(() => {
        if (!isActive) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                handler();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [ref, handler, isActive]);
};