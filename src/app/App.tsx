import React from "react";
import './styles/index.css';
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