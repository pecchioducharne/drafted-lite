import React, { useState } from "react";
import "./App.css";
import CandidateViewer from "./CandidateViewer";

function App() {
  const candidateEmail = "candidate@example.com";
  const [showGridView, setShowGridView] = useState(true); // State to control the view

  // Function to toggle the grid view
  const toggleGridView = () => {
    setShowGridView(true); // Always set to true to go back to grid view
  };

  return (
    <div className="App">
      <br></br>
      <h1 onClick={toggleGridView} style={{ cursor: "pointer" }}>
        drafted<span style={{ color: "#53ad7a" }}> beta</span>
        <span style={{ color: "black" }}>.</span>
      </h1>
      <CandidateViewer email={candidateEmail} showGridView={showGridView} />
    </div>
  );
}

export default App;
