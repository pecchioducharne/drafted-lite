
import { motion, AnimatePresence } from 'framer-motion';
import { PlaySquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import styles from '../styles/Hero.module.css';

const jobTitles = [
  "hire",
  "software engineer",
  "product manager",
  "data analyst",
  "marketing intern",
  "ux designer",
  "sales rep",
  "customer success",
  "growth marketer",
  "content creator",
  "operations intern"
];

const Hero = () => {
  const [currentJobIndex, setCurrentJobIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentJobIndex((prev) => (prev + 1) % jobTitles.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.titleWrapper}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className={styles.mainTitle}
        >
          Let's find your next
        </motion.div>
        <div className={styles.dynamicText}>
          <AnimatePresence mode="wait">
            <motion.span
              key={currentJobIndex}
              className={styles.dynamicTextInner}
              initial={{ 
                opacity: 0,
                y: 20,
              }}
              animate={{ 
                opacity: 1,
                y: 0,
              }}
              exit={{ 
                opacity: 0,
                y: -20,
              }}
              transition={{ 
                duration: 0.5,
                ease: [0.4, 0.0, 0.2, 1],
              }}
            >
              {jobTitles[currentJobIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
      <motion.div 
        className={styles.description}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <PlaySquare className={styles.icon} />
        <p className="text-center sm:text-left">
          Find candidates that match your company's DNA through video resumes
        </p>
      </motion.div>
    </div>
  );
};

export default Hero;
