import React from "react";
import {TabBar} from "@widgets/TabBar";
import {ActionMenu} from "@shared/ui";

export const TestPage: React.FC = () => {
    return (
        <div style={{ padding: '16px', overflowY: 'scroll' }}>
            <ActionMenu isOpen={true} onClose={() => {}} context={{type: 'track', entityId: 212}} />
            <TabBar />
        </div>
    );
}