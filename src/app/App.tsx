import React from "react";
import {Outlet} from "react-router-dom";
import { AudioPlayerController, UserStatePlayerSync } from "@shared/lib/audio";


export function App() {
    return (
        <div className="app">
            <AudioPlayerController />
            <UserStatePlayerSync />
            <Outlet />
        </div>
    );
}