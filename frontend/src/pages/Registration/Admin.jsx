import React, { useState } from "react";
import SignUpHeader from "../../components/SignUpPage/SignUpHeader";
import Step1 from "../../components/AdminSignUpSteps/Step1";
import Step2 from "../../components/AdminSignUpSteps/Step2";
import Step3 from "../../components/AdminSignUpSteps/Step3";
import Step4 from "../../components/AdminSignUpSteps/Step4";
import Step5 from "../../components/AdminSignUpSteps/Step5";
import "./Admin.css";

const Admin = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    nationality: null,
    address1: "",
    address2: "",
    pincode: "",
    aadharPanPassport: [],
    phoneNumber: "",
    landline: "",
    companyName: "",
    companyPan: [],
    companyGst: [],
    companyAddress1: "",
    companyAddress2: "",
    companyPincode: "",
    password: "",
    retypePassword: "",
  });

  return (
    <div className="admin-signup-container">
      <SignUpHeader />
      <div className="admin-signup-body">
        {step === 1 && <Step1 formData={formData} setFormData={setFormData} handleNext={() => setStep(2)} step={step} totalSteps={totalSteps} />}
        {step === 2 && <Step2 formData={formData} setFormData={setFormData} handleNext={() => setStep(3)} step={step} totalSteps={totalSteps} />}
        {step === 3 && <Step3 formData={formData} setFormData={setFormData} handleNext={() => setStep(4)} step={step} totalSteps={totalSteps} />}
        {step === 4 && <Step4 formData={formData} setFormData={setFormData} handleNext={() => setStep(5)} step={step} totalSteps={totalSteps} />}
        {step === 5 && <Step5 formData={formData} setFormData={setFormData} step={step} totalSteps={totalSteps} />}
      </div>
    </div>
  );
};

export default Admin;
