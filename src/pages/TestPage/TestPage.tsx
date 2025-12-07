import React from "react";
import {TabBar} from "@widgets/TabBar";

export const TestPage: React.FC = () => {
    return (
        <div style={{ padding: '16px', overflowY: 'scroll' }}>
            <TabBar />
        </div>
    );
}