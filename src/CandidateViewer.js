import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import "./CandidateViewer.css";
import recordGif from "./record.gif";
import ReactPlayer from "react-player";
import verifiedIcon from "./verified.png";
import logo from "./logo.svg";
import cover from "./cover-drafted.jpeg";
import { FiChevronDown, FiChevronUp } from "react-icons/fi"; // Import Chevron icons from 'react-icons'
import { Player } from "video-react";
import "video-react/dist/video-react.css"; // Import css
import { LazyLoadComponent } from "react-lazy-load-image-component";
import home from "./home.png";

const CandidateViewer = ({ email, showGridView: initialShowGridView }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResume, setShowResume] = useState(false);
  const [showNavPopup, setShowNavPopup] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [showGridView, setShowGridView] = useState(initialShowGridView);
  const [playingCandidateId, setPlayingCandidateId] = useState(null); // New state to track the id of the candidate being played
  const [filters, setFilters] = useState({
    university: [],
    major: [],
    graduationYear: [],
  });

  const [openFilterCategories, setOpenFilterCategories] = useState([]); // Now an array to track multiple open categories

  const FilterOptions = ({ title, options, selectedOptions, onSelect }) => {
    const handleSelect = (option) => {
      const isSelected = selectedOptions.includes(option);
      if (isSelected) {
        onSelect(selectedOptions.filter((o) => o !== option));
      } else {
        onSelect([...selectedOptions, option]);
      }
    };

    // Check if this filter category is open
    const showOptions = openFilterCategories.includes(title);

    return (
      <div className="filter-option-section">
        <div
          className="filter-title"
          onClick={() => {
            setOpenFilterCategories((current) =>
              current.includes(title)
                ? current.filter((category) => category !== title)
                : [...current, title]
            );
          }}
        >
          {title}
          {showOptions ? (
            <FiChevronUp className="filter-icon" />
          ) : (
            <FiChevronDown className="filter-icon" />
          )}
        </div>
        {showOptions && (
          <div className="options-container">
            {options.map((option, index) => (
              <div
                key={index}
                className={`option-item ${
                  selectedOptions.includes(option) ? "selected" : ""
                }`}
                onClick={() => handleSelect(option)}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

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

  const uniqueUniversities = [
    ...new Set(candidates.map((candidate) => candidate.university)),
  ];
  const uniqueMajors = [
    ...new Set(candidates.map((candidate) => candidate.major)),
  ];
  const uniqueGraduationYears = [
    ...new Set(
      candidates.map((candidate) => candidate.graduationYear.toString())
    ),
  ];

  const executeSearch = () => {
    const lowerQuery = searchQuery.toLowerCase();

    const newFilteredCandidates = candidates.filter((candidate) => {
      const matchesQuery =
        candidate.university.toLowerCase().includes(lowerQuery) ||
        candidate.major.toLowerCase().includes(lowerQuery) ||
        candidate.graduationYear.toString().toLowerCase().includes(lowerQuery);

      const matchesUniversity =
        !filters.university.length ||
        filters.university.includes(candidate.university);
      const matchesMajor =
        !filters.major.length || filters.major.includes(candidate.major);
      const matchesGraduationYear =
        !filters.graduationYear.length ||
        filters.graduationYear.includes(candidate.graduationYear.toString());

      return (
        matchesQuery &&
        matchesUniversity &&
        matchesMajor &&
        matchesGraduationYear
      );
    });

    setFilteredCandidates(newFilteredCandidates);
    setShowGridView(true); // Show grid view after search
  };

  const handleLogoClick = () => {
    executeSearch(); // Call with no arguments defaults to an empty string
  };

  const handleHomeButtonClick = () => {
    setSearchQuery(""); // Reset search query
    setFilters({ university: [], major: [], graduationYear: [] }); // Reset all filters
    executeSearch(); // Execute search with reset state to return to "home page" view
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      const universities = new Set();
      const majors = new Set();
      candidates.forEach((candidate) => {
        if (candidate.university.toLowerCase().includes(query.toLowerCase())) {
          universities.add(candidate.university);
        }
        if (candidate.major.toLowerCase().includes(query.toLowerCase())) {
          majors.add(candidate.major);
        }
      });

      const universitySuggestions = Array.from(universities);
      const majorSuggestions = Array.from(majors);
      const combinedSuggestions = [
        ...universitySuggestions,
        ...majorSuggestions,
      ].slice(0, 5);
      setSuggestions(combinedSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    // Update the search query with the selected suggestion
    setSearchQuery(suggestion);

    // Clear the current suggestions
    setSuggestions([]);

    // Convert the selected suggestion to lower case for case-insensitive comparison
    const lowerSuggestion = suggestion.toLowerCase();

    // Filter the candidates based on the selected suggestion.
    // This example checks if the candidate's university, major, or graduation year
    // includes the suggestion text. Adjust this logic as needed for your application.
    const filtered = candidates.filter(
      (candidate) =>
        candidate.university.toLowerCase().includes(lowerSuggestion) ||
        candidate.major.toLowerCase().includes(lowerSuggestion) ||
        candidate.graduationYear
          .toString()
          .toLowerCase()
          .includes(lowerSuggestion)
    );

    // Update the state with the filtered candidates
    setFilteredCandidates(filtered);

    // Optionally, if the search operation is asynchronous (e.g., involves fetching data
    // from a server), consider adding a loading state to provide user feedback.

    // Show the grid view to display the filtered candidates
    setShowGridView(true);
  };

  const executeSearchWithQuery = (query) => {
    const lowerQuery = query.toLowerCase();
    const filtered = candidates.filter(
      (candidate) =>
        (candidate.university.toLowerCase().includes(lowerQuery) ||
          candidate.major.toLowerCase().includes(lowerQuery) ||
          candidate.graduationYear
            .toString()
            .toLowerCase()
            .includes(lowerQuery)) &&
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
      const mailto = `mailto:${email}?subject=You've Been Drafted!&body=Hi ${firstName},%0D%0A%0D%0AWe think you are a great candidate for [Company Name], we would like to get to know you better and schedule an initial call.%0D%0A%0D%0ATime:%0D%0ADay:%0D%0AZoom / Hangout link:%0D%0A%0D%0ALet us know if this works. Looking forward!%0D%0A%0D%0ABest,%0D%0A%0D%0A[Your Name]`;
      window.location.href = mailto;
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

  const handleVideoEnd = () => {
    // Check if there's another video to play
    if (currentVideoIndex < videoUrls.length) {
      setCurrentVideoIndex(currentVideoIndex + 1); // Move to the next video
    } else {
      setCurrentVideoIndex(0); // Optionally loop back to the first video
    }
  };
  const handleUniversityClick = (university) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      // Add the university to the array if it's not already there, otherwise keep the array as is
      university: prevFilters.university.includes(university)
        ? prevFilters.university
        : [...prevFilters.university, university],
    }));
  };

  const handleMajorClick = (major) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      // Add the major to the array if it's not already there, otherwise keep the array as is
      major: prevFilters.major.includes(major)
        ? prevFilters.major
        : [...prevFilters.major, major],
    }));
  };

  const handleGradYearClick = (gradYear) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      // Add the graduation year to the array if it's not already there, otherwise keep the array as is
      graduationYear: prevFilters.graduationYear.includes(gradYear)
        ? prevFilters.graduationYear
        : [...prevFilters.graduationYear, gradYear],
    }));
  };

  // Show grid view of candidates with videos
  if (showGridView) {
    return (
      <div>
        <div className="filter-container">
          <FilterOptions
            title="University"
            options={uniqueUniversities}
            selectedOptions={filters.university}
            onSelect={(selected) =>
              setFilters((prevFilters) => ({
                ...prevFilters,
                university: selected,
              }))
            }
          />
          <FilterOptions
            title="Major"
            options={uniqueMajors}
            selectedOptions={filters.major}
            onSelect={(selected) =>
              setFilters((prevFilters) => ({ ...prevFilters, major: selected }))
            }
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
          />
        </div>

        <div className="candidates-grid">
          {filteredCandidates.map((candidate, index) => (
            <div
              key={candidate.id}
              className="candidate-card"
              onClick={() => handleCandidateSelect(index)}
            >
              <div className="video-wrapper">
                {/* Use LazyLoadComponent for lazy loading */}
                <LazyLoadComponent
                  placeholder={
                    <img src={cover} alt="Cover" className="cover-image" />
                  }
                >
                  {candidate.video1 ? (
                    <ReactPlayer
                      url={candidate.video1}
                      width="100%"
                      height="100%"
                      controls
                      light={candidate.thumbnail ? candidate.thumbnail : cover} // Use candidate-specific thumbnail if available
                      playIcon={
                        <img
                          src={
                            candidate.thumbnail ? candidate.thumbnail : cover
                          }
                          alt="Play"
                        />
                      } // Use candidate-specific thumbnail for play icon if available
                    />
                  ) : (
                    <img
                      src={cover}
                      alt="No Video Available"
                      className="no-video-image"
                    />
                  )}
                </LazyLoadComponent>
              </div>
              <div className="candidate-details">
                <h4 className="candidate-name">
                  {candidate.firstName} {candidate.lastName}
                </h4>
                <p
                  className="candidate-university clickable-filter"
                  onClick={() => handleUniversityClick(candidate.university)}
                >
                  {candidate.university}
                </p>

                <p
                  className="candidate-major clickable-filter"
                  onClick={() => handleMajorClick(candidate.major)}
                >
                  {candidate.major}
                </p>

                <p
                  className="candidate-grad-year clickable-filter"
                  onClick={() => handleGradYearClick(candidate.graduationYear)}
                >
                  Grad Year: {candidate.graduationYear}
                </p>
              </div>
            </div>
          ))}
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

  const otherVideos = filteredCandidates.filter(
    (_, idx) => idx !== currentIndex
  );

  const uniqueVideoUrls = new Set();
  filteredCandidates.forEach((candidate) => {
    if (candidate.video1) uniqueVideoUrls.add(candidate.video1);
    if (candidate.video2) uniqueVideoUrls.add(candidate.video2);
    if (candidate.video3) uniqueVideoUrls.add(candidate.video3);
  });

  filteredCandidates.forEach((candidate) => {
    [candidate.video1, candidate.video2, candidate.video3].forEach(
      (videoUrl) => {
        if (videoUrl) uniqueVideoUrls.add(videoUrl);
      }
    );
  });

  return (
    <div className="profile-dashboard">
      <div className="search-container">
        <img
          src={home} // Use the imported home icon
          alt="Home"
          className="home-icon"
          onClick={handleHomeButtonClick}
          style={{
            cursor: "pointer",
            marginRight: "10px", // Reduced margin to bring it closer to the search bar
            width: "32px", // Small icon size
            height: "32px", // Match the height with the width
            alignSelf: "center", // Center the icon vertically within the container
          }}
        />
        <input
          type="text"
          placeholder="Search by university, major, grad year..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-bar"
        />
        {suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionSelect(suggestion)}
                className="suggestion-item"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}

        <br></br>
        {/* <button onClick={executeSearch} className="navigation-button">
          Search
        </button> */}
      </div>

      {showNavPopup && (
        <div className="nav-popup">
          <h2>Welcome to Drafted!</h2>
          <p>We make it easy and fun to find your next hire.</p>
          <ul>
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
          <button
            className="navigation-button"
            onClick={() => setShowNavPopup(false)}
          >
            Close
          </button>
        </div>
      )}

      <div className="main-and-other-videos-container">
        <div className="main-video-profile-container">
          <div className="video-resume-container">
            {videoUrls[currentVideoIndex] && (
              <Player key={`${currentIndex}-${currentVideoIndex}`}>
                <source src={videoUrls[currentVideoIndex]} />
              </Player>
            )}
          </div>
          <div className="info-section">
            <div className="profile-field">
              <strong>University:</strong> {candidate.university}
            </div>
            <div className="profile-field">
              <strong>Major:</strong> {candidate.major}
            </div>
            <div className="profile-field">
              <strong>LinkedIn:</strong>{" "}
              <a href={candidate.linkedInURL} target="_blank">
                {candidate.linkedInURL}
              </a>
            </div>
            <div className="profile-field">
              <strong>Graduation Year:</strong> {candidate.graduationYear}
            </div>
            <div className="profile-field">
              <strong>Resume:</strong>
              <button
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                onClick={handleToggleResume}
              >
                View Resume
              </button>
            </div>
          </div>
          <div className="button-group">
            <button
              className="bg-customGreen hover:bg-customGreenDark text-white font-bold py-2 px-4 rounded"
              onClick={emailDraft}
            >
              Draft
            </button>
          </div>
        </div>
        <div className="other-videos-container">
          {filteredCandidates.map((candidate, index) => {
            if (index === currentIndex) return null; // Skip the currently viewed candidate

            // Determine the thumbnail to use: candidate-specific or default cover
            const thumbnailSrc = candidate.thumbnail
              ? candidate.thumbnail
              : cover;

            return (
              <div
                key={candidate.id}
                className="candidate-card"
                onClick={() => handleCandidateSelect(index)}
              >
                <div className="video-thumbnail-wrapper">
                  {/* Display the determined thumbnail */}
                  <img
                    src={thumbnailSrc}
                    alt="Thumbnail"
                    className="video-thumbnail"
                  />
                </div>
                <div className="candidate-details">
                  <h4 className="candidate-name">
                    {candidate.firstName} {candidate.lastName}
                  </h4>
                  <p className="candidate-university clickable-filter">
                    {candidate.university}
                  </p>
                  <p className="candidate-major clickable-filter">
                    {candidate.major}
                  </p>
                  <p className="candidate-grad-year clickable-filter">
                    Grad Year: {candidate.graduationYear}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* <div className="info-section">
        <div className="profile-field">
          <strong>University:</strong> {candidate.university}
        </div>
        <div className="profile-field">
          <strong>Major:</strong> {candidate.major}
        </div>
        <div className="profile-field">
          <strong>LinkedIn:</strong>{" "}
          <a href={candidate.linkedInURL} target="_blank">
            {candidate.linkedInURL}
          </a>
        </div>
        <div className="profile-field">
          <strong>Graduation Year:</strong> {candidate.graduationYear}
        </div>
        <div className="profile-field">
          <strong>Resume:</strong>
          <button
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
            onClick={handleToggleResume}
          >
            View Resume
          </button>
        </div>
      </div> */}

      {/* <div className="button-group">
        <button
          className="bg-customGreen hover:bg-customGreenDark text-white font-bold py-2 px-4 rounded"
          onClick={emailDraft}
        >
          Draft
        </button>
      </div> */}

      {/* <div className="join-message">
        <a href="https://drafted-recruiter.webflow.io/sign-up" target="_blank">
          Want to discover more candidates and filter by university, major, and
          grad year? Join Drafted
        </a>
      </div> */}

      {showResume && (
        <div className="resume-popup">
          <iframe
            src={candidate.resume}
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
