import React, { useState, useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import Lottie from "react-lottie";
import step1Animation from "./step-1.json";
import { UserContext } from "./UserContext";
import { auth, db, analytics } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { logEvent } from "firebase/analytics";
import { ClipLoader } from "react-spinners";

const buttonStyles = {
  borderRadius: "8px",
  backgroundColor: "#00BF63",
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
  fontWeight: "bold", // Added bold font weight for error messages
};

const RecruiterSignupForm = ({ candidateEmail }) => {
  const navigate = useNavigate();
  const { setUserInfo } = useContext(UserContext);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (values) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;
      if (user) {
        const functions = getFunctions();
        const setRecruiterClaims = httpsCallable(
          functions,
          "setRecruiterClaims"
        );
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

        // Optionally send email to candidate
        if (candidateEmail) {
          const mailto = `mailto:${candidateEmail}?subject=You've Been Drafted!&body=Hi,%0D%0A%0D%0AWe have connected with you via Drafted. Looking forward to connecting further!%0D%0A%0D%0ABest regards,%0D%0A%0D%0A[Your Name]`;
          window.location.href = mailto;
        }

        navigate("/viewer");
      } else {
        throw new Error("User creation failed");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert(
        "There was an error completing the signup process. Please try again."
      );
      setLoading(false);
    }
  };

  const logAttemptSignup = (email) => {
    logEvent(analytics, "attempted_recruiter_signup", { email });
  };

  const logSignupError = (email) => {
    logEvent(analytics, "recruiter_signup_error", { email });
  };

  return (
    <div>
      <Formik
        initialValues={{
          email: "",
          password: "",
          confirmPassword: "",
          firstName: "",
          lastName: "",
          companyName: "",
          jobTitle: "",
          companyURL: "",
        }}
        validationSchema={Yup.object({
          email: Yup.string()
            .email("Invalid email address")
            .required("Company Email is required"),
          password: Yup.string()
            .required("Password is required")
            .min(6, "Password must be at least 6 characters"),
          confirmPassword: Yup.string()
            .oneOf([Yup.ref("password"), null], "Passwords must match")
            .required("Confirm password is required"),
          firstName: Yup.string().required("First Name is required"),
          lastName: Yup.string().required("Last Name is required"),
          companyName: Yup.string().required("Company Name is required"),
          jobTitle: Yup.string(),
          companyURL: Yup.string(),
        })}
        onSubmit={(values) => {
          setUserInfo({ email: values.email });
          logAttemptSignup(values.email);
          handleSignup(values);
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
            <h2>Join Drafted and connect with this candidate today</h2>
            <label htmlFor="email"><strong>Email *</strong></label>
            <Field
              style={fieldStyle}
              name="email"
              type="email"
              placeholder="Company Email"
            />
            <ErrorMessage name="email" component="div" style={errorStyle} />

            <label htmlFor="password"><strong>Password *</strong></label>
            <Field
              style={fieldStyle}
              name="password"
              type="password"
              placeholder="Password"
            />
            <ErrorMessage name="password" component="div" style={errorStyle} />

            <label htmlFor="confirmPassword"><strong>Confirm Password *</strong></label>
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

            <label htmlFor="firstName"><strong>First Name *</strong></label>
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

            <label htmlFor="lastName"><strong>Last Name *</strong></label>
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

            <label htmlFor="companyName"><strong>Company Name *</strong></label>
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

            <label htmlFor="jobTitle"><strong>Job Title</strong></label>
            <Field
              style={fieldStyle}
              name="jobTitle"
              type="text"
              placeholder="Enter job title"
            />

            <label htmlFor="companyURL"><strong>Company Website</strong></label>
            <Field
              style={fieldStyle}
              name="companyURL"
              type="text"
              placeholder="Enter company URL"
            />

            <button type="submit" style={buttonStyles} disabled={loading}>
              {loading ? (
                <span>
                  <ClipLoader size={20} color={"#fff"} loading={true} />
                  {" Completing Signup..."}
                </span>
              ) : (
                "Join and Connect"
              )}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default RecruiterSignupForm;
