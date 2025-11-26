import React, {useState} from 'react';

import {Button, Modal, WheelPicker, WheelPickerWrapper} from "@shared/ui";
import {dayOptions, monthOptions, yearOptions} from "@widgets/ModalDatePicker/model";

export interface ModalDatePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: (date: string) => void;
    initialValue?: string;
}

export const ModalDatePicker: React.FC<ModalDatePickerProps> = ({isOpen, onClose, onConfirm, initialValue}) => {
    const parseInitialDate = () => {
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
                    day: parts[2].padStart(2, '0')
                };
            }
        }

        // Try dd/MM/yyyy format
        const parts = initialValue.split('/');
        if (parts.length === 3) {
            const monthIndex = parseInt(parts[1]) - 1;
            return {
                day: parts[0].padStart(2, '0'),
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

    const initial = parseInitialDate();
    const [month, setMonth] = useState<string>(initial.month);
    const [day, setDay] = useState<string>(initial.day);
    const [year, setYear] = useState<string>(initial.year);

    const handleConfirm = () => {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        const monthIndex = monthNames.indexOf(month) + 1;
        const formattedDate = `${year}-${monthIndex.toString().padStart(2, '0')}-${day.padStart(2, '0')}`;
        onConfirm?.(formattedDate);
        onClose();
    };

    return (
        <Modal title={"Select your date of birth"} isOpen={isOpen} onClose={onClose}>
            <WheelPickerWrapper>
                <WheelPicker options={monthOptions} value={month} onChange={setMonth} infinite/>
                <WheelPicker options={dayOptions} value={day} onChange={setDay} infinite/>
                <WheelPicker options={yearOptions} value={year} onChange={setYear} infinite/>
            </WheelPickerWrapper>
            <Button size={"large"} shape={"cr-16"} variant={"light"} fullWidth onClick={handleConfirm}>
                Confirm
            </Button>
        </Modal>
    );
};