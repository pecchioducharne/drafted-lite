import React, { useState, useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import Lottie from "react-lottie";
import step1Animation from "./step-1.json";
import step2Animation from "./step-2.json"; // Placeholder for the password animation step
import step3Animation from "./step-3.json";
import { UserContext } from "./UserContext";
import { auth, db } from "./firebase";
import ReactGA4 from "react-ga4";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "./RecruiterSignupForm.css";
import { getFunctions, httpsCallable } from "firebase/functions";

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

const RecruiterSignupForm = () => {
  const navigate = useNavigate();
  const { setUserInfo } = useContext(UserContext);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(''); // Global email state
  const [password, setPassword] = useState(''); // Global password state

  const handleFinalUpload = async (values) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (user) {
        // Call the cloud function to set recruiter claims
        const functions = getFunctions();
        const setRecruiterClaims = httpsCallable(functions, 'setRecruiterClaims');
        await setRecruiterClaims({ userId: user.uid });
  
        const formData = {
          firstName: values.firstName,
          lastName: values.lastName,
          companyName: values.companyName,
          jobTitle: values.jobTitle,
          companyURL: values.companyURL,
        };
        const userDataRef = doc(db, "recruiter-accounts", user.email);
        await setDoc(userDataRef, formData);
        navigate("/viewer"); // Navigate to the dashboard or any other route
      }
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  };

  const navigateToSignup = async () => {
    navigate("/signup");
  };

  return (
    <div>
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
            setStep(2);
          }}
        >
          {(formik) => (
            <Form>
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
            setPassword(values.password)
            setUserInfo((prev) => ({ ...prev, ...values }));
            setStep(3);
          }}
        >
          {(formik) => (
            <Form>
              <Lottie
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: step2Animation,
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
          onSubmit={handleFinalUpload}
        >
          {(formik) => (
            <Form>
              <Lottie
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: step2Animation,
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
              <button type="submit" style={buttonStyles}>
                Complete Signup
              </button>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};

export default RecruiterSignupForm;
