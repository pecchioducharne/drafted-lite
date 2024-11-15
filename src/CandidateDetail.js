import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import ReactPlayer from "react-player";
import linkedinIcon from './linkedin.svg';
import githubIcon from './github.svg';

const CandidateDetail = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const docRef = doc(db, "drafted-accounts", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setCandidate({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching candidate:", error);
      }
    };

    fetchCandidate();
  }, [id]);

  if (!candidate) {
    return <div>Loading...</div>;
  }

  const videoUrls = [
    candidate.video1,
    candidate.video2,
    candidate.video3,
  ].filter((url) => url);

  return (
    <div>
      <h1>
        {candidate.firstName} {candidate.lastName}
      </h1>
      <div>
        {videoUrls.map((url, index) => (
          <ReactPlayer key={index} url={url} controls />
        ))}
      </div>
      <p>University: {candidate.university}</p>
      <p>Major: {candidate.major}</p>
      <p>Graduation Year: {candidate.graduationYear}</p>
      <div className="social-links">
        {candidate.linkedInURL && (
          <a href={candidate.linkedInURL} target="_blank" rel="noopener noreferrer">
            <img src={linkedinIcon} alt="LinkedIn" width="24" height="24" />
          </a>
        )}
        {candidate.gitHubURL && (
          <a href={candidate.gitHubURL} target="_blank" rel="noopener noreferrer">
            <img src={githubIcon} alt="GitHub" width="24" height="24" />
          </a>
        )}
      </div>
      {candidate.resume && (
        <div>
          <a href={candidate.resume} target="_blank" rel="noopener noreferrer">
            View Resume
          </a>
        </div>
      )}
    </div>
  );
};

export default CandidateDetail;
