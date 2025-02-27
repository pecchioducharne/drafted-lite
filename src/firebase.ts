
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCmQRXoSyXy5rGm8JjF5JGH_eFQibKW_0g",
  authDomain: "drafted-6c302.firebaseapp.com",
  projectId: "drafted-6c302",
  storageBucket: "drafted-6c302.appspot.com",
  messagingSenderId: "739427449972",
  appId: "1:739427449972:web:c02c6a8cdf544c30e52521",
  measurementId: "G-2C3DWJC6W6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { app, auth, db, storage, analytics };
