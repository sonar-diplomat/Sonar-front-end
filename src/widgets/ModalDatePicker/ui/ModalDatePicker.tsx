import React, {useState} from 'react';
import {Button, Modal, WheelPicker, type WheelPickerOption, WheelPickerWrapper} from "@shared/ui";

interface ModalDatePickerProps {
    isOpen: boolean;
    onClose: () => void;
}

const createArray = (length: number, add = 0): WheelPickerOption[] =>
    Array.from({ length }, (_, i) => {
        const value = i + add;
        return {
            label: value.toString().padStart(2, "0"),
            value: value.toString(),
        };
    });
const monthOptions: WheelPickerOption[] = [
    { label: "January", value: "January" },
    { label: "February", value: "February" },
    { label: "March", value: "March" },
    { label: "April", value: "April" },
    { label: "May", value: "May" },
    { label: "June", value: "June" },
    { label: "July", value: "July" },
    { label: "August", value: "August" },
    { label: "September", value: "September" },
    { label: "October", value: "October" },
    { label: "November", value: "November" },
    { label: "December", value: "December" },
];
const dayOptions = createArray(31, 1);
const yearOptions = createArray(1);

export const ModalDatePicker: React.FC<ModalDatePickerProps> = ({ isOpen, onClose }) => {
    const [month, setMonth] = useState("September");
    const [day, setDay] = useState("12");
    const [year, setYear] = useState("00");

    return (
        <Modal
            title={"Select your date of birth"}
            isOpen={isOpen}
            onClose={onClose}
        >
            <WheelPickerWrapper>
                <WheelPicker
                    options={monthOptions}
                    value={month}
                    onChange={setMonth}
                />
                <WheelPicker
                    options={dayOptions}
                    value={day}
                    onChange={setDay}
                    infinite
                />
                <WheelPicker
                    options={yearOptions}
                    value={year}
                    onChange={setYear}
                    infinite
                />
            </WheelPickerWrapper>
            <Button size={"large"} shape={"cr-16"} children={"Confirm"} variant={"light"} fullWidth/>
        </Modal>
    );
};
