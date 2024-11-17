import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CandidateViewer from "./CandidateViewer";
import VideoViewer from "./VideoViewer";
import RecruiterSignupForm from "./RecruiterSignupForm";
import QuickRecruiterSignup from "./QuickRecruiterSignup";
import Login from "./Login";
import CodePage from "./CodePage"; // Import CodePage component
import { UserProvider } from "./UserContext";
import ChatComponent from "./ChatComponent";
import SavedCandidates from "./SavedCandidates";

const App = () => {
  const candidateEmail = "candidate@example.com";
  const [showGridView, setShowGridView] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Add this state to your App component

  const handleLogoClick = () => {
    setShowGridView(true);
    //setRefreshKey((oldKey) => oldKey + 1); // Increment the key to force re-render
  };

  return (
    <Router basename="/">
      <UserProvider>
        <div className="App">
          <Routes>
            <Route
              path="/viewer"
              element={
                <CandidateViewer
                  key={refreshKey}
                  email={candidateEmail}
                  showGridView={showGridView}
                  onLogoClick={handleLogoClick}
                />
              }
            />
            <Route path="/signup" element={<RecruiterSignupForm />} />
            <Route path="/saved" element={<SavedCandidates />} />
            <Route path="/quick" element={<QuickRecruiterSignup />} />
            <Route path="/candidate/:id" element={<VideoViewer />} />
            <Route path="/chat" element={<ChatComponent />} />
            <Route path="/code" element={<CodePage />} />{" "}
            <Route path="/" element={<Login />} />
          </Routes>
        </div>
      </UserProvider>
    </Router>
  );
};

export default App;
