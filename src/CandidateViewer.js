import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import "./CandidateViewer.css";
import recordGif from "./record.gif";
import ReactPlayer from "react-player";

import verifiedIcon from "./verified.png";

const CandidateViewer = () => {
  const [candidates, setCandidates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResume, setShowResume] = useState(false);
  const [showNavPopup, setShowNavPopup] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const emailDraft = () => {
    const { email, firstName, lastName } = candidates[currentIndex];
    const mailto = `mailto:${email}?subject=You've Been Drafted!&body=Dear ${firstName} ${lastName},`;
    window.location.href = mailto;
  };

  useEffect(() => {
    const fetchCandidates = async () => {
      const querySnapshot = await getDocs(collection(db, "early-bucket"));
      const candidatesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCandidates(candidatesData);
    };

    fetchCandidates();

    const handleKeyPress = (e) => {
      switch (e.key) {
        case "ArrowRight":
          handleNext();
          break;
        case "ArrowLeft":
          handleBack();
          break;
        case "Enter":
          handleDraft();
          break;
        case "Shift":
          setShowResume(!showResume);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [currentIndex, candidates.length, showResume]);

  const handleNext = () => {
    if (currentIndex < candidates.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleDraft = () => {
    emailDraft();
  };

  const handleToggleResume = () => {
    setShowResume(!showResume);
  };

  if (candidates.length === 0) {
    return <div>Loading...</div>;
  }

  const candidate = candidates[currentIndex];

  const videoUrls = [
    candidate.video1,
    candidate.video2,
    candidate.video3,
  ].filter((url) => url);

  const handleVideoEnd = () => {
    if (currentVideoIndex < videoUrls.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else {
      setCurrentVideoIndex(0);
    }
  };

  return (
    <div className="profile-dashboard">
      {showNavPopup && (
        <div className="nav-popup">
          <h2>Welcome to Drafted!</h2>
          <p>We make it easy and fun to find your next hire.</p>
          <ul>
            <li>
              <strong>Enter:</strong> Draft candidate...
            </li>
            <li>
              <strong>Shift:</strong> See candidate resume...
            </li>
            <li>
              <strong>Right arrow:</strong> Navigate to next candidate...
            </li>
            <li>
              <strong>Left arrow:</strong> Navigate to previous candidate...
            </li>
          </ul>
          <br></br>
          <button className="navigation-button" onClick={() => setShowNavPopup(false)}>Close</button>
        </div>
      )}
      <div className="header-section">
        {currentIndex > 0 ? (
          <button className="navigation-button" onClick={handleBack}>
            Previous
          </button>
        ) : (
          <div className="navigation-spacer"></div> /* Empty spacer for alignment */
        )}

        <h1 className="name">
          {`${candidate.firstName} ${candidate.lastName}`}
          <img src={verifiedIcon} alt="Verified" className="verified-icon" />
        </h1>
        {currentIndex < candidates.length - 1 ? (
          <button className="navigation-button" onClick={handleNext}>
            Next
          </button>
        ) : (
          <div className="navigation-spacer"></div> /* Empty spacer for alignment */
        )}
      </div>
      <div className="navigate-pro-link">
        <a href="#" onClick={() => setShowNavPopup(true)}>
          Keyboard Shortcuts
        </a>
      </div>
      <div className="video-resume-container">
        {videoUrls.length > 0 ? (
          <ReactPlayer
            url={videoUrls[currentVideoIndex]}
            playing
            controls
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
        {/* <div className="profile-field">
          <strong>Email</strong>
          <p className="profile-value">{candidate.email}</p>
        </div> */}
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
      </div>
      <div className="navigation-buttons"></div>
      <button
        className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded button-wide"
        onClick={handleToggleResume}
      >
        View Resume
      </button>
      <div className="button-group">
        <button
          className="bg-customGreen hover:bg-customGreenDark text-white font-bold py-2 px-4 rounded button-wide"
          style={{ borderRadius: "14px" }}
          onClick={handleDraft}
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
          Want to discover more candidates? Join Drafted
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
