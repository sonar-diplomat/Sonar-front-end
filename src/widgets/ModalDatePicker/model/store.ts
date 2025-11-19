import type {WheelPickerOption} from "@shared/ui";

const toOptions = (labels: string[]): WheelPickerOption[] =>
    labels.map(label => ({label, value: label}));

const createNumericOptions = (length: number, start = 0, pad = 2): WheelPickerOption[] =>
    Array.from({length}, (_, i) => {
        const num = start - i;
        const value = num.toString();
        return {
            label: value.padStart(pad, "0"),
            value,
        };
    });

const MONTH_LABELS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
] as const;

export const monthOptions: WheelPickerOption[] = toOptions(Array.from(MONTH_LABELS));
export const dayOptions = createNumericOptions(31, 31, 2);
export const yearOptions = createNumericOptions(120, new Date(Date.now()).getFullYear(), 2);
