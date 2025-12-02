import React from "react";
import {TabBar} from "@widgets/TabBar";
import {PlayerTestComponent} from "@pages/TestPage/PlayerTestComponent.tsx";
import {NotificationDemo} from "@shared/ui/Notification/NotificationDemo.tsx";
import {ReportComponent} from "@widgets/ReportComponent/ui/ReportComponent.tsx";

export const TestPage: React.FC = () => {
    return (
        <div style={{ padding: '16px', overflowY: 'scroll' }}>
            {/*<PlayerTestComponent />*/}
            <NotificationDemo />
            <TabBar />
        </div>
    );
}