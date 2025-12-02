/**
 * Formats a number into a human-readable string with k/m suffixes
 * @param value - The number to format
 * @param precision - Number of decimal places (default: 1)
 * @returns Formatted string (e.g., "18.2 m", "1.5 k", "999")
 */
export const formatNumber = (value: number, precision: number = 1): string => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(precision)} m`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(precision)} k`;
    }
    return value.toString();
};