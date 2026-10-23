import React,{ useEffect } from "react";

import { Outlet } from "react-router-dom";

import { AudioPlayerController,UserStatePlayerSync } from "@shared/lib/audio";
import { useFavoritesSync } from "@shared/lib/favorites/useFavoritesSync";
import { useAppSelector } from "@shared/store/hooks";
import { useNotificationStore } from "@shared/store/notificationStore";
import { NotificationContainer } from "@shared/ui";




export function App() {
    const { notifications, removeNotification } = useNotificationStore();
    const { settings } = useAppSelector((state) => state.clientSettings);
    
    // Синхронизируем избранные треки из плейлиста favorites
    useFavoritesSync();

    useEffect(() => {
        const themeName = settings?.theme?.name?.toLowerCase?.();
        const theme = themeName?.includes('light') ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
    }, [settings?.theme?.name]);

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