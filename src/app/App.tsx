import React from "react";

import {TabBar} from "../widgets";

function App() {
  return (
    <div className="app">
      <div className="app-content">
        <h1>Sonar Application</h1>
        {/* Your main content goes here */}
      </div>
      <div className="app-tabbar">
        <TabBar/>
      </div>
    </div>
  );
}

export default App;