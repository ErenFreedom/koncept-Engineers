import React, { createContext, useContext, useState, useEffect } from "react";

// Create the context
const FormDataContext = createContext();

// Custom Hook to use the context
export const useFormData = () => useContext(FormDataContext);

// Provider Component
export const FormDataProvider = ({ children }) => {
  const [formData, setFormData] = useState(() => {
    // ✅ Load stored form data if available
    const storedData = localStorage.getItem("formData");
    return storedData ? JSON.parse(storedData) : {
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
      alt_email: "",
      company_name: "",
      company_email: "",
      company_alt_email: "",
      company_address1: "",
      company_address2: "",
      company_pincode: "",
      otp: "",
      aadhar: null,
      pan: null,
      gst: null,
    };
  });

  // ✅ Store form data in `localStorage` on every update
  useEffect(() => {
    localStorage.setItem("formData", JSON.stringify(formData));
  }, [formData]);

  return (
    <FormDataContext.Provider value={{ formData, setFormData }}>
      {children}
    </FormDataContext.Provider>
  );
};
