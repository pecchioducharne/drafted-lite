import React, { useState, useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import Lottie from "react-lottie";
import step1Animation from "./step-1.json";
import step2Animation from "./step-2.json";
import step3Animation from "./step-3.json";
import { UserContext } from "./UserContext";
import { auth, db, analytics } from "./firebase";
import ReactGA4 from "react-ga4";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { logEvent } from "firebase/analytics";
import { ClipLoader } from "react-spinners";
import { v4 as uuidv4 } from "uuid";
import "./RecruiterSignupForm.css";
import emailjs from "emailjs-com";

const buttonStyles = {
  borderRadius: "8px",
  backgroundColor: "#207a56",
  textDecoration: "none",
  color: "white",
  padding: "10px 20px",
  border: "none",
  cursor: "pointer",
};

const fieldStyle = {
  width: "95%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "4px",
};

const errorStyle = {
  color: "red",
  fontSize: "0.8rem",
  marginBottom: "10px",
};

const signupLink = {
  fontSize: "large",
  textAlign: "center",
  marginTop: "15px",
};

const RecruiterSignupForm = () => {
  const navigate = useNavigate();
  const { setUserInfo } = useContext(UserContext);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  // Init email sender
  emailjs.init("1Ot5eCgFqaYhbo0bx");

  const generateCode = () => {
    return uuidv4().slice(0, 6).toLowerCase(); // Generates a 6-character code
  };

  const handleFinalUpload = async (values) => {
    setLoading(true);
    try {
      // Create the user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (user) {
        // Set recruiter claims
        const functions = getFunctions();
        const setRecruiterClaims = httpsCallable(
          functions,
          "setRecruiterClaims"
        );
        await setRecruiterClaims({ userId: user.uid });

        // Generate invitation codes
        const codes = [];
        for (let i = 0; i < 3; i++) {
          const code = generateCode();
          codes.push(code);

          // Save each code in the invitationCodes collection
          await setDoc(doc(db, "invitationCodes", code), { used: false });
        }

        // Prepare form data with codes
        const formData = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: user.email,
          companyName: values.companyName,
          jobTitle: values.jobTitle,
          companyURL: values.companyURL,
          invitationCodes: codes, // Save codes in recruiter-accounts
        };

        // Save the user data
        const userDataRef = doc(db, "recruiter-accounts", user.email);
        await setDoc(userDataRef, formData);

        // Send a welcome email
        await sendWelcomeEmail(user.email);

        navigate("/viewer");
      } else {
        throw new Error("User creation failed");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      if (error.code === "auth/email-already-in-use") {
        setSignupError(
          "Email is already in use. Please choose a different one."
        );
      } else {
        setSignupError(
          "There was an error completing the signup process. Please try again."
        );
      }
      setLoading(false);
    }
  };

  const logAttemptSignup = (email) => {
    logEvent(analytics, "attempted_recruiter_signup", { email });
  };

  const logSignupError = (email) => {
    logEvent(analytics, "recruiter_signup_error", { email });
  };

  const navigateToRecruiterSignin = async () => {
    navigate("/");
  };

  const navigateToCandidateSignup = () => {
    window.location.href = "https://drafted-onboarding.netlify.app/";
  };

  const sendWelcomeEmail = async (email) => {
    try {
      await emailjs.send("drafted_service", "recruiter_template", {
        to_email: email,
      });

      // Handle success
      console.log("Email sent successfully!");
      console.log("Email: " + email);

      // Optionally track email sent event using GA4
      ReactGA4.event({
        category: "Email",
        action: "Sent Welcome Email",
        label: "Welcome Email Sent",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email. Please try again later.");
    } finally {
      // setIsLoading(false); // Set loading to false after email attempt
    }
  };

  return (
    <div>
      <br></br>
      <br></br>
      {step === 1 && (
        <Formik
          initialValues={{ email: "" }}
          validationSchema={Yup.object({
            email: Yup.string()
              .email("Invalid email address")
              .required("Company Email is required"),
          })}
          onSubmit={(values) => {
            setEmail(values.email);
            setUserInfo({ email: values.email });
            logAttemptSignup(values.email);
            setStep(2);
          }}
        >
          {(formik) => (
            <Form style={{ maxWidth: "850px", margin: "0 auto" }}>
              <Lottie
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: step1Animation,
                }}
                height={100}
                width={100}
              />
              <h2>Let's find your next hire</h2>
              <h3>Join Drafted's community of recruiters</h3>
              <p>
                The best place to find your next best candidate, and build teams
                lightning fast.
              </p>
              <Field
                style={fieldStyle}
                name="email"
                type="email"
                placeholder="Company Email"
              />
              <ErrorMessage name="email" component="div" style={errorStyle} />
              <button type="submit" style={buttonStyles}>
                Next
              </button>
              <p style={signupLink}>
                Already have an account?{" "}
                <a
                  href="#"
                  onClick={navigateToRecruiterSignin}
                  className="link"
                >
                  <strong>Sign In</strong>
                </a>
              </p>
              <p className="signupLink">
                Looking for a job?{" "}
                <a
                  href="#"
                  onClick={navigateToCandidateSignup}
                  className="link"
                >
                  <strong>Click Here</strong>
                </a>
              </p>
            </Form>
          )}
        </Formik>
      )}
      {step === 2 && (
        <Formik
          initialValues={{ password: "", confirmPassword: "" }}
          validationSchema={Yup.object({
            password: Yup.string()
              .required("Password is required")
              .min(6, "Password must be at least 6 characters"),
            confirmPassword: Yup.string()
              .oneOf([Yup.ref("password"), null], "Passwords must match")
              .required("Confirm password is required"),
          })}
          onSubmit={(values) => {
            setPassword(values.password);
            setUserInfo((prev) => ({ ...prev, ...values }));
            setStep(3);
          }}
        >
          {(formik) => (
            <Form style={{ maxWidth: "850px", margin: "0 auto" }}>
              <Lottie
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: step3Animation,
                }}
                height={100}
                width={100}
              />
              <h2>Create your password</h2>
              <Field
                style={fieldStyle}
                name="password"
                type="password"
                placeholder="Password"
              />
              <ErrorMessage
                name="password"
                component="div"
                style={errorStyle}
              />
              <Field
                style={fieldStyle}
                name="confirmPassword"
                type="password"
                placeholder="Re-enter Password"
              />
              <ErrorMessage
                name="confirmPassword"
                component="div"
                style={errorStyle}
              />
              <button type="submit" style={buttonStyles}>
                Next
              </button>
            </Form>
          )}
        </Formik>
      )}
      {step === 3 && (
        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            companyName: "",
            jobTitle: "",
            companyURL: "",
          }}
          validationSchema={Yup.object({
            firstName: Yup.string().required("First Name is required"),
            lastName: Yup.string().required("Last Name is required"),
            companyName: Yup.string().required("Company Name is required"),
            jobTitle: Yup.string(),
            companyURL: Yup.string(),
          })}
          onSubmit={async (values, { setSubmitting }) => {
            setLoading(true);
            try {
              await handleFinalUpload(values);
            } catch (error) {
              setSubmitting(false);
              setLoading(false);
              logSignupError(values.email);
              alert(
                "There was an error during the signup process. Please try again."
              );
            }
          }}
        >
          {(formik) => (
            <Form style={{ maxWidth: "850px", margin: "0 auto" }}>
              <Lottie
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: step1Animation,
                }}
                height={100}
                width={100}
              />
              <h2>Tell us about your company</h2>
              <label htmlFor="firstName">First Name * </label>
              <Field
                style={fieldStyle}
                name="firstName"
                type="text"
                placeholder="Enter first name"
              />
              <ErrorMessage
                name="firstName"
                component="div"
                style={errorStyle}
              />
              <label htmlFor="lasttName">Last Name * </label>
              <Field
                style={fieldStyle}
                name="lastName"
                type="text"
                placeholder="Enter last name"
              />
              <ErrorMessage
                name="lastName"
                component="div"
                style={errorStyle}
              />
              <label htmlFor="companyName">Company Name * </label>
              <Field
                style={fieldStyle}
                name="companyName"
                type="text"
                placeholder="Enter company name"
              />
              <ErrorMessage
                name="companyName"
                component="div"
                style={errorStyle}
              />
              <label htmlFor="jobTitle">Job Title * </label>
              <Field
                style={fieldStyle}
                name="jobTitle"
                type="text"
                placeholder="Enter job title"
              />
              <label htmlFor="companyURL">Company Website * </label>
              <Field
                style={fieldStyle}
                name="companyURL"
                type="text"
                placeholder="Enter company URL"
              />
              <button
                type="submit"
                style={buttonStyles}
                disabled={loading || formik.isSubmitting}
              >
                {loading ? (
                  <span>
                    <ClipLoader size={20} color={"#fff"} loading={true} />
                    {" Completing Signup..."}
                  </span>
                ) : (
                  "Complete Signup"
                )}
              </button>
              <br></br>
              {signupError && (
                <p style={{ color: "red", marginBottom: "10px" }}>
                  {signupError}
                </p>
              )}
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};

export default RecruiterSignupForm;
