
import { MessageSquare, Sliders } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import styles from '../styles/SearchModeToggle.module.css';

interface SearchModeToggleProps {
  searchMode: 'prompt' | 'guided';
  setSearchMode: (mode: 'prompt' | 'guided') => void;
}

const SearchModeToggle = ({ searchMode, setSearchMode }: SearchModeToggleProps) => {
  return (
    <div className={styles.container}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={styles.buttonWrapper}
      >
        <Button
          variant={searchMode === 'prompt' ? "default" : "outline"}
          onClick={() => setSearchMode('prompt')}
          className={`${styles.button} ${searchMode === 'prompt' ? styles.activeButton : ''}`}
        >
          <MessageSquare className="w-4 h-4 mr-2.5" />
          AI Search
        </Button>
      </motion.div>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={styles.buttonWrapper}
      >
        <Button
          variant={searchMode === 'guided' ? "default" : "outline"}
          onClick={() => setSearchMode('guided')}
          className={`${styles.button} ${searchMode === 'guided' ? styles.activeButton : ''}`}
        >
          <Sliders className="w-4 h-4 mr-2.5" />
          Guided Search
        </Button>
      </motion.div>
    </div>
  );
};

export default SearchModeToggle;
