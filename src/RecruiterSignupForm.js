import React, { useState, useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import Lottie from "react-lottie";
import step1Animation from "./step-1.json";
import step3Animation from "./step-3.json";
import step5Animation from "./step-5.json";
import { UserContext } from "./UserContext";
import { auth, db } from "./firebase";
import ReactGA4 from "react-ga4";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

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

  const handleTextUpload = async (values) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      if (user) {
        const formData = {
          firstName: values.firstName,
          lastName: values.lastName,
          companyName: values.companyName,
          jobTitle: values.jobTitle,
          companyURL: values.companyURL,
        };
        const userDataRef = doc(db, "recruiter-accounts", user.email);
        await setDoc(userDataRef, formData);
        navigate("/dashboard"); // Navigate to the dashboard or any other route
      }
    } catch (error) {
      console.error("Error uploading recruiter data:", error);
    }
  };

  const recruiterSteps = {
    1: (
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={Yup.object({
          email: Yup.string().email("Invalid email address").required("Email is required"),
          password: Yup.string().required("Password is required"),
        })}
        onSubmit={(values) => {
          setUserInfo(values);
          setStep(3); // Directly jump to Step 3
          ReactGA4.event({
            category: "Recruiter Form",
            action: "Provided Email",
            label: values.email,
          });
        }}
      >
        {formik => (
          <Form>
            <Lottie options={{ loop: true, autoplay: true, animationData: step1Animation }} height={100} width={100} />
            <h2>Let's find your next hire</h2>
            <h3>Join Drafted's community of recruiters</h3>
            <p>The best place to find your next best candidate, and build teams lightning fast.</p>
            <Field style={fieldStyle} name="email" type="email" />
            <ErrorMessage name="email" component="div" style={errorStyle} />
            <Field style={fieldStyle} name="password" type="password" />
            <ErrorMessage name="password" component="div" style={errorStyle} />
            <button type="submit" style={buttonStyles}>Find your next hire</button>
          </Form>
        )}
      </Formik>
    ),
    3: (
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
        })}
        onSubmit={(values) => {
          handleTextUpload(values);
          setStep(5);
        }}
      >
        {formik => (
          <Form>
            <Lottie options={{ loop: true, autoplay: true, animationData: step3Animation }} height={100} width={100} />
            <h2>Tell us about your company</h2>
            <Field style={fieldStyle} name="firstName" type="text" placeholder="First Name" />
            <ErrorMessage name="firstName" component="div" style={errorStyle} />
            <Field style={fieldStyle} name="lastName" type="text" placeholder="Last Name" />
            <ErrorMessage name="lastName" component="div" style={errorStyle} />
            <Field style={fieldStyle} name="companyName" type="text" placeholder="Company Name" />
            <ErrorMessage name="companyName" component="div" style={errorStyle} />
            <Field style={fieldStyle} name="jobTitle" type="text" placeholder="Job Title" />
            <Field style={fieldStyle} name="companyURL" type="text" placeholder="Company URL" />
            <button type="submit" style={buttonStyles}>Continue</button>
          </Form>
        )}
      </Formik>
    ),
    5: (
      <Formik
        initialValues={{}}
        onSubmit={() => {
          setStep(1); // Loop back to step 1 or finalize the signup process
        }}
      >
        {formik => (
          <Form>
            <Lottie options={{ loop: true, autoplay: true, animationData: step5Animation }} height={100} width={100} />
            <h2>Let's search candidates</h2>
            <p>You can filter by school, major, and grad year to find your next best hire. Drafted streamlines hiring to build your team fast. Like. Lightning fast.</p>
            <button type="submit" style={buttonStyles}>Start Searching</button>
          </Form>
        )}
      </Formik>
    ),
  };

  return (
    <div>
      <h1>Recruiter Signup</h1>
      {recruiterSteps[step]}
    </div>
  );
};

export default RecruiterSignupForm;
