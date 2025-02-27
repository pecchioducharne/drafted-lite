
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from '../pages/Index/components/Hero';
import SearchModeToggle from '../pages/Index/components/SearchModeToggle';
import PromptSearch from '../pages/Index/components/PromptSearch';
import GuidedSearch from '../pages/Index/components/GuidedSearch';
import UniversityPartners from '../pages/Index/components/UniversityPartners';
import { examplePrompts } from '../pages/Index/data';
import styles from '../pages/Index/styles/LandingPage.module.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface Candidate {
  id: string;
  video1: boolean;
  video2: boolean;
  video3: boolean;
  university?: string;
  major?: string;
  graduationYear?: number;
  [key: string]: any;
}

const LandingPage = () => {
  const [searchMode, setSearchMode] = useState<'prompt' | 'guided'>('prompt');
  const [displayText, setDisplayText] = useState('');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    const fetchCandidates = async () => {
      const querySnapshot = await getDocs(collection(db, "drafted-accounts"));
      const candidatesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Candidate[];

      // Filter candidates to include only those with all 3 videos completed
      const candidatesWithAllVideos = candidatesData.filter(
        (candidate) => candidate.video1 && candidate.video2 && candidate.video3
      );
      setCandidates(candidatesWithAllVideos);
    };

    fetchCandidates();
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentPrompt = examplePrompts[currentPromptIndex];
    const typeSpeed = 50;
    const deleteSpeed = 30;
    const pauseDuration = 2000;

    if (!isDeleting && displayText !== currentPrompt) {
      timeout = setTimeout(() => {
        setDisplayText(currentPrompt.slice(0, displayText.length + 1));
      }, typeSpeed);
    } else if (!isDeleting && displayText === currentPrompt) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseDuration);
    } else if (isDeleting && displayText !== '') {
      timeout = setTimeout(() => {
        setDisplayText(displayText.slice(0, -1));
      }, deleteSpeed);
    } else if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setCurrentPromptIndex((prev) => (prev + 1) % examplePrompts.length);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentPromptIndex]);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <motion.a
          href="https://www.joindrafted.com/drafted-recruiter-landing"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.logo}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.logoText}>
            drafted.
          </span>
        </motion.a>

        <div className={styles.content}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={styles.contentWrapper}
          >
            <Hero />
            <SearchModeToggle searchMode={searchMode} setSearchMode={setSearchMode} />
            <AnimatePresence mode="wait">
              {searchMode === 'prompt' ? (
                <motion.div
                  key="prompt"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <PromptSearch 
                    displayText={displayText}
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="guided"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <GuidedSearch candidates={candidates} />
                </motion.div>
              )}
            </AnimatePresence>
            <UniversityPartners />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
