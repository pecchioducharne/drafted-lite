import React, { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import { doc, getDoc, collection, getDocs, arrayUnion, updateDoc } from "firebase/firestore";
import { useSwipeable } from "react-swipeable";
import "./CandidateViewer.css";
import recordGif from "./record.gif";
import ReactPlayer from "react-player";
import verifiedIcon from "./verified.png";
import logo from "./logo.svg";
import cover from "./cover-drafted.jpeg";
// import AWS from 'aws-sdk';
import { FiChevronDown, FiChevronUp } from "react-icons/fi"; // Import Chevron icons from 'react-icons'
import { Player } from "video-react";
import "video-react/dist/video-react.css"; // Import css
import { LazyLoadComponent } from "react-lazy-load-image-component";
import home from "./home.png";
import backArrow from "./back-arrow.png";
import { auth } from "./firebase"; // Adjust the path as necessary
import { useNavigate } from "react-router-dom";
import previewImage from './preview.png'; // Adjust the path as needed
import {
  setPersistence,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  browserSessionPersistence,
} from "firebase/auth";
import shareArrow from './share-arrow.png';  // Add this import
import linkedinIcon from './linkedin.svg';
import githubIcon from './github.svg';
import verified from './verified.png';
import emailjs from 'emailjs-com';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';

// Initialize EmailJS
emailjs.init("RfdLlpPTsLae8Wd_j");

// Add this utility function at the top of your file
const capitalizeName = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Define the capitalizeFirst function at the top of your file
const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const clickSound = new Audio('/send_sound.mp3');

// const ses = new AWS.SES({ apiVersion: '2010-12-01' });

// Add this new component
const MeetOptionsPopup = ({ onClose, onEmail, onSave, candidateName }) => {
  return (
    <div className="popup-overlay">
      <div className="meet-popup">
        <button className="close-button" onClick={onClose}>×</button>
        <h3>Meet {candidateName}</h3>
        <div className="meet-options">
          <button
            className="meet-option-button"
            onClick={onEmail}
          >
            📩 Email
          </button>
          <button
            className="meet-option-button"
            onClick={onSave}
          >
            🪣 Save
          </button>
          <button
            className="meet-option-button"
            onClick={() => alert("Coming soon 🏗️")}
          >
            💬 Chat
          </button>
        </div>
      </div>
    </div>
  );
};

// Add new component for the confirmation popup
const SaveConfirmationPopup = ({ onClose, onViewSaved, candidateName }) => {
  return (
    <div className="popup-overlay">
      <div className="meet-popup">
        <button className="close-button" onClick={onClose}>×</button>
        <h3>Candidate saved to bucket!</h3>
        <div className="meet-options">
          <button
            className="meet-option-button"
            onClick={onViewSaved}
          >
            See saved
          </button>
          <button
            className="meet-option-button"
            onClick={onClose}
          >
            Keep drafting
          </button>
        </div>
      </div>
    </div>
  );
};

const CandidateViewer = ({
  email,
  showGridView: initialShowGridView,
  onLogoClick,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(10);
  const loadMoreCount = 10; // Number of candidates to load on scroll
  const [user, setUser] = useState(null);
  const [codes, setCodes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResume, setShowResume] = useState(false);
  const [showNavPopup, setShowNavPopup] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false); // State for play button interaction
  const [showPopup, setPopup] = useState(() => {
    // Check localStorage to see if the popup was already dismissed
    return !localStorage.getItem("popupDismissed");
  });
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [showInviteCodes, setShowInviteCodes] = useState(false);
  const [showEmailPopup, setEmailPopup] = useState(false);
  const [emailContent, setEmailContent] = useState("");
  const [showCulturePopup, setShowCulturePopup] = useState(false);
  const [popupContent, setPopupContent] = useState({ tag: '', description: '' });
  const [showGridView, setShowGridView] = useState(() => {
    const storedView = sessionStorage.getItem("showGridView");
    return storedView ? JSON.parse(storedView) : initialShowGridView;
  });
  const [showSavedPopup, setShowSavedPopup] = useState(false);
  // Update your component to include the new state
  const [showMeetOptions, setShowMeetOptions] = useState(false);
  // Add new state
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const [playingCandidateId, setPlayingCandidateId] = useState(null); // New state to track the id of the candidate being played
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [filters, setFilters] = useState({
    university: [],
    major: [],
    graduationYear: [],
    skills: [],
    position: [], // Add position filter
    culture: [],
  });
  const loadMoreCandidates = () => {
    setDisplayCount((prevCount) => prevCount + loadMoreCount);
  };
  const handlePlayClick = () => {
    setIsPlaying(true); // Start playing when play button is clicked
  };

  const handleClosePopup = () => {
    setPopup(false);
    localStorage.setItem("popupDismissed", "true"); // Mark as dismissed
  };

  const [refreshKey, setRefreshKey] = useState(0); // Add this state to your App component
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const toggleInviteCodesPopup = () => {
    setShowInviteCodes(!showInviteCodes);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handleBack(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  useEffect(() => {
    sessionStorage.setItem("showGridView", JSON.stringify(showGridView));
  }, [showGridView]);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("hasSeenPopup");
    if (!hasSeenPopup) {
      setShowNavPopup(true);
      localStorage.setItem("hasSeenPopup", "true");
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [auth]);

  useEffect(() => {
    const handleScroll = () => {
      const bottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
      if (bottom) {
        loadMoreCandidates();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchCodes = async () => {
      if (user) {
        try {
          const userRef = doc(db, "recruiter-accounts", user.email);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            // console.log("Invitation codes: " + userDoc.data().invitationCodes);
            setCodes(userDoc.data().invitationCodes);
          }
        } catch (error) {
          console.error("Error fetching codes:", error);
        }
      }
    };

    fetchCodes();
  }, [user]);

  // Set the persistence before calling signInWithEmailAndPassword
  setPersistence(auth, browserSessionPersistence)
    .then(() => {
      // Existing sign-in code here
      return signInWithEmailAndPassword(auth, email, password);
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
    });

  const videoQuestions = [
    "Tell us about your story!",
    "What makes you stand out amongst other candidates?",
    "Tell us about a time when you overcame a challenge!",
  ];

  const [openFilterCategories, setOpenFilterCategories] = useState([]); // Now an array to track multiple open categories

  const FilterOptions = ({ title, options, selectedOptions, onSelect, isOpen, onToggle }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSelect = (option) => {
      const isSelected = selectedOptions.includes(option);
      if (isSelected) {
        onSelect(selectedOptions.filter((o) => o !== option));
      } else {
        onSelect([...selectedOptions, option]);
      }
      setSearchQuery('');
      onToggle(); // Close the dropdown after selection
    };

    return (
      <div className="filter-option-section">
        <div className="filter-title" onClick={onToggle}>
          <span>{title}</span>
          {isOpen ? <FiChevronUp className="filter-icon" /> : <FiChevronDown className="filter-icon" />}
        </div>

        {isOpen && (
          <div className="options-container">
            <div className="filter-search">
              <input
                type="text"
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="filter-search-input"
              />
            </div>
            {options
              .filter(option => option.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((option, index) => (
                <div
                  key={index}
                  className={`option-item ${selectedOptions.includes(option) ? "selected" : ""}`}
                  onClick={() => handleSelect(option)}
                >
                  <div className="checkbox">
                    {selectedOptions.includes(option) && <span className="checkmark">✓</span>}
                  </div>
                  <span className="option-text">{option}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    function filterCandidates() {
      const newFilteredCandidates = candidates.filter((candidate) => {
        const matchesUniversity =
          !filters.university.length ||
          (candidate.university && filters.university.includes(candidate.university));

        const matchesMajor =
          !filters.major.length || (candidate.major && filters.major.includes(candidate.major));

        const matchesGradYear =
          !filters.graduationYear.length ||
          (candidate.graduationYear && filters.graduationYear.includes(
            candidate.graduationYear.toString()
          ));

        const matchesSkills =
          !filters.skills ||
          !filters.skills.length ||
          (candidate.skills || []).some((skill) => filters.skills.includes(skill));

        const candidateCultureTags = candidate.culture?.cultureTags || [];
        // Here, candidateCultureTags is guaranteed to be an array (empty if missing).
        const matchesCulture =
          !filters.culture ||
          !filters.culture.length ||
          candidateCultureTags.some((tag) => filters.culture.includes(tag));

        const matchesPosition =
          !filters.position.length || // Ensure this condition is correct
          filters.position.includes(candidate.position); // Check if candidate's position matches the filter    

        return (
          matchesUniversity &&
          matchesMajor &&
          matchesGradYear &&
          matchesSkills &&
          matchesPosition &&
          matchesCulture
        );
      });

      // Add this line to filter only candidates with video1 recorded
      let finalFilteredCandidates = newFilteredCandidates.filter(candidate => candidate.video1);
      
      shuffleArray(finalFilteredCandidates);
      setFilteredCandidates(finalFilteredCandidates);
      setCurrentIndex(finalFilteredCandidates.length > 0 ? 0 : -1);
    }

    filterCandidates();
  }, [filters, candidates]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, navigate to the viewer
        navigate("/viewer");
      } else {
        // User is not signed in, navigate to login
        navigate("/login");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth, navigate]);

  // Additional useEffect for handling filter changes
  useEffect(() => {
    const filtered = applyFilters();
    setFilteredCandidates(filtered);
    if (
      !filtered.find(
        (c) => c.id === (filteredCandidates[currentIndex] || {}).id
      )
    ) {
      setCurrentIndex(0); // Reset to the first video if the current one is not in the filtered list
    }
  }, [filters, candidates]);

  function applyFilters() {
    return candidates.filter((candidate) => {
      const matchesUniversity =
        !filters.university.length ||
        (candidate.university && filters.university.includes(candidate.university));

      const matchesMajor =
        !filters.major.length ||
        (candidate.major && filters.major.includes(candidate.major));

      const matchesGradYear =
        !filters.graduationYear.length ||
        (candidate.graduationYear && filters.graduationYear.includes(
          candidate.graduationYear.toString()
        ));

      const matchesSkills =
        !filters.skills?.length ||
        (candidate.skills || []).some((skill) => filters.skills.includes(skill));

      // IMPORTANT: Use .cultureTags instead of .culture and default to empty array.
      const candidateCultureTags = candidate.culture?.cultureTags || [];

      const matchesCulture =
        !filters.culture?.length ||
        candidateCultureTags.some((tag) => filters.culture.includes(tag));

      const matchesPosition =
        !filters.position?.length ||
        filters.position.includes(candidate.position);

      return (
        matchesUniversity &&
        matchesMajor &&
        matchesGradYear &&
        matchesSkills &&
        matchesPosition &&
        matchesCulture
      );
    });
  }

  useEffect(() => {
    setShowGridView(initialShowGridView);
  }, [initialShowGridView]);

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
      shuffleArray(candidatesWithAllVideos);
      setCandidates(candidatesWithAllVideos); // Store filtered list of candidates
      setFilteredCandidates(candidatesWithAllVideos); // By default, show only candidates with all videos
    };

    fetchCandidates();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute("data-lazy");
          img.setAttribute("src", src);
          observer.unobserve(entry.target);
        }
      });
    });

    document.querySelectorAll("img[data-lazy]").forEach((img) => {
      observer.observe(img);
    });

    return () => observer.disconnect(); // Cleanup the observer when the component unmounts
  }, []); // Empty dependency array ensures this runs once on mount

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
      [array[i], array[j]] = [array[j], array[i]]; // swap elements
    }
  }

  useEffect(() => {
    setShowGridView(initialShowGridView);
  }, [initialShowGridView]); // Re-run this effect when initialShowGridView changes

  useEffect(() => {
    executeSearch();
  }, [filters]); // Add filters as a dependency

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
        // case "Shift":
        //   setShowResume(!showResume);
        //   break;
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

  const uniqueUniversities = [
    ...new Set(candidates
      .filter((candidate) => candidate.university != null)
      .map((candidate) => candidate.university)),
  ].sort();

  const uniqueMajors = [
    ...new Set(candidates
      .filter((candidate) => candidate.major != null)
      .map((candidate) => candidate.major)),
  ].sort();

  const uniqueGraduationYears = [
    ...new Set(
      candidates
        .filter((candidate) => candidate.graduationYear != null)
        .map((candidate) => candidate.graduationYear.toString())
    ),
  ].sort();

  const uniqueSkills = [
    ...new Set(candidates.flatMap((candidate) => candidate.skills || [])),
  ].sort();

  const uniqueCulture = [
    ...new Set(
      candidates.flatMap((candidate) => {
        // candidate.culture might be undefined or missing cultureTags
        if (!candidate.culture || !Array.isArray(candidate.culture.cultureTags)) {
          return [];
        }
        return candidate.culture.cultureTags; // This should be an array of strings
      })
    ),
  ].sort();

  function executeSearch() {
    const lowerQuery = searchQuery.toLowerCase();

    const newFilteredCandidates = candidates.filter((candidate) => {
      // Basic text matching:
      const matchesQuery =
        (candidate.university && candidate.university.toLowerCase().includes(lowerQuery)) ||
        (candidate.major && candidate.major.toLowerCase().includes(lowerQuery)) ||
        (candidate.graduationYear && candidate.graduationYear.toString().toLowerCase().includes(lowerQuery));

      // Filter checks:
      const matchesUniversity =
        !filters.university.length ||
        (candidate.university && filters.university.includes(candidate.university));

      const matchesMajor =
        !filters.major.length || (candidate.major && filters.major.includes(candidate.major));

      const matchesGradYear =
        !filters.graduationYear.length ||
        (candidate.graduationYear && filters.graduationYear.includes(
          candidate.graduationYear.toString()
        ));

      const matchesSkills =
        !filters.skills ||
        filters.skills.length === 0 ||
        (candidate.skills &&
          candidate.skills.some((skill) =>
            filters.skills.includes(skill)
          ));

      const matchesPosition =
        !filters.position.length ||
        filters.position.includes(candidate.position);

      // NEW: Add culture filter logic
      const candidateCultureTags = candidate.culture?.cultureTags || [];
      const matchesCulture =
        !filters.culture ||
        !filters.culture.length ||
        candidateCultureTags.some((tag) => filters.culture.includes(tag));

      return (
        matchesQuery &&
        matchesUniversity &&
        matchesMajor &&
        matchesGradYear &&
        matchesSkills &&
        matchesPosition &&
        matchesCulture // Include culture in the final check
      );
    });

    setFilteredCandidates(newFilteredCandidates);
    setShowGridView(true);
  }

  useEffect(() => {
    setShowGridView(initialShowGridView);
  }, [initialShowGridView]); // This will update the local state whenever the prop changes

  const handleLogoClick = () => {
    console.log("Logo clicked");
    setShowGridView(true);
    setSearchQuery("");
    // Reset all filters
    setFilters({
      university: [],
      major: [],
      graduationYear: [],
    });

    window.location.reload();
  };

  const handleHomeButtonClick = () => {
    console.log("Home button clicked");
    setSearchQuery(""); // Reset search query
    setFilters({ university: [], major: [], graduationYear: [] }); // Reset all filters
    executeSearch(); // Execute search with reset state to return to "home page" view
    onLogoClick(); // Call the function when the home icon is clicked

    window.location.reload();
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      const allSuggestions = new Set();

      candidates.forEach((candidate) => {
        if (candidate.university) {
          allSuggestions.add(candidate.university);
        }
        if (candidate.major) {
          allSuggestions.add(candidate.major);
        }
        if (candidate.skills) {
          candidate.skills.forEach(skill => allSuggestions.add(skill));
        }
      });

      const filteredSuggestions = Array.from(allSuggestions).filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      );

      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions([]);

    const lowerSuggestion = suggestion.toLowerCase();
    const filtered = candidates.filter((candidate) => {
      const universityMatch = candidate.university &&
        candidate.university.toLowerCase().includes(lowerSuggestion);
      const majorMatch = candidate.major &&
        candidate.major.toLowerCase().includes(lowerSuggestion);
      const skillsMatch = candidate.skills?.some((skill) =>
        skill.toLowerCase().includes(lowerSuggestion)
      );

      return universityMatch || majorMatch || skillsMatch;
    });

    setFilteredCandidates(filtered);
    setShowGridView(true);

    // Update selected filters
    setSelectedFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      if (filtered.some(candidate => candidate.university && candidate.university.toLowerCase() === lowerSuggestion)) {
        newFilters.university = [suggestion];
      }
      if (filtered.some(candidate => candidate.major && candidate.major.toLowerCase() === lowerSuggestion)) {
        newFilters.major = [suggestion];
      }
      if (filtered.some(candidate => candidate.skills?.includes(suggestion))) {
        newFilters.skills = [suggestion];
      }
      return newFilters;
    });
  };

  const executeSearchWithQuery = (query) => {
    const lowerQuery = query.toLowerCase();
    const filtered = candidates.filter(
      (candidate) =>
        ((candidate.university && candidate.university.toLowerCase().includes(lowerQuery)) ||
          (candidate.major && candidate.major.toLowerCase().includes(lowerQuery)) ||
          (candidate.graduationYear && candidate.graduationYear
            .toString()
            .toLowerCase()
            .includes(lowerQuery))) &&
        candidate.video1 !== "" &&
        candidate.video2 !== "" &&
        candidate.video3 !== ""
    );
    setFilteredCandidates(filtered);
    setShowGridView(true); // Show grid view after search
  };

  const handleCandidateSelect = (candidateIndex, videoUrl = null) => {
    setCurrentIndex(candidateIndex);

    if (videoUrl) {
      const selectedCandidateVideos = [
        filteredCandidates[candidateIndex].video1,
        filteredCandidates[candidateIndex].video2,
        filteredCandidates[candidateIndex].video3,
      ];

      // Find the index of the video URL in the candidate's video list
      const videoIndex = selectedCandidateVideos.indexOf(videoUrl);

      // Update the currentVideoIndex if the video is found
      if (videoIndex !== -1) {
        setCurrentVideoIndex(videoIndex);
      }
    } else {
      // Reset to the first video if no specific video URL is provided
      setCurrentVideoIndex(0);
    }

    window.history.pushState({ showGridView: false }, "");
    setShowGridView(false); // Switch to detailed view
    window.scrollTo(0, 0); // Scroll to top
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
      const content = `Hi ${firstName},\n\nWe think you are a great candidate for [Company Name], we would like to get to know you better and schedule an initial call.\n\nTime:\nDay:\nZoom / Hangout link:\n\nLet us know if this works. Looking forward!\n\nBest,\n\n[Your Name]`;
      setEmailContent(content);
      setEmailPopup(true);
    }
  };

  const handleToggleResume = () => {
    setShowResume(!showResume);
  };

  const handleVideoSelect = (videoUrl) => {
    // Find the candidate and video index based on the videoUrl
    const candidateIndex = filteredCandidates.findIndex(
      (candidate) =>
        candidate.video1 === videoUrl ||
        candidate.video2 === videoUrl ||
        candidate.video3 === videoUrl
    );

    if (candidateIndex !== -1) {
      const selectedCandidate = filteredCandidates[candidateIndex];
      const videoIndex = [
        selectedCandidate.video1,
        selectedCandidate.video2,
        selectedCandidate.video3,
      ].indexOf(videoUrl);

      setCurrentIndex(candidateIndex);
      setCurrentVideoIndex(videoIndex);
      setShowGridView(false); // Switch back to the main viewer
      window.scrollTo(0, 0); // Scroll to the top to bring the main viewer into view
    }
  };

  const handleVideoButtonClick = (index) => {
    setCurrentVideoIndex(index);
    setIsVideoPlaying(true); // Start playing the video
  };

  const handleVideoEnd = () => {
    const nextVideoIndex = currentVideoIndex + 1;

    // Check if there's a next video
    if (nextVideoIndex < videoUrls.length) {
      setCurrentVideoIndex(nextVideoIndex); // Update the video index to play the next video
      setIsVideoPlaying(true); // Ensure the video plays automatically
    } else {
      // Optionally handle the end of the last video (e.g., reset to first video, show a message, etc.)
      setIsVideoPlaying(false); // Stop playing as it's the last video
    }
  };

  const handleUniversityClick = (university) => {
    if (!university) return;
    setFilters((prevFilters) => ({
      ...prevFilters,
      university: [university],
    }));
  };

  const handleMajorClick = (major) => {
    if (!major) return;
    setFilters((prevFilters) => ({
      ...prevFilters,
      major: [major],
    }));
  };

  const handleGradYearClick = (gradYear) => {
    if (!gradYear) return;
    setFilters((prevFilters) => ({
      ...prevFilters,
      graduationYear: [gradYear],
    }));
  };

  const handlePositionClick = (position) => {
    if (!position) return;
    setFilters((prevFilters) => ({
      ...prevFilters,
      position: [position],
    }));
  };

  const handleUniversityClickFromVideo = (university) => {
    if (!university) return;
    setFilters({ university: [university], major: [], graduationYear: [] });
    setShowGridView(true); // Go back to the grid/homepage view
    setRefreshKey((oldKey) => oldKey + 1); // Optionally, force refresh if needed
  };

  const handleMajorClickFromVideo = (major) => {
    if (!major) return;
    setFilters({ university: [], major: [major], graduationYear: [] });
    setShowGridView(true); // Go back to the grid/homepage view
    setRefreshKey((oldKey) => oldKey + 1); // Optionally, force refresh if needed
  };

  const handleGradYearClickFromVideo = (gradYear) => {
    if (!gradYear) return;
    setFilters({ university: [], major: [], graduationYear: [gradYear] });
    setShowGridView(true); // Go back to the grid/homepage view
    setRefreshKey((oldKey) => oldKey + 1); // Optionally, force refresh if needed
  };

  const handleSearch = () => {
    // Trigger the same logic as pressing Enter
    if (searchQuery.trim()) {
      handleSuggestionSelect(searchQuery);
    }
  };

  const handleSavedClick = () => {
    navigate('/saved');
  };

  const copyCode = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        alert("Invite code copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const ScrollableTags = ({ tags, type }) => {
    const scrollRef = useRef(null);
    const [isScrollable, setIsScrollable] = useState(false);
    const [showLeftFade, setShowLeftFade] = useState(false);
    const [showRightFade, setShowRightFade] = useState(false);

    useEffect(() => {
      const checkScroll = () => {
        const { current } = scrollRef;
        if (current) {
          setIsScrollable(current.scrollWidth > current.clientWidth);
          setShowLeftFade(current.scrollLeft > 0);
          setShowRightFade(
            current.scrollLeft + current.clientWidth < current.scrollWidth
          );
        }
      };

      checkScroll();
      const ref = scrollRef.current;
      if (ref) {
        ref.addEventListener("scroll", checkScroll);
        window.addEventListener("resize", checkScroll);
      }
      return () => {
        if (ref) {
          ref.removeEventListener("scroll", checkScroll);
          window.removeEventListener("resize", checkScroll);
        }
      };
    }, [tags]);

    const containerClass = type === 'skills' ? 'skills-container' : 'culture-container';
    const tagClass = type === 'skills' ? 'skill-tag' : 'culture-tag';

    return (
      <div className={`tags-wrapper ${containerClass}`}>
        {isScrollable && showLeftFade && (
          <div className="fade-left" />
        )}
        <div
          ref={scrollRef}
          className="tags-scroll-container"
        >
          {tags?.map((tag, index) => (
            <span
              key={index}
              className={tagClass}
              onClick={(e) => {
                e.stopPropagation();
                // Add your tag click handler here if needed
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        {isScrollable && showRightFade && (
          <div className="fade-right" />
        )}
      </div>
    );
  };

  const EmailPopup = ({ emailContent, onClose }) => {
    const { email, firstName } = filteredCandidates[currentIndex];
    const [isSending, setIsSending] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [meetingLink, setMeetingLink] = useState(''); // State for meeting link

    const handleCopy = (text) => {
      navigator.clipboard.writeText(text);
    };

    const formatEmailContent = () => {
      let formattedContent = emailContent;
      if (selectedDate) {
        formattedContent = formattedContent.replace(
          '[DATE]',
          selectedDate.format('MMMM Do YYYY')
        );
      }
      if (selectedTime) {
        formattedContent = formattedContent.replace(
          '[TIME]',
          selectedTime.format('h:mm a')
        );
      }
      return formattedContent;
    };

    const handleSendEmail = async () => {
      if (!selectedDate || !selectedTime || !meetingLink) {
        alert("Please select a date, a time, and enter a meeting link.");
        return;
      }

      setIsSending(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("No user logged in");
        }
        clickSound.play();

        const userRef = doc(db, "recruiter-accounts", user.email);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();


        // Format the selected date and time
        const formattedDate = selectedDate.format('MMMM Do YYYY');
        const formattedTime = selectedTime.format('h:mm a');

        // Send email using EmailJS
        await emailjs.send(
          "drafted-candidate",
          "company_nudge",
          {
            to_name: firstName,
            to_email: email,
            cc_email: user.email,
            bcc_email: "appdrafted@gmail.com",
            from_name: userData.companyName,
            company: userData.companyName,
            message_html: formatEmailContent(),
            reply_to: user.email,
            scheduled_date: formattedDate, // Pass date separately
            scheduled_time: formattedTime, // Pass time separately
            meeting_link: meetingLink // Pass meeting link
          }
        );

        alert("Email sent successfully!");
        onClose();

      } catch (error) {
        console.error("Error sending email:", error);
        alert("Failed to send email. Please try again later.");
      } finally {
        setIsSending(false);
      }
    };

    return (
      <div className="popup-overlay">
        <div className="popup-content">
          <button className="close-button" onClick={onClose}>
            X
          </button>
          <div className="datetime-picker-overlay">
            <div className="datetime-picker-container">
              <label>Select Date:</label>
              <Datetime
                value={selectedDate}
                onChange={setSelectedDate}
                timeFormat={false} // Disable time selection
                inputProps={{ placeholder: 'Select Date' }}
              />
            </div>
            <div className="datetime-picker-container">
              <label>Select Time:</label>
              <Datetime
                value={selectedTime}
                onChange={setSelectedTime}
                dateFormat={false} // Disable date selection
                inputProps={{ placeholder: 'Select Time' }}
              />
            </div>
            <div className="datetime-picker-container">
              <label>Meeting Link:</label>
              <input
                type="text"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="Enter Meeting Link (Zoom, Hangout, etc.)"
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #e0e0e0' }}
              />
            </div>
          </div>
          <div className="email-address-container">
            <p className="email-address">{email}</p>
          </div>
          <button className="meet-option-button" onClick={() => handleCopy(email)}
            style={{
              fontWeight: 600,
            }}
          >
            Copy Email
          </button>
          <div className="email-content-container">
            <img
              src={previewImage}
              alt="Email Preview"
              style={{ width: '100%', borderRadius: '8px' }}
            />
          </div>
          <button
            className="meet-option-button"
            style={{
              fontWeight: 600,
            }}
            onClick={() => handleCopy(formatEmailContent())}
          >
            Copy Preview Text
          </button>
          <br></br>
          <button
            className="meet-option-button"
            style={{
              fontWeight: 600,
            }}
            onClick={handleSendEmail}
            disabled={isSending}
          >
            {isSending ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </div>
    );
  };

  // Anywhere after filteredCandidates is created but before it's used for rendering:
  const displayCandidates = filteredCandidates.filter(candidate => candidate.video1);

  // Then use displayCandidates instead of filteredCandidates in your rendering logic
  if (showGridView) {
    return (
      <div>
        <div className="header">
          <br></br>
          <br></br>
          <h1 onClick={handleLogoClick} className="logo-header clickable">
            {/* drafted<span style={{ color: "#53ad7a" }}> beta</span>
            <span>.</span> */}
            <br></br>
            <br></br>
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
            <br></br>
          </h1>
        </div>
        <br></br>
        {/* Search Bar - added here to appear in the grid view */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by university, major, grad year, or skills..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-bar"
          />
          {/* <button
            onClick={toggleInviteCodesPopup}
          className="code-button"
        >
            Invite Codes
          </button> */}
          <br></br>
          <button
            onClick={handleSearch}
            className="code-button"
          >
            Search
          </button>
          <button
            onClick={handleSavedClick}
            className="code-button"
          >
            Saved
          </button>

          {suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => {
                    handleSuggestionSelect(suggestion);
                    document.activeElement.blur(); // Hide mobile keyboard
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        {showPopup && (
          <div className="nav-popup">
            <h2>Let's get drafting.</h2>
            <p>We make it easy and fun to build your team. Fast.</p>
            <ul>
              <p>
                <li>Filter candidates to find your next hire quickly.</li>
                <li>Easily view candidate information.</li>
                <li>View personalized culture match tags.</li>
                <li>Click <strong>🤝 Meet</strong> to schedule interview.</li>
              </p>
            </ul>
            <br />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button className="draft-button" onClick={handleClosePopup}>
                Close
              </button>
            </div>
          </div>
        )}

        {showInviteCodes && codes != null && codes.length > 0 && (
          <div className="invite-codes-popup">
            <h3>
              <strong>Your Unique Invite Codes</strong>
            </h3>
            <p>
              These are unique, one-use invite codes for other startups to draft
              candidates using Drafted. Share them wisely!
            </p>
            <div className="code-container">
              {codes.map((code, index) => (
                <div key={index} className="code-block">
                  <span>{code}</span>
                  <button
                    className="navigation-button"
                    onClick={() => copyCode(code)}
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
            <br />
            <button
              onClick={toggleInviteCodesPopup}
              className="navigation-button"
            >
              Close
            </button>
          </div>
        )}

        <div className="filter-container">
          <div className="filter-row">
            <FilterOptions
              title="University"
              options={uniqueUniversities}
              selectedOptions={filters.university}
              onSelect={(selected) => {
                setFilters((prevFilters) => ({
                  ...prevFilters,
                  university: selected,
                }));
                // Close dropdown after selection on mobile
                if (window.innerWidth <= 768) {
                  setOpenFilterCategories([]);
                }
              }}
              isOpen={openFilterCategories.includes('University')}
              onToggle={() => {
                setOpenFilterCategories(current =>
                  current.includes('University')
                    ? []
                    : ['University']
                );
              }}
            />
            <FilterOptions
              title="Major"
              options={uniqueMajors}
              selectedOptions={filters.major}
              onSelect={(selected) =>
                setFilters((prevFilters) => ({ ...prevFilters, major: selected }))
              }
              isOpen={openFilterCategories.includes('Major')}
              onToggle={() => {
                setOpenFilterCategories(current =>
                  current.includes('Major')
                    ? []
                    : ['Major']
                );
              }}
            />
            <FilterOptions
              title="Graduation Year"
              options={uniqueGraduationYears}
              selectedOptions={filters.graduationYear}
              onSelect={(selected) =>
                setFilters((prevFilters) => ({
                  ...prevFilters,
                  graduationYear: selected,
                }))
              }
              isOpen={openFilterCategories.includes('Graduation Year')}
              onToggle={() => {
                setOpenFilterCategories(current =>
                  current.includes('Graduation Year')
                    ? []
                    : ['Graduation Year']
                );
              }}
            />
            <FilterOptions
              title="Skills"
              options={uniqueSkills}
              selectedOptions={filters.skills}
              onSelect={(selected) =>
                setFilters((prevFilters) => ({
                  ...prevFilters,
                  skills: selected,
                }))
              }
              isOpen={openFilterCategories.includes('Skills')}
              onToggle={() => {
                setOpenFilterCategories(current =>
                  current.includes('Skills')
                    ? []
                    : ['Skills']
                );
              }}
            />
            <FilterOptions
              title="Culture"
              options={uniqueCulture}
              selectedOptions={filters.culture}
              onSelect={(selected) =>
                setFilters((prevFilters) => ({
                  ...prevFilters,
                  culture: selected,
                }))
              }
              isOpen={openFilterCategories.includes('Culture')}
              onToggle={() => {
                setOpenFilterCategories((current) =>
                  current.includes('Culture')
                    ? current.filter((cat) => cat !== 'Culture')
                    : [...current, 'Culture']
                );
              }}
            />
            <FilterOptions
              title="Position"
              options={["Fulltime", "Internship"]} // Display capitalized options
              selectedOptions={filters.position.map(capitalizeFirst)} // Capitalize for display
              onSelect={(selected) =>
                setFilters((prevFilters) => ({
                  ...prevFilters,
                  position: selected.map(pos => pos.toLowerCase()), // Store lowercase
                }))
              }
              isOpen={openFilterCategories.includes('Position')}
              onToggle={() => {
                setOpenFilterCategories(current =>
                  current.includes('Position')
                    ? []
                    : ['Position']
                );
              }}
            />
          </div>
        </div>

        {/* Add this right after your filter-container div to show selected filters */}
        {/* {Object.entries(filters).some(([_, values]) => values.length > 0) && (
          <div className="selected-filters-mobile">
            {Object.entries(filters).map(([category, values]) =>
              values.map((value) => (
                <button
                  key={`${category}-${value}`}
                  className="filter-tag-mobile"
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      [category]: prev[category].filter(v => v !== value)
                    }));
                  }}
                >
                  {value} ×
                </button>
              ))
            )}
          </div>
        )} */}

        <div className="candidates-grid">
          {displayCandidates.map((candidate, index) => (
            <div
              key={candidate.id}
              className="candidate-card clickable"
              onClick={() => handleCandidateSelect(index)}
            >
              <div className="video-thumbnail-wrapper">
                <LazyLoadComponent
                  placeholder={
                    <img src={cover} alt="Cover" className="cover-image" />
                  }
                >
                  <img
                    src={candidate.thumbnail ? candidate.thumbnail : cover}
                    alt={`${candidate.firstName} ${candidate.lastName}`}
                    className="video-thumbnail"
                  />
                </LazyLoadComponent>
              </div>
              <div className="candidate-details">
                <h4 className="candidate-name">
                  {capitalizeName(candidate.firstName)}{' '}{capitalizeName(candidate.lastName)}
                </h4>
                <p
                  className="candidate-university clickable-filter"
                  onClick={() => candidate.university && handleUniversityClick(candidate.university)}
                >
                  {candidate.university || "N/A"}
                </p>
                <p
                  className="candidate-major clickable-filter"
                  onClick={() => candidate.major && handleMajorClick(candidate.major)}
                >
                  {candidate.major || "N/A"}
                </p>
                <p
                  className="candidate-grad-year clickable-filter"
                  onClick={(e) => {
                    e.stopPropagation();
                    candidate.graduationYear && handleGradYearClickFromVideo(candidate.graduationYear);
                  }}
                >
                  Class of {candidate.graduationYear || "N/A"}
                </p>
                {candidate.position && (
                  <p className="candidate-position clickable-filter"
                    onClick={() => handlePositionClick(candidate.position)}
                  >
                    Seeking {candidate.position} position
                  </p>
                )}
                {/* Replace the existing skills container with ScrollableTags */}
                {candidate.skills?.length > 0 && (
                  <ScrollableTags
                    tags={candidate.skills}
                    type="skills"
                  />
                )}
                {/* Replace the existing culture container with ScrollableTags */}
                {candidate.culture?.cultureTags?.length > 0 && (
                  <ScrollableTags
                    tags={candidate.culture.cultureTags}
                    type="culture"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (displayCandidates.length === 0) {
    return <div>Loading...</div>;
  }

  const candidate = displayCandidates[currentIndex] || {};
  const videoUrls = [
    candidate.video1,
    candidate.video2,
    candidate.video3,
  ].filter((url) => url); // This will exclude falsy values, including empty strings

  const otherVideos = displayCandidates.filter(
    (_, idx) => idx !== currentIndex
  );

  const uniqueVideoUrls = new Set();
  displayCandidates.forEach((candidate) => {
    if (candidate.video1) uniqueVideoUrls.add(candidate.video1);
    if (candidate.video2) uniqueVideoUrls.add(candidate.video2);
    if (candidate.video3) uniqueVideoUrls.add(candidate.video3);
  });

  const handleFilterChange = (filterType, selectedOptions) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: selectedOptions,
    }));
  };

  displayCandidates.forEach((candidate) => {
    [candidate.video1, candidate.video2, candidate.video3].forEach(
      (videoUrl) => {
        if (videoUrl) uniqueVideoUrls.add(videoUrl);
      }
    );
  });

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


  // Update your meet button handler
  const handleMeetClick = () => {
    setShowMeetOptions(true);
  };

  // Add these handlers
  const handleEmailOption = () => {
    setShowMeetOptions(false);
    setEmailPopup(true); // Your existing email popup state
  };

  const saveCandidate = async (candidate) => {
    try {
      const recruiterRef = doc(db, "recruiter-accounts", user.email);
      await updateDoc(recruiterRef, {
        savedCandidates: arrayUnion(candidate.id)
      });
      setShowSavedPopup(true);
      setTimeout(() => setShowSavedPopup(false), 2000);
    } catch (error) {
      console.error("Error saving candidate:", error);
    }
  };

  const handleSaveOption = async () => {
    await saveCandidate(displayCandidates[currentIndex]);
    setShowMeetOptions(false);
    setShowSaveConfirmation(true);
  };

  // Add navigation handler
  const handleViewSaved = () => {
    navigate('/saved');
  };

  // Add this handler function near your other handlers
  const handleSkillClickFromCard = (e, skill) => {
    e.stopPropagation(); // Prevent card selection when clicking skill
    setFilters({
      university: [],
      major: [],
      graduationYear: [],
      skills: [skill],
      position: []
    });
    setShowGridView(true);
    setRefreshKey(oldKey => oldKey + 1);
  };

  function handleCultureTagClick(tag, description) {
    // Logic to show the popup with the tag and description
    setPopupContent({ tag, description });
    setShowCulturePopup(true);
  }

  const handleBackClick = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div className="profile-dashboard">
      <div className="header">
        <img
          src={backArrow} // Use the imported back arrow icon
          alt="Back"
          className="back-arrow-icon"
          onClick={handleHomeButtonClick}
        />
        <h1 onClick={handleLogoClick} className="logo-header clickable">
          {/* drafted<span style={{ color: "#53ad7a" }}> beta</span>
          <span>.</span> */}
          <br></br>
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
          <br></br>
        </h1>
      </div>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by university, major, grad year, or skills..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-bar"
        />
        <button
          onClick={handleSavedClick}
          className="code-button"
        >
          Saved
        </button>

        {suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => {
                  handleSuggestionSelect(suggestion);
                  document.activeElement.blur(); // Hide mobile keyboard
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
      {showNavPopup && (
        <div className="nav-popup">
          <h2>Welcome to Drafted!</h2>
          <p>We make it easy and fun to find your next hire.</p>
          <ul>
            <li>
              <strong style="color: #00BF63;">Enter:</strong> Draft candidate,
              creates email thread to schedule first interview.
            </li>
            <li>
              <strong style="color: #00BF63;">Shift:</strong> View candidate
              resume.
            </li>
            <li>
              <strong style="color: #00BF63;">Right arrow:</strong> See next
              candidate.
            </li>
            <li>
              <strong style="color: #00BF63;">Left arrow:</strong> See previous
              candidate.
            </li>
          </ul>
          <button
            className="navigation-button"
            onClick={() => setShowNavPopup(false)}
          >
            Close
          </button>
        </div>
      )}

      <div className="filter-container">
        <div className="filter-row">
          <FilterOptions
            title="University"
            options={uniqueUniversities}
            selectedOptions={filters.university}
            onSelect={(selected) => {
              setFilters((prevFilters) => ({
                ...prevFilters,
                university: selected,
              }));
              // Close dropdown after selection on mobile
              if (window.innerWidth <= 768) {
                setOpenFilterCategories([]);
              }
            }}
            isOpen={openFilterCategories.includes('University')}
            onToggle={() => {
              setOpenFilterCategories(current =>
                current.includes('University')
                  ? []
                  : ['University']
                );
            }}
          />
          <FilterOptions
            title="Major"
            options={uniqueMajors}
            selectedOptions={filters.major}
            onSelect={(selected) =>
              setFilters((prevFilters) => ({ ...prevFilters, major: selected }))
            }
            isOpen={openFilterCategories.includes('Major')}
            onToggle={() => {
              setOpenFilterCategories(current =>
                current.includes('Major')
                  ? []
                  : ['Major']
                );
            }}
          />
          <FilterOptions
            title="Graduation Year"
            options={uniqueGraduationYears}
            selectedOptions={filters.graduationYear}
            onSelect={(selected) =>
              setFilters((prevFilters) => ({
                ...prevFilters,
                graduationYear: selected,
              }))
            }
            isOpen={openFilterCategories.includes('Graduation Year')}
            onToggle={() => {
              setOpenFilterCategories(current =>
                current.includes('Graduation Year')
                  ? []
                  : ['Graduation Year']
                );
            }}
          />
          <FilterOptions
            title="Skills"
            options={uniqueSkills}
            selectedOptions={filters.skills}
            onSelect={(selected) =>
              setFilters((prevFilters) => ({
                ...prevFilters,
                skills: selected,
              }))
            }
            isOpen={openFilterCategories.includes('Skills')}
            onToggle={() => {
              setOpenFilterCategories(current =>
                current.includes('Skills')
                  ? []
                  : ['Skills']
                );
            }}
          />
          <FilterOptions
            title="Culture"
            options={uniqueCulture}
            selectedOptions={filters.culture}
            onSelect={(selected) =>
              setFilters((prevFilters) => ({
                ...prevFilters,
                culture: selected,
              }))
            }
            isOpen={openFilterCategories.includes('Culture')}
            onToggle={() => {
              setOpenFilterCategories((current) =>
                current.includes('Culture')
                  ? current.filter((cat) => cat !== 'Culture')
                  : [...current, 'Culture']
                );
            }}
          />
          <FilterOptions
            title="Position"
            options={["Fulltime", "Internship"]} // Display capitalized options
            selectedOptions={filters.position.map(capitalizeFirst)} // Capitalize for display
            onSelect={(selected) =>
              setFilters((prevFilters) => ({
                ...prevFilters,
                position: selected.map(pos => pos.toLowerCase()), // Store lowercase
              }))
            }
            isOpen={openFilterCategories.includes('Position')}
            onToggle={() => {
              setOpenFilterCategories(current =>
                current.includes('Position')
                  ? []
                  : ['Position']
              );
            }}
          />
        </div>
      </div>
      <div className="main-and-other-videos-container">
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
          {/* <p
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              fontSize: "large",
              textAlign: "center",
              color: "#666"
            }}
          >
            Use ← and → arrow keys to navigate between candidates
          </p> */}
          <div className="video-resume-container" {...handlers}>
            {videoUrls[currentVideoIndex] && (
              <ReactPlayer
                url={videoUrls[currentVideoIndex]}
                playing={true}
                controls={true}
                width="100%"
                height="100%"
                onEnded={handleVideoEnd}
                playsinline={true} // Add playsinline attribute to prevent full-screen mode on mobile
                config={{
                  youtube: {
                    playerVars: { vq: "small" },
                  },
                }}
                style={{ position: "absolute", top: 0, left: 0 }}
              />
            )}
          </div>
          <br></br>
          <div className="candidate-name-display">
            <span className="candidate-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {capitalizeName(candidate.firstName)}{' '}{capitalizeName(candidate.lastName)}
              <img
                src={verified}
                alt="Verified"
                style={{
                  width: '50px',
                  height: '50px',
                  objectFit: 'contain'
                }}
              />
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}> {/* Reduced gap to 5px */}
              <button
                className="draft-button"
                onClick={() => setShowMeetOptions(true)}
                aria-label="Draft candidate for interview"
                style={{
                  height: '54px', // Increased height
                  padding: '0 24px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  width: '280px', // Increased width
                  fontSize: '16px' // Slightly larger text
                }}
              >
                🤝 Meet {capitalizeName(candidate.firstName)}
              </button>
              <button
                className="save-button"
                onClick={() => handleSaveOption()}
                aria-label="Draft candidate for interview"
                style={{
                  height: '54px', // Increased height
                  padding: '0 24px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  width: '280px', // Increased width
                  fontSize: '16px' // Slightly larger text
                }}
              >
                Save candidate
              </button>
            </div>
          </div>
          <div className="video-resume-display">Video Resume</div>
          <div className="video-selection-buttons">
            {videoQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleVideoButtonClick(index)}
                className={`video-btn ${currentVideoIndex === index ? "active" : "not-selected"}`}
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
                onClick={(e) => {
                  e.stopPropagation();
                  candidate.university && handleUniversityClickFromVideo(candidate.university);
                }}
              >
                {candidate.university || "N/A"}
              </p>
            </div>
            <div className="profile-field">
              <strong>Major</strong>{" "}
              <p
                className="candidate-major clickable-filter"
                onClick={(e) => {
                  e.stopPropagation();
                  candidate.major && handleMajorClickFromVideo(candidate.major);
                }}
              >
                {candidate.major || "N/A"}
              </p>
            </div>
            {candidate.skills && candidate.skills.length > 0 && (
              <div className="profile-field">
                <strong>Skills</strong>{" "}
                <div className="skills-tags">
                  {candidate.skills.map((skill, index) => (
                    <div key={index} className="skill-tag-container">
                      <span
                        className="skill-tag"
                      >
                        {skill}
                      </span>
                      <div className="culture-description-popup" style={{
                        display: 'none',
                        position: 'absolute',
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        padding: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        zIndex: 1000,
                        maxWidth: '200px'
                      }}>
                        {candidate.skillDescriptions?.[index] || 'No description available'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {candidate.culture?.cultureTags?.length > 0 && (
              <div className="profile-field">
                <strong>Culture (click for description)</strong>{" "}
                <div className="culture-tags">
                  {candidate.culture.cultureTags.map((tag, index) => (
                    <div key={index} className="culture-tag-container">
                      <span
                        className="culture-tag"
                        onClick={(e) => {
                          handleCultureTagClick(tag, candidate.culture.cultureDescriptions?.[index] || 'No description available')
                        }}
                      >
                        {tag}
                      </span>
                      <div className="culture-description-popup" style={{
                        display: 'none',
                        position: 'absolute',
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        padding: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        zIndex: 1000,
                        maxWidth: '200px'
                      }}>
                        {candidate.culture.cultureDescriptions?.[index] || 'No description available'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {candidate.linkedInURL || candidate.gitHubURL ? (
              <div className="profile-field">
                <strong>Social</strong>
                <div className="social-links">
                  {candidate.linkedInURL && (
                    <a
                      href={candidate.linkedInURL.startsWith('http') ? candidate.linkedInURL : `https://${candidate.linkedInURL}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      <img src={linkedinIcon} alt="LinkedIn" />
                    </a>
                  )}
                  {candidate.gitHubURL && (
                    <a
                      href={candidate.gitHubURL.startsWith('http') ? candidate.gitHubURL : `https://${candidate.gitHubURL}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      <img src={githubIcon} alt="GitHub" />
                    </a>
                  )}
                </div>
              </div>
            ) : null}
            {candidate.position && (
              <div className="profile-field">
                <strong>Position</strong>{" "}
                <a
                  href={candidate.position}
                  className="candidate-major clickable-filter"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {typeof candidate.position === 'string'
                    ? candidate.position.charAt(0).toUpperCase() + candidate.position.slice(1).toLowerCase()
                    : candidate.position}
                </a>
              </div>
            )}
            <div className="profile-field">
              <strong>Graduation Year</strong>{" "}
              <p
                className="candidate-grad-year clickable-filter"
                onClick={(e) => {
                  e.stopPropagation();
                  candidate.graduationYear && handleGradYearClickFromVideo(candidate.graduationYear);
                }}
              >
                {candidate.graduationYear || "N/A"}
              </p>
            </div>
            <div className="profile-field">
              <strong>Resume</strong>
              {candidate.resume ? (
                <button
                  className="resume-button"
                  onClick={handleToggleResume}
                >
                  View Resume
                </button>
              ) : (
                <button
                  className="resume-button"
                  onClick={emailDraft} // Reuse the draft function for this button
                >
                  No Resume, Draft to Request
                </button>
              )}
            </div>
          </div>

          <div className="button-group">
            <button
              className="draft-button"
              onClick={() => setShowMeetOptions(true)}
              aria-label="Draft candidate for interview"
            >
              🤝 Meet {capitalizeName(candidate.firstName)}
            </button>
          </div>
          <div className="button-group">
            <div
              className="share-profile"
              onClick={() => {
                const profileUrl = `https://candidate.joindrafted.com/candidate/${candidate.email}`;
                navigator.clipboard.writeText(profileUrl)
                  .then(() => {
                    alert("Profile URL copied");  // Updated alert message
                  })
                  .catch(err => {
                    console.error('Failed to copy URL:', err);
                    alert("Failed to copy URL");
                  });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',  // Reduced from 8px
                cursor: 'pointer',
                marginBottom: '12px'
              }}
            >
              <img
                src={shareArrow}  // Use the imported image
                alt="Share"
                style={{
                  width: '35px',  // Increased from 28px
                  height: '35px'  // Increased from 28px
                }}
              />
              <span style={{
                color: '#666',
                fontWeight: 600,
                fontSize: '17px'  // Reduced from 14px
              }}>
                SHARE PROFILE LINK
              </span>
            </div>
          </div>
        </div>
        <div className="other-videos-container">
          <br></br>
          {displayCandidates.slice(0, displayCount).map((candidate, index) => {
            if (index === currentIndex) return null; // Skip the currently viewed candidate

            const thumbnailSrc = candidate.thumbnail
              ? candidate.thumbnail
              : cover;

            return (
              <div
                key={candidate.id}
                className="candidate-card"
                onClick={() => handleCandidateSelect(index)}
              >
                <div className="video-thumbnail-wrapper clickable">
                  <img
                    src={thumbnailSrc}
                    alt="Thumbnail"
                    className="video-thumbnail"
                  />
                </div>
                <div className="candidate-details">
                  <h4 className="candidate-name clickable">
                    {capitalizeName(candidate.firstName)}{' '}{capitalizeName(candidate.lastName)}
                  </h4>
                  <p
                    className="candidate-university clickable-filter"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUniversityClickFromVideo(candidate.university);
                    }}
                  >
                    {candidate.university || "N/A"}
                  </p>
                  <p
                    className="candidate-major clickable-filter"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMajorClickFromVideo(candidate.major);
                    }}
                  >
                    {candidate.major || "N/A"}
                  </p>
                  <p
                    className="candidate-grad-year clickable-filter"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGradYearClickFromVideo(candidate.graduationYear);
                    }}
                  >
                    Class of {candidate.graduationYear || "N/A"}
                  </p>
                </div>
              </div>
            );
          })}
          {showEmailPopup && (
            <EmailPopup
              emailContent={emailContent}
              onClose={() => setEmailPopup(false)}
            />
          )}
        </div>
      </div>

      {showResume && (
        <>
          <div
            className="resume-overlay"
            onClick={() => setShowResume(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999
            }}
          />
          <div className="resume-popup" style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90vw',
            maxWidth: '1200px',
            height: '85vh',
            backgroundColor: 'white',
            zIndex: 1000,
            padding: '20px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <iframe
              src={candidate.resume}
              title="Resume"
              style={{
                width: '100%',
                height: 'calc(100% - 50px)',
                border: 'none',
                borderRadius: '4px'
              }}
            ></iframe>
            <button
              className="meet-option-button"
              onClick={() => setShowResume(false)}
            >
              Close Resume
            </button>
          </div>
        </>
      )}
      {showMeetOptions && (
        <MeetOptionsPopup
          onClose={() => setShowMeetOptions(false)}
          onEmail={() => {
            setShowMeetOptions(false);
            emailDraft(); // Your existing email function
          }}
          onSave={handleSaveOption}
          candidateName={capitalizeName(displayCandidates[currentIndex].firstName)}
        />
      )}
      {showSaveConfirmation && (
        <SaveConfirmationPopup
          onClose={() => setShowSaveConfirmation(false)}
          onViewSaved={handleViewSaved}
          candidateName={capitalizeName(displayCandidates[currentIndex].firstName)}
        />
      )}
      {showCulturePopup && (
        <div className="popup-overlay" onClick={() => setShowCulturePopup(false)}>
          <div className="culture-popup" onClick={(e) => e.stopPropagation()}>
            <div className="culture-popup-tag">{popupContent.tag}</div>
            <div className="culture-popup-description">{popupContent.description}</div>
            <button className="culture-popup-close" onClick={() => setShowCulturePopup(false)}>×</button>
          </div>
        </div>
      )}
      <button onClick={handleBackClick} style={{ marginBottom: '20px' }}>
        Back
      </button>
    </div>
  );
};

export default CandidateViewer;
