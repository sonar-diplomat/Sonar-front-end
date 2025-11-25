import React from "react";
import {useEffect, useRef, useState, type CSSProperties} from "react";
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

export const WheelPickerWrapper: React.FC<WheelPickerWrapperProps> = ({ children, className = "" }) => {
    return (
        <div className={`${styles.wheelPickerWrapper} ${className}`}>
            {children}
        </div>
    );
}

export const WheelPicker: React.FC<WheelPickerProps> = ({ options, value, onChange, infinite = false, itemHeight = 44, visibleItems = 5, className = "",}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollTimeoutRef = useRef<number | null>(null);
    const isScrollingRef = useRef(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const displayOptions = infinite
        ? [...options, ...options, ...options]
        : options;

    const initialOffset = infinite ? options.length : 0;

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
    }, [value, options]);

    const scrollToIndex = (index: number, smooth = true) => {
        if (!containerRef.current) return;

        const scrollTop = index * itemHeight;
        containerRef.current.scrollTo({
            top: scrollTop,
            behavior: smooth ? "smooth" : "auto",
        });
    };

    const handleScroll = () => {
        if (!containerRef.current) return;

        isScrollingRef.current = true;

        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
            snapToNearest();
            isScrollingRef.current = false;
        }, 150);
    };

    const snapToNearest = () => {
        if (!containerRef.current) return;

        const scrollTop = containerRef.current.scrollTop;
        let nearestIndex = Math.round(scrollTop / itemHeight);

        if (infinite) {
            const totalItems = displayOptions.length;
            const originalLength = options.length;

            if (nearestIndex < originalLength / 2) {
                nearestIndex += originalLength;
                containerRef.current.scrollTop = nearestIndex * itemHeight;
            } else if (nearestIndex >= totalItems - originalLength / 2) {
                nearestIndex -= originalLength;
                containerRef.current.scrollTop = nearestIndex * itemHeight;
            }


            const actualIndex = nearestIndex % originalLength;
            setSelectedIndex(actualIndex);
            if (onChange && options[actualIndex]) {
                onChange(options[actualIndex].value);
            }
        } else {
            nearestIndex = Math.max(0, Math.min(nearestIndex, options.length - 1));
            setSelectedIndex(nearestIndex);
            if (onChange && options[nearestIndex]) {
                onChange(options[nearestIndex].value);
            }
        }

        scrollToIndex(nearestIndex, true);
    };

    const handleItemClick = (index: number) => {
        scrollToIndex(index, true);
        const actualIndex = infinite ? index % options.length : index;
        setSelectedIndex(actualIndex);
        if (onChange && options[actualIndex]) {
            onChange(options[actualIndex].value);
        }
    };

    const containerHeight = visibleItems * itemHeight;
    const paddingItems = Math.floor(visibleItems / 2);

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
                    {/* Top padding */}
                    <div style={{height: `${paddingItems * itemHeight}px`}}/>

                    {/* Items */}
                    {displayOptions.map((option, index) => {
                        const actualIndex = infinite ? index % options.length : index;
                        const isSelected = infinite
                            ? actualIndex === selectedIndex &&
                            index >= options.length &&
                            index < options.length * 2
                            : actualIndex === selectedIndex;

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

                    {/* Bottom padding */}
                    <div style={{height: `${paddingItems * itemHeight}px`}}/>
                </div>

            </div>
            {/* Highlight wrapper */}
            <div
                className={styles.highlightWrapper}
                style={{
                    top: `${245}px`,
                    height: `${itemHeight}px`,
                }}
            />
        </>
    );
}
//TODO Highlight wrapper absolute position need formula