import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import "./CandidateViewer.css";
import recordGif from "./record.gif";
import ReactPlayer from "react-player";
import verifiedIcon from "./verified.png";
import logo from "./logo.svg";

const CandidateViewer = () => {
  const [candidates, setCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResume, setShowResume] = useState(false);
  const [showNavPopup, setShowNavPopup] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showGridView, setShowGridView] = useState(false); // New state to manage grid view
  const [playingCandidateId, setPlayingCandidateId] = useState(null); // New state to track the id of the candidate being played

  useEffect(() => {
    const fetchCandidates = async () => {
      const querySnapshot = await getDocs(collection(db, "drafted-accounts"));
      const candidatesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter candidates to include only those with all 3 videos completed
      const candidatesWithAllVideos = candidatesData.filter(
        (candidate) => candidate.video1 && candidate.video2 && candidate.video3
      );

      setCandidates(candidatesWithAllVideos); // Store filtered list of candidates
      setFilteredCandidates(candidatesWithAllVideos); // By default, show only candidates with all videos
    };

    fetchCandidates();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Directly check if the focused element is an input (i.e., the search bar)
      if (document.activeElement.tagName === "INPUT") {
        if (e.key === "Enter") {
          e.preventDefault(); // Prevent the default "Enter" action (e.g., form submission)
          e.stopPropagation(); // Stop the event from propagating further
          executeSearch(); // Execute the search function
          return; // Exit the function to ensure no further processing
        }
      }

      // Handle other key presses
      switch (e.key) {
        case "ArrowRight":
          handleNext();
          break;
        case "ArrowLeft":
          handleBack();
          break;
        case "Shift":
          setShowResume(!showResume);
          break;
        // The "Enter" case for emailDraft is removed to prevent it from being called here
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [currentIndex, showResume, showGridView]); // Dependencies

  const executeSearch = () => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = candidates.filter(
      (candidate) =>
        (candidate.university.toLowerCase().includes(lowerQuery) ||
          candidate.major.toLowerCase().includes(lowerQuery) ||
          candidate.graduationYear
            .toString()
            .toLowerCase()
            .includes(lowerQuery)) &&
        candidate.video1 != "" &&
        candidate.video2 != "" &&
        candidate.video3 != ""
    );
    setFilteredCandidates(filtered);
    setShowGridView(true); // Show grid view after search
  };

  const handleCandidateSelect = (index) => {
    setCurrentIndex(index);
    setShowGridView(false); // Go back to normal view when a candidate is selected
  };

  const handleNext = () => {
    if (currentIndex < filteredCandidates.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const emailDraft = () => {
    if (filteredCandidates.length > 0) {
      const { email, firstName, lastName } = filteredCandidates[currentIndex];
      const mailto = `mailto:${email}?subject=You've Been Drafted!&body=Hi ${firstName},%0D%0A%0D%0AWe think you are a great candidate for [Company Name], we would like to get to know you better and schedule an initial call.%0D%0A%0D%0ATime:%0D%0ADay:%0D%0AZoom / Hangout link:%0D%0A%0D%0ALet us know if this works. Looking forward!%0D%0A%0D%0ABest,%0D%0A%0D%0A[Your Name]`;
      window.location.href = mailto;
    }
  };

  const handleToggleResume = () => {
    setShowResume(!showResume);
  };

  const handleVideoEnd = () => {
    // Check if there's another video to play
    if (currentVideoIndex < videoUrls.length) {
      setCurrentVideoIndex(currentVideoIndex + 1); // Move to the next video
    } else {
      setCurrentVideoIndex(0); // Optionally loop back to the first video
    }
  };

  // Show grid view of candidates with videos
  if (showGridView) {
    return (
        <div>
            <button
                className="navigation-button"
                onClick={() => setShowGridView(false)}
                style={{ margin: "10px" }}
            >
                Back
            </button>
            <div className="candidates-grid">
                {filteredCandidates.map((candidate, index) => {
                    const videoUrls = [candidate.video1, candidate.video2, candidate.video3].filter(Boolean);
                    return (
                        <div key={candidate.id} className="candidate-card" onClick={() => handleCandidateSelect(index)}>
                            <div className="video-wrapper"> {/* Added this wrapper */}
                                {videoUrls.length > 0 ? (
                                    <ReactPlayer
                                        url={videoUrls[0]}
                                        width="100%"
                                        height="100%"
                                        controls
                                        light={logo}
                                        className="candidate-video"
                                    />
                                ) : (
                                    <div className="no-video-placeholder">No Video Available</div>
                                )}
                            </div>
                            <div className="candidate-info">
                                <h3>{candidate.firstName} {candidate.lastName}</h3>
                                <p>{candidate.university}</p>
                                <p>{candidate.major} - {candidate.graduationYear}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}


  if (filteredCandidates.length === 0) {
    return <div>Loading...</div>;
  }

  const candidate = filteredCandidates[currentIndex] || {};
  const videoUrls = [
    candidate.video1,
    candidate.video2,
    candidate.video3,
  ].filter((url) => url); // This will exclude falsy values, including empty strings

  return (
    <div className="profile-dashboard">
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search by university, major, grad year..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar"
          onKeyDown={(e) => e.key === "Enter" && executeSearch()}
        />
        <button onClick={executeSearch} className="navigation-button">
          Search
        </button>
      </div>
      {showNavPopup && (
        <div className="nav-popup">
          <h2>Welcome to Drafted!</h2>
          <br></br>
          <p>We make it easy and fun to find your next hire.</p>
          <ul>
            <br></br>
            <li>
              <strong>Enter:</strong> Draft candidate, creates email thread to
              schedule first interview.
            </li>
            <li>
              <strong>Shift:</strong> View candidate resume.
            </li>
            <li>
              <strong>Right arrow:</strong> See next candidate.
            </li>
            <li>
              <strong>Left arrow:</strong> See previous candidate.
            </li>
          </ul>
          <br></br>
          <button
            className="navigation-button"
            onClick={() => setShowNavPopup(false)}
          >
            Close
          </button>
        </div>
      )}
      <br></br>
      <div className="header-section">
        <div className="navigation-buttons-container">
          {currentIndex > 0 && (
            <button className="navigation-button" onClick={handleBack}>
              Previous
            </button>
          )}
          {currentIndex < filteredCandidates.length - 1 && (
            <button className="navigation-button" onClick={handleNext}>
              Next
            </button>
          )}
        </div>
        <br></br>
        <h1 className="name">
          {candidate.firstName} {candidate.lastName}
          <img src={verifiedIcon} alt="Verified" className="verified-icon" />
        </h1>
      </div>
      <div className="navigate-pro-link">
        <a href="#" onClick={() => setShowNavPopup(true)}>
          Keyboard Shortcuts
        </a>
      </div>
      <div className="video-resume-container">
        {videoUrls.length > 0 ? (
          <ReactPlayer
            key={`${candidate.id}-${currentVideoIndex}`}
            url={videoUrls[currentVideoIndex]}
            playing={true}
            controls={true}
            light={logo} // Add this line, similarly replace `candidate.previewImage`
            onEnded={handleVideoEnd}
            width="100%"
            height="100%"
          />
        ) : (
          <img
            src={recordGif}
            alt="Default GIF"
            style={{ width: "100%", height: "auto", borderRadius: "8px" }}
          />
        )}
      </div>
      <br></br>
      <div className="info-section">
        <div className="profile-field">
          <strong>University</strong>
          <p className="profile-value">{candidate.university}</p>
        </div>
        <div className="profile-field">
          <strong>Major</strong>
          <p className="profile-value">{candidate.major}</p>
        </div>
        <div className="profile-field">
          <strong>LinkedIn</strong>
          <p className="profile-value">
            <a
              href={candidate.linkedInURL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {candidate.linkedInURL}
            </a>
          </p>
        </div>
        <div className="profile-field">
          <strong>Graduation Year</strong>
          <p className="profile-value">{candidate.graduationYear}</p>
        </div>
        <div className="profile-field">
          <strong>Resume</strong>
          <button
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded button-wide" // button-wide class applied
            onClick={handleToggleResume}
          >
            View Resume
          </button>
        </div>
      </div>
      <div className="navigation-buttons"></div>
      {/* <button
        className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded button-wide"
        onClick={handleToggleResume}
      >
        View Resume
      </button> */}
      <div className="button-group">
        <button
          className="bg-customGreen hover:bg-customGreenDark text-white font-bold py-2 px-4 rounded button-wide"
          style={{ borderRadius: "14px" }}
          onClick={emailDraft}
        >
          Draft
        </button>
      </div>
      <br></br>
      <div className="join-message">
        <a
          href="https://drafted-recruiter.webflow.io/sign-up"
          target="_blank"
          rel="noopener noreferrer"
        >
          Want to discover more candidates and filter by university, major, and
          grad year?<br></br>Join Drafted
        </a>
      </div>
      {showResume && (
        <div className="resume-popup">
          <iframe
            src={candidate.resume} // Ensure this property is correctly populated in the candidate object
            title="Resume"
            className="resume-iframe"
          ></iframe>
          <button className="close-resume" onClick={() => setShowResume(false)}>
            Close Resume
          </button>
        </div>
      )}
    </div>
  );
};

export default CandidateViewer;
