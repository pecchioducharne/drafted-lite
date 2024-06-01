import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CandidateViewer from "./CandidateViewer";
import RecruiterSignupForm from "./RecruiterSignupForm";
import SearchPage from "./SearchPage";
import Login from "./Login";
import { UserProvider } from "./UserContext";

const App = () => {
  const candidateEmail = "candidate@example.com";
  const [showGridView, setShowGridView] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Add this state to your App component

  const handleLogoClick = () => {
    setShowGridView(true);
    //setRefreshKey((oldKey) => oldKey + 1); // Increment the key to force re-render
  };

  return (
    <Router>
      <UserProvider>
        <div className="App">
          <Routes>
            <Route path="/search" element={<SearchPage />} />
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
            <Route path="/" element={<Login />} />
            {/* Additional routes can be added here as needed */}
          </Routes>
        </div>
      </UserProvider>
    </Router>
  );
};

export default App;
