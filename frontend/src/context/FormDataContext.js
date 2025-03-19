import React, { createContext, useContext, useState } from "react";

// Create the context
const FormDataContext = createContext();

// Custom Hook to use the context
export const useFormData = () => useContext(FormDataContext);

// Provider Component
export const FormDataProvider = ({ children }) => {
  const [formData, setFormData] = useState({
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
  });

  return (
    <FormDataContext.Provider value={{ formData, setFormData }}>
      {children}
    </FormDataContext.Provider>
  );
};
