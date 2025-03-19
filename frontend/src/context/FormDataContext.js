import React, { createContext, useContext, useState, useEffect } from "react";

// Create the context
const FormDataContext = createContext();

// Custom Hook to use the context
export const useFormData = () => useContext(FormDataContext);

// Provider Component
export const FormDataProvider = ({ children }) => {
  // ✅ Load saved data from LocalStorage safely
  const savedData = localStorage.getItem("formData");
  const initialData = savedData ? JSON.parse(savedData) : {
    first_name: "",
    middle_name: "",
    last_name: "",
    date_of_birth: "",
    nationality: "",
    address1: "",
    address2: "",
    pincode: "",
    phone_number: "",
    landline: "",
    password: "",
    email: "",
    company_name: "",
    company_email: "",
    company_address1: "",
    company_address2: "",
    company_pincode: "",
    otp: "",
    aadhar: null,
    pan: null,
    gst: null,
  };

  const [formData, setFormData] = useState(initialData);

  // ✅ Save to LocalStorage whenever formData changes
  useEffect(() => {
    if (formData) {
      localStorage.setItem("formData", JSON.stringify(formData));
    }
  }, [formData]);

  return (
    <FormDataContext.Provider value={{ formData, setFormData }}>
      {children}
    </FormDataContext.Provider>
  );
};
