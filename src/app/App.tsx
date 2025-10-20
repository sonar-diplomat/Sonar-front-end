import React from "react";
import './styles/index.css';
import {TabBar} from "../widgets";

function App() {
  return (
    <div className="app">
      <h1>Sonar Application</h1>
      <TabBar/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '20px' }}/>
    </div>
  );
}

export default App;