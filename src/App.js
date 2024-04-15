import React, { useState } from "react";
import "./App.css";
import CandidateViewer from "./CandidateViewer";

function App() {
  const candidateEmail = "candidate@example.com";
  const [showGridView, setShowGridView] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Add this state to your App component

  const handleLogoClick = () => {
    setShowGridView(true);
    //setRefreshKey((oldKey) => oldKey + 1); // Increment the key to force re-render
  };

  return (
    <div className="App">
      <br></br>
      {/* <h1
        onClick={() => console.log("Logo clicked")}
        style={{ cursor: "pointer" }}
      >
        drafted<span style={{ color: "#53ad7a" }}> beta</span>
        <span style={{ color: "black" }}>.</span>
      </h1> */}
      <CandidateViewer
        key={refreshKey}
        email={candidateEmail}
        showGridView={showGridView}
        onLogoClick={handleLogoClick}
      />
    </div>
  );
}

export default App;
