import React, { useState } from "react";
import { db } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Lottie from "react-lottie";
import astronautAnimation from "./astronaut.json";
import styles from "./CodePage.module.css";

const CodePage = () => {
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const welcomeBack = {
    loop: false,
    autoplay: true,
    animationData: astronautAnimation,
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const codeRef = doc(db, "invitationCodes", code);
      const codeDoc = await getDoc(codeRef);

      if (!codeDoc.exists()) {
        setErrorMessage("Oops! This code doesn't seem to be valid.");
      } else if (codeDoc.data().used) {
        setErrorMessage("This code has already been used. Try another one!");
      } else {
        await updateDoc(codeRef, { used: true });
        window.location.href = "/signup";
      }
    } catch (error) {
      console.error("Error checking code:", error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText("rodrigo@joindrafted.com");
    alert("Email copied to clipboard!");
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.h2}>You've been invited.</h2>
        <h3 className={styles.h3}>Welcome to Drafted.</h3>
        <h4 className={styles.h4}>
          Enter your exclusive code below to get started.
        </h4>
        <br />
        <Lottie options={welcomeBack} height={100} width={100} />
        <br />
        <input
          type="text"
          placeholder="Enter your invitation code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={styles.input}
        /><br />
        <br />
        <button type="submit" className={styles.button} disabled={isSubmitting}>
          {isSubmitting ? "Checking..." : "Start Drafting"}
        </button>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      </form>
      <div className={styles.accessMessage}>
        <p>
          Don't have an access code?{" "}
          <span className={styles.greenEmail}>andrew@joindrafted.com</span>{" "}
          <button className={styles.copyButton} onClick={copyEmailToClipboard}>
            Copy Email
          </button>
        </p>
      </div>
    </div>
  );
};

export default CodePage;
