import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import "./SearchPage.css";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidates = async () => {
      const querySnapshot = await getDocs(collection(db, "drafted-accounts"));
      const candidatesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCandidates(candidatesData);
    };

    fetchCandidates();
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      const universities = new Set();
      const majors = new Set();
      candidates.forEach((candidate) => {
        if (
          candidate.university &&
          candidate.university.toLowerCase().includes(query.toLowerCase())
        ) {
          universities.add(candidate.university);
        }
        if (
          candidate.major &&
          candidate.major.toLowerCase().includes(query.toLowerCase())
        ) {
          majors.add(candidate.major);
        }
      });

      const universitySuggestions = Array.from(universities);
      const majorSuggestions = Array.from(majors);
      const combinedSuggestions = [
        ...universitySuggestions,
        ...majorSuggestions,
      ].slice(0, 5); // Limit to top 5 suggestions
      setSuggestions(combinedSuggestions);
    } else {
      setSuggestions([]);
    }
  };

// In SearchPage component
const handleSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
  
    // Determine the type of suggestion (university, major, or grad year)
    const universities = candidates.map((candidate) => candidate.university.toLowerCase());
    const majors = candidates.map((candidate) => candidate.major.toLowerCase());
    const graduationYears = candidates.map((candidate) => candidate.graduationYear.toString());
  
    let filters = { university: [], major: [], graduationYear: [] };
  
    if (universities.includes(suggestion.toLowerCase())) {
      filters.university = [suggestion];
    } else if (majors.includes(suggestion.toLowerCase())) {
      filters.major = [suggestion];
    } else if (graduationYears.includes(suggestion)) {
      filters.graduationYear = [suggestion];
    }
  
    navigate("/viewer", { state: { searchQuery: suggestion, filters } });
  };
  

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery) {
      navigate("/viewer", { state: { searchQuery } });
    }
  };

  return (
    <div className="search-page">
      <h1 className="search-title">Find your next candidate</h1>
      <form className="search-form" onSubmit={handleSearchSubmit}>
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
      </form>
    </div>
  );
};

export default SearchPage;
