import React from "react";
import {Registration} from "@pages/Registration";

function App() {
    return (
        <div className="app">
            <Registration/>
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