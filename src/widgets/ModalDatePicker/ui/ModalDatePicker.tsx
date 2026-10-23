import React,{ useMemo,useState } from 'react';

import { Button,Modal,WheelPicker,WheelPickerWrapper } from "@shared/ui";
import { dayOptions,monthOptions,yearOptions } from "@widgets/ModalDatePicker/model";

export interface ModalDatePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: (date: string) => void;
    initialValue?: string;
}

const parseInitialDate = (initialValue?: string) => {
        if (!initialValue) {
            return {
                month: "January",
                day: "1",
                year: new Date().getFullYear().toString()
            };
        }

        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        if (initialValue.includes('-')) {
            const parts = initialValue.split('-');
            if (parts.length === 3) {
                const monthIndex = parseInt(parts[1]) - 1;
                return {
                    year: parts[0],
                    month: monthNames[monthIndex] || "January",
                    day: String(Number(parts[2]))
                };
            }
        }

        // Try dd/MM/yyyy format
        const parts = initialValue.split('/');
        if (parts.length === 3) {
            const monthIndex = parseInt(parts[1]) - 1;
            return {
                day: String(Number(parts[0])),
                month: monthNames[monthIndex] || "January",
                year: parts[2]
            };
        }

        return {
            month: "January",
            day: "1",
            year: new Date().getFullYear().toString()
        };
};

const DatePickerFields: React.FC<Omit<ModalDatePickerProps, 'isOpen'>> = ({onClose, onConfirm, initialValue}) => {
    const initial = parseInitialDate(initialValue);
    const [month, setMonth] = useState<string>(initial.month);
    const [day, setDay] = useState<string>(initial.day);
    const [year, setYear] = useState<string>(initial.year);
    const monthIndex = monthOptions.findIndex(option => option.value === month) + 1;
    const daysInMonth = new Date(Number(year), monthIndex, 0).getDate();
    const validDays = useMemo(() => dayOptions.filter(option => Number(option.value) <= daysInMonth), [daysInMonth]);
    const selectedDay = String(Math.max(1, Math.min(Number(day) || 1, daysInMonth)));

    const handleConfirm = () => {
        const formattedDate = `${year}-${monthIndex.toString().padStart(2, '0')}-${selectedDay.padStart(2, '0')}`;
        onConfirm?.(formattedDate);
        onClose();
    };

    return (
        <>
            <WheelPickerWrapper>
                <WheelPicker ariaLabel="Month" options={monthOptions} value={month} onChange={setMonth} infinite/>
                <WheelPicker ariaLabel="Day" options={validDays} value={selectedDay} onChange={setDay} infinite/>
                <WheelPicker ariaLabel="Year" options={yearOptions} value={year} onChange={setYear} infinite/>
            </WheelPickerWrapper>
            <Button size={"large"} shape={"cr-16"} variant={"filled"} theme={"light"} fullWidth onClick={handleConfirm}>
                Confirm
            </Button>
        </>
    );
};

export const ModalDatePicker: React.FC<ModalDatePickerProps> = ({isOpen, onClose, onConfirm, initialValue}) => (
    <Modal title="Select your date of birth" isOpen={isOpen} onClose={onClose}>
        <DatePickerFields key={initialValue ?? ''} initialValue={initialValue} onClose={onClose} onConfirm={onConfirm} />
    </Modal>
);
