import React from "react";
import {Outlet} from "react-router-dom";
import { AudioPlayerController } from "@shared/lib/audio";


export function App() {
    return (
        <div className="app">
            <AudioPlayerController />
            <Outlet />
        </div>
    );
}