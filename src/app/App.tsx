import React from "react";

import {TabBar} from "../widgets";
import MiniPlayerExample from "@widgets/MiniPlayer/ui/MiniPlayer.example";

function App() {
    return (
        <div className="app">
            <h1>Sonar Application</h1>
            <TabBar/>
            <MiniPlayerExample/>
        </div>
    );
}

export default App;

import React from "react";

import { Outlet } from "react-router-dom";

function App() {
    return (
        <div>
            <h1>App wrapper</h1>
            <Outlet />
        </div>
    );
}