import React, { useState } from "react";
import SignUpHeader from "../../components/SignUpPage/SignUpHeader";
import Step1 from "../../components/StaffSignUpSteps/Step1";
import Step2 from "../../components/StaffSignUpSteps/Step2";
import Step3 from "../../components/StaffSignUpSteps/Step3";
import Step4 from "../../components/StaffSignUpSteps/Step4";
import Step5 from "../../components/StaffSignUpSteps/Step5";
import "./Staff.css";

const Staff = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    nationality: null,
    phoneNumber: "",
    altPhoneNumber: "",
    email: "",
    altEmail: "",
    uploadedDocuments: [],
    companyName: "",
    position: "",
    yearsWorking: "",
    address1: "",
    address2: "",
    pincode: "",
    password: "",
    retypePassword: "",
  });

  return (
    <div>
      <SignUpHeader />
      {step === 1 && <Step1 formData={formData} setFormData={setFormData} handleNext={() => setStep(2)} step={step} totalSteps={totalSteps} />}
      {step === 2 && <Step2 formData={formData} setFormData={setFormData} handleNext={() => setStep(3)} step={step} totalSteps={totalSteps} />}
      {step === 3 && <Step3 formData={formData} setFormData={setFormData} handleNext={() => setStep(4)} step={step} totalSteps={totalSteps} />}
      {step === 4 && <Step4 formData={formData} setFormData={setFormData} handleNext={() => setStep(5)} step={step} totalSteps={totalSteps} />}
      {step === 5 && <Step5 formData={formData} setFormData={setFormData} step={step} totalSteps={totalSteps} />}
    </div>
  );
};

export default Staff;
