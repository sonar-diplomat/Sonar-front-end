import React, {useEffect, useRef, useState, useMemo, useCallback, type CSSProperties} from "react";
import styles from "./WheelPicker.module.css";

export interface WheelPickerOption {
    label: string;
    value: string;
}

interface WheelPickerProps {
    options: WheelPickerOption[];
    value?: string;
    onChange?: (value: string) => void;
    infinite?: boolean;
    itemHeight?: number;
    visibleItems?: number;
    className?: string;
}

interface WheelPickerWrapperProps {
    children: React.ReactNode;
    className?: string;
}

const SCROLL_SNAP_DELAY = 150;
const REPOSITION_THRESHOLD = 0.5;
const SCROLL_ALIGNMENT_TOLERANCE = 1;

export const WheelPickerWrapper: React.FC<WheelPickerWrapperProps> = ({ children, className = "" }) => {
    return (
        <div className={`${styles.wheelPickerWrapper} ${className}`}>
            {children}
        </div>
    );
};

export const WheelPicker: React.FC<WheelPickerProps> = ({
    options,
    value,
    onChange,
    infinite = false,
    itemHeight = 44,
    visibleItems = 5,
    className = "",
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollTimeoutRef = useRef<number | null>(null);
    const isScrollingRef = useRef(false);
    const isRepositioningRef = useRef(false);
    const lastScrollTopRef = useRef(0);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const displayOptions = useMemo(
        () => infinite ? [...options, ...options, ...options] : options,
        [options, infinite]
    );

    const initialOffset = useMemo(
        () => infinite ? options.length : 0,
        [infinite, options.length]
    );

    const containerHeight = useMemo(
        () => visibleItems * itemHeight,
        [visibleItems, itemHeight]
    );

    const scrollToIndex = useCallback((index: number, smooth = true) => {
        if (!containerRef.current) return;

        const scrollTop = index * itemHeight;
        containerRef.current.scrollTo({
            top: scrollTop,
            behavior: smooth ? "smooth" : "auto",
        });
    }, [itemHeight]);

    const getActualIndex = useCallback((displayIndex: number): number => {
        return infinite ? displayIndex % options.length : displayIndex;
    }, [infinite, options.length]);

    const updateSelection = useCallback((index: number) => {
        const actualIndex = getActualIndex(index);
        setSelectedIndex(actualIndex);
        if (onChange && options[actualIndex]) {
            onChange(options[actualIndex].value);
        }
    }, [getActualIndex, onChange, options]);

    const repositionScroll = useCallback((newScrollTop: number) => {
        if (!containerRef.current) return;

        isRepositioningRef.current = true;
        containerRef.current.scrollTop = newScrollTop;
        lastScrollTopRef.current = newScrollTop;
        requestAnimationFrame(() => {
            isRepositioningRef.current = false;
        });
    }, []);

    const snapToNearest = useCallback(() => {
        if (!containerRef.current) return;

        const scrollTop = containerRef.current.scrollTop;
        const currentIndex = scrollTop / itemHeight;
        let nearestIndex = Math.round(currentIndex);

        if (infinite) {
            const originalLength = options.length;
            const totalItems = displayOptions.length;

            if (nearestIndex < originalLength) {
                nearestIndex += originalLength;
                containerRef.current.scrollTop = nearestIndex * itemHeight;
                lastScrollTopRef.current = nearestIndex * itemHeight;
            } else if (nearestIndex >= totalItems - originalLength) {
                nearestIndex -= originalLength;
                containerRef.current.scrollTop = nearestIndex * itemHeight;
                lastScrollTopRef.current = nearestIndex * itemHeight;
            }

            const finalNearestIndex = Math.round(containerRef.current.scrollTop / itemHeight);
            updateSelection(finalNearestIndex);

            const offset = containerRef.current.scrollTop % itemHeight;
            const needsAlignment = Math.abs(offset) > SCROLL_ALIGNMENT_TOLERANCE &&
                Math.abs(offset - itemHeight) > SCROLL_ALIGNMENT_TOLERANCE;

            if (needsAlignment) {
                scrollToIndex(finalNearestIndex, true);
            }
        } else {
            nearestIndex = Math.max(0, Math.min(nearestIndex, options.length - 1));
            updateSelection(nearestIndex);
            scrollToIndex(nearestIndex, true);
        }
    }, [infinite, itemHeight, options.length, displayOptions.length, updateSelection, scrollToIndex]);

    const handleScroll = useCallback(() => {
        if (!containerRef.current || isRepositioningRef.current) return;

        const scrollTop = containerRef.current.scrollTop;
        const scrollDelta = scrollTop - lastScrollTopRef.current;

        isScrollingRef.current = true;

        if (infinite && scrollDelta !== 0) {
            const currentIndex = scrollTop / itemHeight;
            const originalLength = options.length;
            const totalItems = displayOptions.length;
            const threshold = originalLength * REPOSITION_THRESHOLD;

            if (scrollDelta < 0 && currentIndex < threshold) {
                const newScrollTop = scrollTop + (originalLength * itemHeight);
                repositionScroll(newScrollTop);
                return;
            }
            else if (scrollDelta > 0 && currentIndex > totalItems - threshold) {
                const newScrollTop = scrollTop - (originalLength * itemHeight);
                repositionScroll(newScrollTop);
                return;
            }
        }

        lastScrollTopRef.current = scrollTop;

        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
            snapToNearest();
            isScrollingRef.current = false;
        }, SCROLL_SNAP_DELAY);
    }, [infinite, itemHeight, options.length, displayOptions.length, repositionScroll, snapToNearest]);

    const handleItemClick = useCallback((index: number) => {
        scrollToIndex(index, true);
        updateSelection(index);
    }, [scrollToIndex, updateSelection]);

    useEffect(() => {
        if (value !== undefined) {
            const index = options.findIndex((opt) => opt.value === value);
            if (index !== -1) {
                setSelectedIndex(index);
                scrollToIndex(index + initialOffset, false);
            }
        } else {
            const middleIndex = Math.floor(options.length / 2);
            setSelectedIndex(middleIndex);
            scrollToIndex(middleIndex + initialOffset, false);
        }
    }, [value, options, initialOffset, scrollToIndex]);

    const isItemSelected = useCallback((index: number): boolean => {
        const actualIndex = getActualIndex(index);
        if (infinite) {
            return actualIndex === selectedIndex &&
                index >= options.length &&
                index < options.length * 2;
        }
        return actualIndex === selectedIndex;
    }, [infinite, selectedIndex, options.length, getActualIndex]);

    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    return (
        <>
            <div className={`${styles.wheelPickerContainer} ${className}`}>
                <div
                    ref={containerRef}
                    className={styles.wheelPickerScroll}
                    onScroll={handleScroll}
                    style={
                        {
                            height: `${containerHeight}px`,
                            "--item-height": `${itemHeight}px`,
                        } as CSSProperties
                    }
                >
                    {/* Items */}
                    {displayOptions.map((option, index) => {
                        const isSelected = isItemSelected(index);

                        return (
                            <div
                                key={`${option.value}-${index}`}
                                className={`${styles.wheelPickerItem} ${
                                    isSelected ? styles.selected : ""
                                }`}
                                style={{height: `${itemHeight}px`}}
                                onClick={() => handleItemClick(index)}
                            >
                                {option.label}
                            </div>
                        );
                    })}
                </div>

            </div>
            <div className={styles.highlightWrapper}/>
        </>
    );
};