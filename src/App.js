import React from "react";
import "./App.css";
import CandidateViewer from "./CandidateViewer"; // Import your CandidateViewer component

function App() {
  const candidateEmail = "candidate@example.com";

  return (
    <div className="App">
      <br></br>
      <h1>
        drafted<span style={{ color: "#53ad7a" }}> beta</span>
        <span style={{ color: "black" }}>.</span>
      </h1>
      <CandidateViewer email={candidateEmail} />
    </div>
  );
}

export default App;
