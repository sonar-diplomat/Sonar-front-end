import React from "react";
import {TabBar} from "@widgets/TabBar";
import {PlayerTestComponent} from "@pages/TestPage/PlayerTestComponent.tsx";

export const TestPage: React.FC = () => {
    return (
        <div style={{ padding: '16px', overflowY: 'scroll' }}>
            <PlayerTestComponent />
            <TabBar />
        </div>
    );
}