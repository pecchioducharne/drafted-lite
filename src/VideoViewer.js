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

  const handleLogoClick = () => {
    window.open('https://drafted.webflow.io/', '_blank');
  };

  return (
    <div className="profile-dashboard">
      <div className="drafted-logo-container" onClick={handleLogoClick}>
        <br />
        <br />
        <DraftedLogo />
        <br /><br />
      </div>
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
                  href={
                    candidate.linkedInURL.startsWith('http')
                      ? candidate.linkedInURL
                      : `https://${candidate.linkedInURL}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  style={{ cursor: 'pointer' }}
                >
                  <img src={linkedinIcon} alt="LinkedIn" width="32" height="32" />
                </a>
              )}
              {candidate.gitHubURL && (
                <a
                  href={
                    candidate.gitHubURL.startsWith('http')
                      ? candidate.gitHubURL
                      : `https://${candidate.gitHubURL}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  style={{ cursor: 'pointer' }}
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
        <div className="resume-popup" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '95vw', // 95% of viewport width
          maxWidth: '1800px', // Much larger maximum width
          height: '90vh', // 90% of viewport height
          backgroundColor: 'white',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          borderRadius: '12px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          padding: '24px', // Slightly larger padding
        }}>
          <iframe
            src={candidate.resume || "#"}
            title="Resume"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '8px',
            }}
          />
          <button 
            onClick={handleToggleResume}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#333',
              color: 'white',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              zIndex: 1001, // Ensure button is above iframe
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#444'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#333'}
          >
            Close
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

function DraftedLogo() {
  return (
    <svg
      width="115"
      height="23"
      viewBox="0 0 115 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.784 14.16C0.784 12.5547 1.08267 11.1453 1.68 9.932C2.296 8.71867 3.12667 7.78533 4.172 7.132C5.21733 6.47867 6.384 6.152 7.672 6.152C8.69867 6.152 9.632 6.36667 10.472 6.796C11.3307 7.22533 12.0027 7.804 12.488 8.532V1.28H17.276V22H12.488V19.76C12.04 20.5067 11.396 21.104 10.556 21.552C9.73467 22 8.77333 22.224 7.672 22.224C6.384 22.224 5.21733 21.8973 4.172 21.244C3.12667 20.572 2.296 19.6293 1.68 18.416C1.08267 17.184 0.784 15.7653 0.784 14.16ZM12.488 14.188C12.488 12.9933 12.152 12.0507 11.48 11.36C10.8267 10.6693 10.024 10.324 9.072 10.324C8.12 10.324 7.308 10.6693 6.636 11.36C5.98267 12.032 5.656 12.9653 5.656 14.16C5.656 15.3547 5.98267 16.3067 6.636 17.016C7.308 17.7067 8.12 18.052 9.072 18.052C10.024 18.052 10.8267 17.7067 11.48 17.016C12.152 16.3253 12.488 15.3827 12.488 14.188ZM25.5279 8.98C26.0879 8.12133 26.7879 7.44933 27.6279 6.964C28.4679 6.46 29.4012 6.208 30.4279 6.208V11.276H29.1119C27.9172 11.276 27.0212 11.5373 26.4239 12.06C25.8266 12.564 25.5279 13.46 25.5279 14.748V22H20.7399V6.376H25.5279V8.98ZM31.7645 14.16C31.7645 12.5547 32.0631 11.1453 32.6605 9.932C33.2765 8.71867 34.1071 7.78533 35.1525 7.132C36.1978 6.47867 37.3645 6.152 38.6525 6.152C39.7538 6.152 40.7151 6.376 41.5365 6.824C42.3765 7.272 43.0205 7.86 43.4685 8.588V6.376H48.2565V22H43.4685V19.788C43.0018 20.516 42.3485 21.104 41.5085 21.552C40.6871 22 39.7258 22.224 38.6245 22.224C37.3551 22.224 36.1978 21.8973 35.1525 21.244C34.1071 20.572 33.2765 19.6293 32.6605 18.416C32.0631 17.184 31.7645 15.7653 31.7645 14.16ZM43.4685 14.188C43.4685 12.9933 43.1325 12.0507 42.4605 11.36C41.8071 10.6693 41.0045 10.324 40.0525 10.324C39.1005 10.324 38.2885 10.6693 37.6165 11.36C36.9631 12.032 36.6365 12.9653 36.6365 14.16C36.6365 15.3547 36.9631 16.3067 37.6165 17.016C38.2885 17.7067 39.1005 18.052 40.0525 18.052C41.0045 18.052 41.8071 17.7067 42.4605 17.016C43.1325 16.3253 43.4685 15.3827 43.4685 14.188ZM59.5604 10.352H56.9844V22H52.1964V10.352H50.4604V6.376H52.1964V5.928C52.1964 4.00533 52.747 2.54933 53.8484 1.56C54.9497 0.551999 56.5644 0.0479989 58.6924 0.0479989C59.047 0.0479989 59.3084 0.0573321 59.4764 0.0759985V4.136C58.5617 4.08 57.9177 4.21067 57.5444 4.528C57.171 4.84533 56.9844 5.41467 56.9844 6.236V6.376H59.5604V10.352ZM70.5182 17.94V22H68.0822C66.3462 22 64.9929 21.58 64.0222 20.74C63.0516 19.8813 62.5662 18.4907 62.5662 16.568V10.352H60.6622V6.376H62.5662V2.568H67.3542V6.376H70.4902V10.352H67.3542V16.624C67.3542 17.0907 67.4662 17.4267 67.6902 17.632C67.9142 17.8373 68.2876 17.94 68.8102 17.94H70.5182ZM87.9132 13.936C87.9132 14.384 87.8852 14.8507 87.8292 15.336H76.9932C77.0679 16.3067 77.3759 17.0533 77.9172 17.576C78.4772 18.08 79.1586 18.332 79.9612 18.332C81.1559 18.332 81.9866 17.828 82.4532 16.82H87.5492C87.2879 17.8467 86.8119 18.7707 86.1212 19.592C85.4492 20.4133 84.5999 21.0573 83.5732 21.524C82.5466 21.9907 81.3986 22.224 80.1292 22.224C78.5986 22.224 77.2359 21.8973 76.0412 21.244C74.8466 20.5907 73.9132 19.6573 73.2412 18.444C72.5692 17.2307 72.2332 15.812 72.2332 14.188C72.2332 12.564 72.5599 11.1453 73.2132 9.932C73.8852 8.71867 74.8186 7.78533 76.0132 7.132C77.2079 6.47867 78.5799 6.152 80.1292 6.152C81.6412 6.152 82.9852 6.46933 84.1612 7.104C85.3372 7.73867 86.2519 8.644 86.9052 9.82C87.5772 10.996 87.9132 12.368 87.9132 13.936ZM83.0132 12.676C83.0132 11.8547 82.7332 11.2013 82.1732 10.716C81.6132 10.2307 80.9132 9.988 80.0732 9.988C79.2706 9.988 78.5892 10.2213 78.0292 10.688C77.4879 11.1547 77.1519 11.8173 77.0212 12.676H83.0132ZM89.4871 14.16C89.4871 12.5547 89.7858 11.1453 90.3831 9.932C90.9991 8.71867 91.8298 7.78533 92.8751 7.132C93.9205 6.47867 95.0871 6.152 96.3751 6.152C97.4018 6.152 98.3351 6.36667 99.1751 6.796C100.034 7.22533 100.706 7.804 101.191 8.532V1.28H105.979V22H101.191V19.76C100.743 20.5067 100.099 21.104 99.2591 21.552C98.4378 22 97.4765 22.224 96.3751 22.224C95.0871 22.224 93.9205 21.8973 92.8751 21.244C91.8298 20.572 90.9991 19.6293 90.3831 18.416C89.7858 17.184 89.4871 15.7653 89.4871 14.16ZM101.191 14.188C101.191 12.9933 100.855 12.0507 100.183 11.36C99.5298 10.6693 98.7271 10.324 97.7751 10.324C96.8231 10.324 96.0111 10.6693 95.3391 11.36C94.6858 12.032 94.3591 12.9653 94.3591 14.16C94.3591 15.3547 94.6858 16.3067 95.3391 17.016C96.0111 17.7067 96.8231 18.052 97.7751 18.052C98.7271 18.052 99.5298 17.7067 100.183 17.016C100.855 16.3253 101.191 15.3827 101.191 14.188Z"
        fill="black"
      />
      <path
        d="M111.683 22.224C110.843 22.224 110.152 21.9813 109.611 21.496C109.088 20.992 108.827 20.376 108.827 19.648C108.827 18.9013 109.088 18.276 109.611 17.772C110.152 17.268 110.843 17.016 111.683 17.016C112.504 17.016 113.176 17.268 113.699 17.772C114.24 18.276 114.511 18.9013 114.511 19.648C114.511 20.376 114.24 20.992 113.699 21.496C113.176 21.9813 112.504 22.224 111.683 22.224Z"
        fill="#53AD7A"
      />
    </svg>
  );
}

export default VideoViewer;
