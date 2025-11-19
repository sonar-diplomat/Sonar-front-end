import React, {useState} from 'react';

import {Button, Modal, WheelPicker, WheelPickerWrapper} from "@shared/ui";
import {dayOptions, monthOptions, yearOptions} from "@widgets/ModalDatePicker/model";

export const ModalDatePicker: React.FC<{ isOpen: boolean; onClose: () => void }> = ({isOpen, onClose}) => {
    const [month, setMonth] = useState<string>("September");
    const [day, setDay] = useState<string>("12");
    const [year, setYear] = useState<string>("00");

    return (
        <Modal title={"Select your date of birth"} isOpen={isOpen} onClose={onClose}>
            <WheelPickerWrapper>
                <WheelPicker options={monthOptions} value={month} onChange={setMonth} infinite/>
                <WheelPicker options={dayOptions} value={day} onChange={setDay} infinite/>
                <WheelPicker options={yearOptions} value={year} onChange={setYear} infinite/>
            </WheelPickerWrapper>
            <Button size={"large"} shape={"cr-16"} children={"Confirm"} variant={"light"} fullWidth/>
        </Modal>
    );
};