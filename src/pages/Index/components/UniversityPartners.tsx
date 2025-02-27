
import { motion } from 'framer-motion';
import styles from '../styles/UniversityPartners.module.css';

const UniversityPartners = () => {
  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
    >
      <h2 className={styles.title}>
        Partnered With Leading Universities
      </h2>
      <div className={styles.logoGrid}>
        <img 
          src="/lovable-uploads/30353202-3845-4a5c-b6ae-c6a45ebf2613.png" 
          alt="University of Chicago" 
          className={styles.logo}
        />
        <img 
          src="/lovable-uploads/a5af4c0f-422e-4026-9a3e-01fffb80c56a.png" 
          alt="University of Southern California" 
          className={styles.logo}
        />
        <img 
          src="/lovable-uploads/065e03f4-c385-4427-829c-77b6a62b3328.png" 
          alt="Georgetown University" 
          className={styles.georgetownLogo}
        />
      </div>
    </motion.div>
  );
};

export default UniversityPartners;
