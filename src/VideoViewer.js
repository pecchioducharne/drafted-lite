import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { useParams } from "react-router-dom";
import QuickRecruiterSignup from "./QuickRecruiterSignup"; // Import your QuickRecruiterSignup form
import { collection, getDocs, query, where } from "firebase/firestore"; // Import Firestore modules
import { db } from "./firebase"; // Replace with your Firebase setup
import linkedinIcon from './linkedin.svg';
import githubIcon from './github.svg';
import { auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const VideoViewer = () => {
  const { id } = useParams(); // Assuming id here is the email
  const [candidate, setCandidate] = useState({});
  const [videoUrls, setVideoUrls] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoQuestions, setVideoQuestions] = useState([]);
  const [showResume, setShowResume] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false); // State to control the signup modal visibility
  const [videoLoading, setVideoLoading] = useState(true); // State to track video loading
  const [user] = useAuthState(auth);
  const [emailPopup, setEmailPopup] = useState(false);
  const [emailContent, setEmailContent] = useState('');

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const candidatesRef = collection(db, "drafted-accounts");
        const q = query(candidatesRef, where("email", "==", id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const candidateData = querySnapshot.docs[0].data();
          setCandidate(candidateData);
          setVideoUrls(
            [
              candidateData.video1,
              candidateData.video2,
              candidateData.video3,
            ].filter(Boolean)
          );
          setVideoQuestions([
            "Tell us your story!",
            "What makes you stand out amongst other candidates?",
            "Tell us about a time when you overcame a challenge!",
          ]); // Example questions, replace with your actual questions
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching candidate:", error);
      }
    };

    fetchCandidate();
  }, [id]);

  const handleVideoButtonClick = (index) => {
    setCurrentVideoIndex(index);
  };

  const handleVideoEnd = () => {
    // Logic for what happens when video ends, if needed
  };

  const handleUniversityClick = (university) => {
    // Handle click on university name, if needed
  };

  const handleMajorClick = (major) => {
    // Handle click on major name, if needed
  };

  const handleGradYearClick = (graduationYear) => {
    // Handle click on graduation year, if needed
  };

  const handleToggleResume = () => {
    setShowResume(!showResume);
  };

  const handleRequestInterview = () => {
    // Comment out the previous authentication logic
    /*
    if (user) {
      // If user is logged in, directly show email draft
      emailDraft();
    } else {
      // If user is not logged in, show signup modal
      setShowSignupModal(true);
    }
    */

    // Always show the signup modal
    setShowSignupModal(true);
  };

  const closeSignupModal = () => {
    // Logic to close the signup modal
    setShowSignupModal(false);
  };

  const emailDraft = () => {
    if (candidate) {
      const { email, firstName, lastName } = candidate;
      const content = `Hi ${firstName},\n\nWe think you are a great candidate for [Company Name], we would like to get to know you better and schedule an initial call.\n\nTime:\nDay:\nZoom / Hangout link:\n\nLet us know if this works. Looking forward!\n\nBest,\n\n[Your Name]`;
      setEmailContent(content);
      setEmailPopup(true);
    }
  };

  const EmailPopup = ({ emailContent, onClose }) => {
    const { email } = candidate;

    const handleCopy = (text) => {
      navigator.clipboard.writeText(text);
    };

    return (
      <div className="popup-overlay">
        <div className="popup-content">
          <button className="close-button" onClick={onClose}>X</button>
          <div className="email-address-container">
            <p className="email-address">{email}</p>
          </div>
          <button className="copy-button" onClick={() => handleCopy(email)}>
            Copy Email Address
          </button>
          <div className="email-content-container">
            <textarea
              readOnly
              value={emailContent}
              className="email-textarea"
            />
          </div>
          <button className="copy-button" onClick={() => handleCopy(emailContent)}>
            Copy Email Content
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="profile-dashboard">
      <div className="main-video-profile-container">
        <div className="navigation-instructions">
          <p
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              fontSize: "large",
              textAlign: "center",
            }}
          ></p>
        </div>
        <div className="video-resume-container">
          {videoUrls[currentVideoIndex] ? (
            <div className="video-player-wrapper">
              <ReactPlayer
                url={videoUrls[currentVideoIndex]}
                controls={true}
                width="100%"
                height="100%"
                autoplay={false}
                onEnded={handleVideoEnd}
                onReady={() => setVideoLoading(false)}
                playsinline={true} // Add playsinline attribute to prevent full-screen mode on mobile
                config={{
                  youtube: {
                    playerVars: { vq: "small" },
                  },
                }}
                style={{ position: "absolute", top: 0, left: 0 }}
              />
              {videoLoading && (
                <div className="video-loading-overlay">
                  <p>Loading...</p>
                </div>
              )}
              {/* {!videoLoading && (
                <button
                  className="play-button"
                  onClick={() => handleVideoButtonClick(currentVideoIndex)}
                >
                  Play Video
                </button>
              )} */}
            </div>
          ) : (
            <p>No video available</p>
          )}
        </div>
        <br />
        <div className="candidate-name-display" style={{ fontSize: "35px" }}>
          {candidate.firstName || "N/A"} {candidate.lastName || "N/A"}
          <button
            className="draft-button"
            onClick={emailDraft}
            aria-label="Draft candidate for interview"
            style={{
              backgroundColor: "#00BF63",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontFamily: "Poppins, sans-serif",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 0 0 20px",
              fontSize: "25px",
              transition: "background-color 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#45a049";
              e.target.style.boxShadow = "0 6px 12px rgba(0,0,0,0.2)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#00BF63";
              e.target.style.boxShadow = "none";
            }}
          >
            🤝 Meet {candidate.firstName}
          </button>
        </div>
        {showSignupModal && (
          <div className="signup-modal-overlay">
            <div className="signup-modal">
              <span className="close" onClick={closeSignupModal}>
                &times;
              </span>
              <QuickRecruiterSignup candidateEmail={candidate.email} />{" "}
              {/* Pass candidate email */}
            </div>
          </div>
        )}
        <div className="video-resume-display" style={{ fontSize: "22px" }}>
          Video Resume
        </div>
        <div className="video-selection-buttons">
          {videoQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleVideoButtonClick(index)}
              className={`video-btn ${
                currentVideoIndex === index ? "active" : ""
              }`}
              style={{ fontSize: "18px" }}
            >
              {question}
            </button>
          ))}
        </div>
        <div className="info-section">
          <div className="profile-field" style={{ fontSize: "20px" }}>
            <strong>University</strong>{" "}
            <p
              className="candidate-university"
              onClick={() => handleUniversityClick(candidate.university)}
            >
              {candidate.university || "N/A"}
            </p>
          </div>
          <div className="profile-field" style={{ fontSize: "20px" }}>
            <strong>Major</strong>{" "}
            <p
              className="candidate-major"
              onClick={() => handleMajorClick(candidate.major)}
            >
              {candidate.major || "N/A"}
            </p>
          </div>
          <div className="profile-field social-field" style={{ fontSize: "20px" }}>
            <strong>Social</strong>{" "}
            <div className="social-links">
              {candidate.linkedInURL && (
                <a
                  href={candidate.linkedInURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <img src={linkedinIcon} alt="LinkedIn" width="32" height="32" />
                </a>
              )}
              {candidate.gitHubURL && (
                <a
                  href={candidate.gitHubURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <img src={githubIcon} alt="GitHub" width="32" height="32" />
                </a>
              )}
            </div>
          </div>
          <div className="profile-field" style={{ fontSize: "20px" }}>
            <strong>Graduation Year</strong>{" "}
            <p
              className="candidate-major"
              onClick={() => handleGradYearClick(candidate.graduationYear)}
            >
              {candidate.graduationYear || "N/A"}
            </p>
          </div>
          <div className="profile-field" style={{ fontSize: "20px" }}>
            <strong>Resume</strong>
            {candidate.resume ? (
              <button
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                onClick={handleToggleResume}
              >
                View Resume
              </button>
            ) : (
              <button
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                onClick={handleRequestInterview}
              >
                No Resume, Request Interview for Resume
              </button>
            )}
          </div>
        </div>
      </div>

      {showResume && (
        <div className="resume-popup">
          <iframe
            src={candidate.resume || "#"}
            title="Resume"
            className="resume-iframe"
          ></iframe>
          <button className="close-resume" onClick={handleToggleResume}>
            Close Resume
          </button>
        </div>
      )}
      {emailPopup && (
        <EmailPopup
          emailContent={emailContent}
          onClose={() => setEmailPopup(false)}
        />
      )}
    </div>
  );
};

export default VideoViewer;
