import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore"; // Import Firestore modules
import { db } from "./firebase"; // Replace with your Firebase setup

const VideoViewer = () => {
  const { id } = useParams(); // Assuming id here is the email
  const [candidate, setCandidate] = useState({});
  const [videoUrls, setVideoUrls] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoQuestions, setVideoQuestions] = useState([]);
  const [showResume, setShowResume] = useState(false);

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

  const emailDraft = () => {
    const { email, firstName, lastName } = candidate;
    const mailto = `mailto:${email}?subject=You've Been Drafted!&body=Hi ${firstName},%0D%0A%0D%0AWe think you are a great candidate for [Company Name], we would like to get to know you better and schedule an initial call.%0D%0A%0D%0ATime:%0D%0ADay:%0D%0AZoom / Hangout link:%0D%0A%0D%0ALet us know if this works. Looking forward!%0D%0A%0D%0ABest,%0D%0A%0D%0A[Your Name]`;
    window.location.href = mailto;
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
            <ReactPlayer
              url={videoUrls[currentVideoIndex]}
              playing={true}
              controls={true}
              width="100%"
              height="100%"
              onEnded={handleVideoEnd}
              config={{
                youtube: {
                  playerVars: { vq: "small" },
                },
              }}
              style={{ position: "absolute", top: 0, left: 0 }}
            />
          ) : (
            <p>No video available</p>
          )}
        </div>
        <br />
        <div className="candidate-name-display">
          {candidate.firstName || "N/A"} {candidate.lastName || "N/A"}
        </div>
        <div className="video-resume-display">Video Resume</div>
        <div className="video-selection-buttons">
          {videoQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleVideoButtonClick(index)}
              className={`video-btn ${
                currentVideoIndex === index ? "active" : ""
              }`}
            >
              {question}
            </button>
          ))}
        </div>
        <div className="info-section">
          <div className="profile-field">
            <strong>University</strong>{" "}
            <p
              className="candidate-university clickable-filter"
              onClick={() => handleUniversityClick(candidate.university)}
            >
              {candidate.university || "N/A"}
            </p>
          </div>
          <div className="profile-field">
            <strong>Major</strong>{" "}
            <p
              className="candidate-major clickable-filter"
              onClick={() => handleMajorClick(candidate.major)}
            >
              {candidate.major || "N/A"}
            </p>
          </div>
          <div className="profile-field">
            <strong>LinkedIn</strong>{" "}
            <a
              href={candidate.linkedInURL || "#"}
              className="candidate-major clickable-filter"
              target="_blank"
              rel="noopener noreferrer"
            >
              {candidate.linkedInURL || "N/A"}
            </a>
          </div>
          <div className="profile-field">
            <strong>Graduation Year</strong>{" "}
            <p
              className="candidate-major clickable-filter"
              onClick={() => handleGradYearClick(candidate.graduationYear)}
            >
              {candidate.graduationYear || "N/A"}
            </p>
          </div>
          <div className="profile-field">
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
                onClick={emailDraft}
              >
                No Resume, Draft to Request
              </button>
            )}
          </div>
        </div>
        <div className="button-group">
          <button
            className="draft-button"
            onClick={emailDraft}
            aria-label="Draft candidate for interview"
          >
            Request Interview
          </button>
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
    </div>
  );
};

export default VideoViewer;