import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CandidateViewer from "./CandidateViewer";
import VideoViewer from "./VideoViewer";
import RecruiterSignupForm from "./RecruiterSignupForm";
import QuickRecruiterSignup from "./QuickRecruiterSignup";
import Login from "./Login";
import CodePage from "./CodePage";
import { UserProvider } from "./UserContext";
import ChatComponent from "./ChatComponent";
import SavedCandidates from "./SavedCandidates";
import CandidateBucket from "./CandidateBucket";
import GailBucket from "./GailBucket";

const App = () => {
  const candidateEmail = "candidate@example.com";
  const [showGridView, setShowGridView] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLogoClick = () => {
    setShowGridView(true);
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
            <Route path="/gail-bucket" element={<GailBucket />} />
            <Route path="/candidate/:id" element={<VideoViewer />} />
            <Route path="/chat" element={<ChatComponent />} />
            <Route path="/bucket" element={<CandidateBucket />} />
            <Route path="/code" element={<CodePage />} />
            <Route path="/" element={<Login />} />
          </Routes>
        </div>
      </UserProvider>
    </Router>
  );
};

export default App;