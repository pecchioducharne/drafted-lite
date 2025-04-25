import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import QuickRecruiterSignup from "./QuickRecruiterSignup";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import linkedinIcon from './linkedin.svg';
import githubIcon from './github.svg';
import { auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import BuildIcon from '@mui/icons-material/Build';
import GroupsIcon from '@mui/icons-material/Groups';
import { Star, BookOpen, Mountain, Coffee } from 'lucide-react';

const EmailPopup = ({ email, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          maxWidth: '500px',
          width: '90%'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            fontSize: '1.5rem',
            marginTop: 0,
            color: '#2d3748',
            fontWeight: '600'
          }}
        >
          Candidate Email
        </h3>
        <p
          style={{
            fontSize: '1.1rem',
            lineHeight: '1.6',
            color: '#4a5568',
            margin: '1rem 0'
          }}
        >
          {email}
        </p>
        <button
          style={{
            width: '100%',
            padding: '0.75rem',
            background: copied ? '#48BB78' : '#00BF63',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginTop: '1rem'
          }}
          onClick={handleCopy}
        >
          {copied ? 'Copied!' : 'Copy Email'}
        </button>
        <button
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#4a5568'
          }}
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </div>
  );
};

const VideoViewerSpanish = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isSpanish = searchParams.has('es');
  const [candidate, setCandidate] = useState({});
  const [videoUrls, setVideoUrls] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoQuestions, setVideoQuestions] = useState([]);
  const [showResume, setShowResume] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [user] = useAuthState(auth);
  const [emailPopup, setEmailPopup] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [emailCopied, setEmailCopied] = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);
  const navigate = useNavigate();
  const [selectedCulture, setSelectedCulture] = useState(null);
  const [showMeetOptions, setShowMeetOptions] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);
  const speedOptions = [1, 1.5, 2];

  const translations = {
    en: {
      loading: "Loading...",
      noVideo: "No video available",
      meetCandidate: "Meet ",
      viewResume: "View Resume",
      email: "Email",
      copyEmail: "Copy Email",
      emailCopied: "Email copied!",
      copyMessage: "Copy Message",
      messageCopied: "Message copied!",
      close: "Close",
      speed: "Speed",
      university: "University",
      major: "Major",
      graduationYear: "Graduation Year",
      skills: "Skills",
      culture: "Culture",
      social: "Social",
      resume: "Resume",
      draftEmail: "Draft Email",
      connectWith: "Connect with",
      emailTip: "Pro tip: Mention where you found them for a higher response rate!"
    },
    en: {
      loading: "Cargando...",
      noVideo: "No hay video disponible",
      meetCandidate: "Conocer al Candidato",
      viewResume: "Ver Currículum",
      email: "Correo Electrónico",
      copyEmail: "Copiar Correo",
      emailCopied: "¡Correo copiado!",
      copyMessage: "Copiar Mensaje",
      messageCopied: "¡Mensaje copiado!",
      close: "Cerrar",
      speed: "Velocidad",
      university: "Universidad",
      major: "Carrera",
      graduationYear: "Año de Graduación",
      skills: "Habilidades",
      culture: "Cultura",
      social: "Social",
      resume: "Currículum",
      draftEmail: "Redactar Correo",
      connectWith: "Conectar con",
      emailTip: "¡Consejo: Menciona dónde los encontraste para una mayor tasa de respuesta!"
    }
  };

  const t = (key) => {
    return translations[isSpanish ? 'es' : 'en'][key] || key;
  };

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
            {
              text: "¿Qué me hace destacar?",
              icon: <Star className="h-5 w-5 mr-2 flex-shrink-0" />
            },
            {
              text: "¿Cuál es mi historia?",
              icon: <BookOpen className="h-5 w-5 mr-2 flex-shrink-0" />
            },
            {
              text: "Un desafío que superé",
              icon: <Mountain className="h-5 w-5 mr-2 flex-shrink-0" />
            }
          ]);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching candidate:", error);
      }
    };

    fetchCandidate();
  }, [id]);

  const containerStyle = {
    maxWidth: window.innerWidth <= 768 ? '100%' : '1400px',
    margin: '0 auto',
    padding: window.innerWidth <= 768 ? '1rem' : '2rem',
    backgroundColor: 'white',
    minHeight: '100vh',
  };

  const mainContainerStyle = {
    position: 'relative',
    background: 'white',
    borderRadius: '30px',
    padding: window.innerWidth <= 768 ? '1.5rem' : '3rem',
    marginTop: '1rem',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05), 0 1px 8px rgba(0, 0, 0, 0.03)',
    overflow: 'hidden',
  };

  const blobStyle = {
    position: 'absolute',
    top: '-50%',
    right: '-50%',
    width: '100%',
    height: '100%',
    background:
      'radial-gradient(circle at center, rgba(0, 191, 99, 0.03) 0%, rgba(0, 191, 99, 0.01) 50%, transparent 70%)',
    borderRadius: '50%',
    zIndex: 0,
  };

  const videoContainerStyle = {
    position: 'relative',
    width: '100%',
    height: window.innerWidth <= 768 ? '300px' : '600px',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    backgroundColor: '#000',
    marginBottom: '2rem',
  };

  const nameDisplayStyle = {
    display: 'flex',
    flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
    alignItems: window.innerWidth <= 768 ? 'flex-start' : 'center',
    justifyContent: window.innerWidth <= 768 ? 'flex-start' : 'space-between',
    gap: window.innerWidth <= 768 ? '1rem' : '0',
    padding: '1.5rem 0',
    margin: '1rem 0 2rem 0',
    borderBottom: '2px solid rgba(0, 191, 99, 0.1)',
    fontSize: window.innerWidth <= 768 ? '2rem' : '3rem',
    fontWeight: 'bold',
  };

  const draftButtonStyle = {
    background: 'linear-gradient(135deg, #00BF63 0%, #00a857 100%)',
    color: 'white',
    padding: '1rem 2rem',
    borderRadius: '16px',
    fontWeight: '600',
    fontSize: '1.5rem',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    boxShadow: '0 4px 12px rgba(0, 191, 99, 0.2), 0 1px 3px rgba(0, 191, 99, 0.1)',
    transition: 'all 0.2s ease',
    margin: '0',
    width: 'auto',
    minWidth: 'fit-content',
    flexShrink: '0',
    whiteSpace: 'nowrap',
    alignSelf: 'center',
    pointerEvents: 'auto',
    zIndex: 10,
  };

  const videoButtonsStyle = {
    display: 'flex',
    flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
    gap: '1rem',
    margin: '1.5rem 0 2.5rem 0',
    width: '100%',
    justifyContent: window.innerWidth <= 768 ? 'stretch' : 'space-between',
  };

  const videoButtonStyle = (isActive) => ({
    padding: window.innerWidth <= 768 ? '1rem' : '1rem 1.5rem',
    background: isActive ? '#00BF63' : 'white',
    color: isActive ? 'white' : '#00BF63',
    border: '2px solid #00BF63',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: window.innerWidth <= 768 ? '100%' : 'auto',
    minWidth: window.innerWidth <= 768 ? 'auto' : '200px',
    fontSize: window.innerWidth <= 768 ? '1rem' : '1.2rem',
  });

  const infoSectionStyle = {
    display: 'grid',
    gridTemplateColumns:
      window.innerWidth <= 768
        ? '1fr'
        : 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: window.innerWidth <= 768 ? '1.5rem' : '2.5rem',
    padding: window.innerWidth <= 768 ? '1.5rem' : '2.5rem',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    margin: '1rem 0',
    position: 'relative',
    zIndex: 1,
  };

  const profileFieldStyle = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    padding: '1.5rem',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  };

  const socialLinksStyle = {
    display: 'flex',
    gap: '1.5rem',
  };

  const socialLinkStyle = {
    padding: '1rem',
    background: '#f8f9fa',
    borderRadius: '16px',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  };

  const resumePopupStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '95vw',
    maxWidth: '1800px',
    height: '90vh',
    backgroundColor: 'white',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    borderRadius: '12px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
  };

  const closeResumeButtonStyle = {
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
    zIndex: 1001,
  };

  const handleVideoButtonClick = (index) => {
    setCurrentVideoIndex(index);
  };

  const handleVideoEnd = () => {
    // Logic for what happens when video ends
  };

  const handleToggleResume = () => {
    setShowResume(!showResume);
  };

  const handleRequestInterview = () => {
    setShowSignupModal(true);
  };

  const emailDraft = () => {
    if (candidate) {
      const content = `Hi ${candidate.firstName},\n\nWe think you are a great candidate for [Company Name]; we'd like to schedule an initial call.\n\nTime:\nDay:\nZoom / Hangout link:\n\nLet us know if this works!\n\nBest,\n[Your Name]`;
      setEmailContent(content);
      setShowEmailPopup(true);
      setShowMeetOptions(false);
    }
  };

  const handleLogoClick = () => {
    window.open('https://drafted.webflow.io/', '_blank');
  };

  const buttonContainerStyle = {
    display: 'flex',
    flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: window.innerWidth <= 768 ? '1rem' : '2rem',
    marginTop: '2rem',
    padding: '1rem',
  };

  const actionButtonStyle = {
    padding: window.innerWidth <= 768 ? '1rem' : '1rem 2rem',
    borderRadius: '12px',
    fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.2rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '2px solid #00BF63',
    width: window.innerWidth <= 768 ? '100%' : 'auto',
    minWidth: window.innerWidth <= 768 ? 'auto' : '250px',
    textAlign: 'center',
    textDecoration: 'none',
    background: 'white',
    color: '#00BF63',
  };

  const handleMeetClick = () => {
    setShowMeetOptions(true);
  };

  const copyEmail = () => {
    if (candidate.email) {
      navigator.clipboard.writeText(candidate.email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    }
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(emailContent);
    setMessageCopied(true);
    setTimeout(() => setMessageCopied(false), 2000);
  };

  const handleCultureTagClick = (tag, description) => {
    if (description) {  // Only show popup if there's a description
      setSelectedCulture({ tag, description });
    }
  };

  const handleCloseCulturePopup = () => {
    setSelectedCulture(null);
  };

  const handleMeetCandidateClick = () => {
    setShowEmailPopup(true);
  };

  const handleCloseEmailPopup = () => {
    setShowEmailPopup(false);
    setEmailCopied(false);
  };

  const handleCopyEmail = () => {
    if (candidate.email) {
      navigator.clipboard.writeText(candidate.email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 3000);
    }
  };

  const speedControlStyle = {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  };

  const speedButtonStyle = {
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  };

  const speedOptionsStyle = {
    background: 'rgba(0, 0, 0, 0.7)',
    borderRadius: '8px',
    marginTop: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  };

  const speedOptionStyle = (isActive) => ({
    color: 'white',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '400',
    background: isActive ? 'rgba(0, 191, 99, 0.3)' : 'transparent',
    transition: 'all 0.2s ease',
  });

  const handleSpeedChange = (speed) => {
    setPlaybackRate(speed);
    setShowSpeedOptions(false);
  };

  useEffect(() => {
    const handleResize = () => {
      // Force re-render on window resize
      setVideoLoading(videoLoading);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [videoLoading]);

  return (
    <div style={containerStyle}>
      <div className="drafted-logo-container" onClick={handleLogoClick}>
        <DraftedLogo />
      </div>

      <div style={mainContainerStyle}>
        <div style={blobStyle} />

        <div style={{
          textAlign: 'left',
          marginBottom: '24px',
          fontFamily: "'Poppins', sans-serif",
          paddingLeft: '8px'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#000',
            margin: '0',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ 
              fontSize: '2.8rem',
              display: 'inline-block',
              animation: 'wave 1.5s ease-in-out'
            }}>👋</span> ¡Hola! Soy {candidate.firstName || ""}
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#000',
            margin: '0',
            fontWeight: '500'
          }}>
            {/* Nice to meet you! */}
          </p>
        </div>

        <style>
          {`
            @keyframes wave {
              0% { transform: rotate(0deg); }
              20% { transform: rotate(-10deg); }
              40% { transform: rotate(10deg); }
              60% { transform: rotate(-10deg); }
              80% { transform: rotate(10deg); }
              100% { transform: rotate(0deg); }
            }
          `}
        </style>

        <div style={videoContainerStyle}>
          {videoUrls[currentVideoIndex] ? (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <ReactPlayer
                url={videoUrls[currentVideoIndex]}
                controls={true}
                width="100%"
                height="100%"
                autoplay={true}
                onEnded={handleVideoEnd}
                onReady={() => setVideoLoading(false)}
                playsinline={true}
                playbackRate={playbackRate}
                config={{
                  youtube: {
                    playerVars: {
                      playsinline: 1,
                      modestbranding: 1,
                      rel: 0,
                      showinfo: 0,
                      autoplay: 1,
                      mute: 1,
                      vq: "small"
                    }
                  },
                  vimeo: {
                    playerOptions: {
                      playsinline: true,
                      autoplay: true,
                      muted: true
                    }
                  }
                }}
              />
              <div style={speedControlStyle}>
                <button
                  style={speedButtonStyle}
                  onClick={() => setShowSpeedOptions(!showSpeedOptions)}
                >
                  <span>{playbackRate}x</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4L6 8L10 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {showSpeedOptions && (
                  <div style={speedOptionsStyle}>
                    {speedOptions.map((speed) => (
                      <div
                        key={speed}
                        style={speedOptionStyle(speed === playbackRate)}
                        onClick={() => handleSpeedChange(speed)}
                      >
                        {speed}x
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {videoLoading && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}>
                  <p>{t('loading')}</p>
                </div>
              )}
            </div>
          ) : (
            <p>{t('noVideo')}</p>
          )}
        </div>

        <div style={nameDisplayStyle}>
          <span>{candidate.firstName || "N/A"} {candidate.lastName || "N/A"}</span>
          <button
            onClick={handleMeetCandidateClick}
            style={{
              ...draftButtonStyle,
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 191, 99, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 191, 99, 0.2), 0 1px 3px rgba(0, 191, 99, 0.1)';
            }}
          >
            <Coffee size={20} /> Conectemos
          </button>
        </div>

        <div style={videoButtonsStyle}>
          {videoQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleVideoButtonClick(index)}
              style={{
                ...videoButtonStyle(currentVideoIndex === index),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none';
              }}
            >
              {question.icon}
              {question.text}
            </button>
          ))}
        </div>

        <div style={infoSectionStyle}>
          <div style={profileFieldStyle}>
            <strong style={{
              color: '#555',
              fontSize: '1.3rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <SchoolIcon style={{ fontSize: '1.5rem', color: '#00BF63' }} />
              {t('university')}
            </strong>
            <p style={{ fontSize: '1.5rem', margin: 0 }}>
              {candidate.university || "N/A"}
            </p>
          </div>

          <div style={profileFieldStyle}>
            <strong style={{
              color: '#555',
              fontSize: '1.3rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <WorkIcon style={{ fontSize: '1.5rem', color: '#00BF63' }} />
              {t('major')}
            </strong>
            <p style={{ fontSize: '1.5rem', margin: 0 }}>
              {candidate.major || "N/A"}
            </p>
          </div>

          {(candidate.linkedInURL || candidate.gitHubURL) && (
            <div style={profileFieldStyle}>
              <strong style={{
                color: '#555',
                fontSize: '1.3rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {t('social')}
              </strong>
              <div style={socialLinksStyle}>
                {candidate.linkedInURL && (
                  <a
                    href={candidate.linkedInURL.startsWith('http') ? candidate.linkedInURL : `https://${candidate.linkedInURL}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={socialLinkStyle}
                  >
                    <img src={linkedinIcon} alt="LinkedIn" style={{ width: '32px', height: '32px' }} />
                  </a>
                )}
                {candidate.gitHubURL && (
                  <a
                    href={candidate.gitHubURL.startsWith('http') ? candidate.gitHubURL : `https://${candidate.gitHubURL}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={socialLinkStyle}
                  >
                    <img src={githubIcon} alt="GitHub" style={{ width: '32px', height: '32px' }} />
                  </a>
                )}
              </div>
            </div>
          )}

          <div style={profileFieldStyle}>
            <strong style={{
              color: '#555',
              fontSize: '1.3rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CalendarTodayIcon style={{ fontSize: '1.5rem', color: '#00BF63' }} />
              {t('graduationYear')}
            </strong>
            <p style={{ fontSize: '1.5rem', margin: 0 }}>
              {candidate.graduationYear || "N/A"}
            </p>
          </div>

          <div style={profileFieldStyle}>
            <strong style={{
              color: '#555',
              fontSize: '1.3rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <DescriptionIcon style={{ fontSize: '1.5rem', color: '#00BF63' }} />
              {t('resume')}
            </strong>
            <button
              onClick={candidate.resume ? handleToggleResume : handleRequestInterview}
              style={{
                background: '#4a5568',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '1.2rem',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#2d3748';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#4a5568';
                e.currentTarget.style.transform = 'none';
              }}
            >
              {candidate.resume ? t('viewResume') : t('draftEmail')}
            </button>
          </div>

          {candidate.skills && (
            <div style={profileFieldStyle}>
              <strong style={{
                color: '#555',
                fontSize: '1.3rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <BuildIcon style={{ fontSize: '1.5rem', color: '#00BF63' }} />
                {t('skills')}
              </strong>
              <div className="tags-container">
                {candidate.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {candidate.culture?.cultureTags && (
            <div style={profileFieldStyle}>
              <strong style={{
                color: '#555',
                fontSize: '1.3rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <GroupsIcon style={{ fontSize: '1.5rem', color: '#00BF63' }} />
                {t('culture')} <span style={{ 
                  fontSize: '0.9rem', 
                  color: '#999', 
                  textTransform: 'none',
                  fontWeight: 'normal',
                  letterSpacing: 'normal'
                }}>(click to expand)</span>
              </strong>
              <div className="tags-container">
                {candidate.culture.cultureTags.map((tag, index) => (
                  <span
                    key={index}
                    className="culture-tag"
                    onClick={() =>
                      handleCultureTagClick(
                        tag,
                        candidate.culture.cultureDescriptions?.[index]
                      )
                    }
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={buttonContainerStyle}>
        <a
          href="https://www.joindrafted.com"
          target="_blank"
          rel="noopener noreferrer"
          style={actionButtonStyle}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 191, 99, 0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          DRAFTED HOME
        </a>
        <a
          href="https://joindrafted.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          style={actionButtonStyle}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 191, 99, 0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          MEET MORE CANDIDATES
        </a>
      </div>

      {showResume && (
        <div style={resumePopupStyle}>
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
            style={closeResumeButtonStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#444';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#333';
            }}
          >
            {t('close')}
          </button>
        </div>
      )}

      {showMeetOptions && (
        <div className="popup-overlay">
          <div className="meet-options-popup">
            <button className="close-button" onClick={() => setShowMeetOptions(false)}>×</button>
            <button className="meet-option-button" onClick={emailDraft}>
              {t('draftEmail')}
            </button>
          </div>
        </div>
      )}

      {showEmailPopup && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              width: '90%',
              maxWidth: '450px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{padding: '24px 30px', borderBottom: '1px solid rgba(0,0,0,0.06)', position: 'relative'}}>
              <h2 style={{margin: 0, fontSize: '1.5rem', fontWeight: 600}}>
                {t('connectWith')} {candidate.firstName || "Candidate"}
              </h2>
              <button 
                onClick={handleCloseEmailPopup}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  lineHeight: 1,
                  padding: 0,
                  color: '#666',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: 'translateY(2px)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#e5e7eb';
                  e.currentTarget.style.color = '#333';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#f3f4f6';
                  e.currentTarget.style.color = '#666';
                }}
              >×</button>
            </div>
            
            <div style={{padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{
                backgroundColor: 'rgba(0, 191, 99, 0.1)',
                width: '88px', 
                height: '88px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <svg viewBox="0 0 24 24" width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 20.5H7C4 20.5 2 19 2 15.5V8.5C2 5 4 3.5 7 3.5H17C20 3.5 22 5 22 8.5V15.5C22 19 20 20.5 17 20.5Z" stroke="#00BF63" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 9L13.87 11.5C12.84 12.32 11.15 12.32 10.12 11.5L7 9" stroke="#00BF63" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <p style={{textAlign: 'center', fontSize: '1.1rem', marginBottom: '20px'}}>
                {t('email')} a {candidate.firstName || "this candidate"} {t('directamente')}:
              </p>
              
              <div style={{
                width: '100%',
                background: '#f5f7fa',
                borderRadius: '12px',
                padding: '18px 20px',
                marginBottom: '16px',
                fontSize: '1.1rem',
                fontWeight: '500',
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                wordBreak: 'break-all'
              }}>
                <span>{candidate.email || "email@example.com"}</span>
              </div>
              
              <button 
                onClick={handleCopyEmail}
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  background: emailCopied ? '#38A169' : 'linear-gradient(135deg, #00BF63 0%, #00a857 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  marginBottom: '24px'
                }}
              >
                {emailCopied ? t('emailCopied') : t('copyEmail')}
              </button>
              
              <div style={{
                width: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '12px',
                border: '1px dashed #e2e8f0'
              }}>
                <span>💡</span>
                <p style={{margin: 0, fontSize: '0.95rem', lineHeight: 1.5}}>
                  {t('emailTip')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCulture && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999
          }} 
          onClick={handleCloseCulturePopup}
        >
          <div 
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'white',
              padding: '2rem',
              borderRadius: '16px',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
              zIndex: 1000,
              maxWidth: '500px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              fontSize: '1.5rem',
              marginTop: 0,
              color: '#2d3748',
              fontWeight: '600'
            }}>
              {selectedCulture.tag}
            </h3>
            <p style={{
              fontSize: '1.1rem',
              lineHeight: '1.6',
              color: '#4a5568',
              margin: '1rem 0',
              whiteSpace: 'pre-wrap'
            }}>
              {selectedCulture.description}
            </p>
            <button 
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#4a5568'
              }}
              onClick={handleCloseCulturePopup}
            >
              ×
            </button>
          </div>
        </div>
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

export default VideoViewerSpanish;
