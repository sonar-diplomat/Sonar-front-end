import React from "react";
import {Outlet} from "react-router-dom";

import { AudioPlayerController, UserStatePlayerSync } from "@shared/lib/audio";
import { NotificationContainer } from "@shared/ui";
import { useNotificationStore } from "@shared/store/notificationStore";




export function App() {
    const { notifications, removeNotification } = useNotificationStore();

    return (
        <div className="app">
            <AudioPlayerController />

            <NotificationContainer
                notifications={notifications}
                onClose={removeNotification}
            />
            <UserStatePlayerSync />

            <Outlet />
        </div>
    );
}