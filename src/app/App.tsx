import React from "react";
import './styles/index.css';
import {TabBar} from "../widgets";
import ButtonExamples from "../shared/ui/Button/Button.example.tsx";

function App() {
  return (
    <div className="app">
      <h1>Sonar Application</h1>
        <ButtonExamples/>
        <TabBar/>
    </div>
  );
}

export default App;