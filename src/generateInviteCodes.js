const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  doc,
  writeBatch,
} = require("firebase/firestore");
const { v4: uuidv4 } = require("uuid");

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmQRXoSyXy5rGm8JjF5JGH_eFQibKW_0g",
  authDomain: "drafted-6c302.firebaseapp.com",
  projectId: "drafted-6c302",
  storageBucket: "drafted-6c302.appspot.com",
  messagingSenderId: "739427449972",
  appId: "1:739427449972:web:c02c6a8cdf544c30e52521",
  measurementId: "G-2C3DWJC6W6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Generate a random alphanumeric code
const generateCode = () => {
  return uuidv4().slice(0, 6).toLowerCase(); // Generates a 6-character code
};

// Generate and store multiple codes
const generateMultipleCodes = async (count) => {
  const codesCollection = collection(db, "invitationCodes");
  const batch = writeBatch(db);

  for (let i = 0; i < count; i++) {
    const code = generateCode();
    console.log(code + "\n");
    const codeRef = doc(codesCollection, code);
    batch.set(codeRef, { used: false }); // Each code has a `used` field
  }

  try {
    await batch.commit();
    console.log("Codes generated and stored successfully.");
  } catch (error) {
    console.error("Error generating codes:", error);
  } finally {
    process.exit(); // Ensure the process exits after completion
  }
};

generateMultipleCodes(20);
