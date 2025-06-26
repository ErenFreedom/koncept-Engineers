import React, { useState, useEffect } from "react";
import "./FormStyles.css";

// In real use, fetch this from Redux state or props
const dummyData = {
  first_name: "John",
  middle_name: "M.",
  last_name: "Doe",
  date_of_birth: "1995-05-20",
  nationality: "Indian",
  address1: "123 Street Name",
  address2: "Near Something",
  pincode: "201310",
  phone_number: "+91-9876543210",
  landline: "0120-123456",
  email: "admin@example.com",
  company_name: "Galgotias",
  company_email: "info@galgotias.com",
  company_alt_email: "contact@galgotias.com",
  company_address1: "GCET Campus",
  company_address2: "Greater Noida",
  company_pincode: "201310",
  aadhar: "aadhar-url.pdf",
  pan: "pan-url.pdf",
  gst: "gst-url.pdf"
};

const MainSiteInfoForm = () => {
  const [data, setData] = useState(dummyData); // Replace dummyData with actual data source

  return (
    <form className="form-container">
      <h3>Admin Details</h3>
      <input value={data.first_name} disabled placeholder="First Name" />
      <input value={data.middle_name} disabled placeholder="Middle Name" />
      <input value={data.last_name} disabled placeholder="Last Name" />
      <input value={data.date_of_birth} disabled placeholder="Date of Birth" type="date" />
      <input value={data.nationality} disabled placeholder="Nationality" />
      <input value={data.address1} disabled placeholder="Address Line 1" />
      <input value={data.address2} disabled placeholder="Address Line 2" />
      <input value={data.pincode} disabled placeholder="Pincode" />
      <input value={data.phone_number} disabled placeholder="Phone Number" />
      <input value={data.landline} disabled placeholder="Landline" />
      <input value={data.email} disabled placeholder="Email" />

      <h3>Company Details</h3>
      <input value={data.company_name} disabled placeholder="Company Name" />
      <input value={data.company_email} disabled placeholder="Company Email" />
      <input value={data.company_alt_email} disabled placeholder="Alternate Email" />
      <input value={data.company_address1} disabled placeholder="Address Line 1" />
      <input value={data.company_address2} disabled placeholder="Address Line 2" />
      <input value={data.company_pincode} disabled placeholder="Pincode" />

      <h3>Documents</h3>
      <input value={data.aadhar} disabled placeholder="Aadhar URL" />
      <input value={data.pan} disabled placeholder="PAN URL" />
      <input value={data.gst} disabled placeholder="GST URL" />

      {/* Optional Edit Button Later */}
      {/* <button type="button">Edit Info</button> */}
    </form>
  );
};

export default MainSiteInfoForm;
