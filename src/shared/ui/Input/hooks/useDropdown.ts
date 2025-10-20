import React from 'react';
import { useClickOutside } from './useClickOutside';

export const useDropdown = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    useClickOutside(ref, () => setIsOpen(false), isOpen);

    const toggle = () => setIsOpen(!isOpen);
    const close = () => setIsOpen(false);

    return { isOpen, toggle, close, ref };
};