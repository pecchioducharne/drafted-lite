
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AnimatePresence } from 'framer-motion';
import styles from '../styles/PromptSearch.module.css';
import LoadingScreen from './LoadingScreen';

interface PromptSearchProps {
  displayText: string;
  searchInput: string;
  setSearchInput: (value: string) => void;
}

const PromptSearch = ({ displayText, searchInput, setSearchInput }: PromptSearchProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = () => {
    if (searchInput.trim()) {
      setIsLoading(true);
      // Simulating a search delay - replace with actual search logic
      console.log('Searching:', searchInput);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen />}
      </AnimatePresence>
      <div className={styles.container}>
        <Card className={styles.searchCard}>
          <div className={styles.inputWrapper}>
            <Input
              placeholder={displayText}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className={styles.searchInput}
            />
            <Button 
              className={styles.searchButton}
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>
          <div className={styles.promptText}>
            Try prompts like: "{displayText}"
          </div>
        </Card>
      </div>
    </>
  );
};

export default PromptSearch;
