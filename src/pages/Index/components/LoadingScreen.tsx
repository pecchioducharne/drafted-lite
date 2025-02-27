
import { motion } from "framer-motion";
import styles from '../styles/LoadingScreen.module.css';

const LoadingScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.loadingScreen}
    >
      <div className={styles.content}>
        <motion.div
          className={styles.circle}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={styles.text}
        >
          Finding your perfect match...
        </motion.h2>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
