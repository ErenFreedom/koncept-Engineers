import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const Step2 = ({ formData, setFormData, handleNext, step, totalSteps }) => {
  const handleFileUpload = (e) => {
    setFormData({ ...formData, uploadedDocuments: Array.from(e.target.files) });
  };

  return (
    <div className="form-container">
      <label className="form-label">
        Phone Number
        <PhoneInput
          country={"us"}
          value={formData.phoneNumber}
          onChange={(value) => setFormData({ ...formData, phoneNumber: value })}
          inputStyle={{
            width: "100%",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            backgroundColor: "#ffffff",
          }}
        />
      </label>
      <label className="form-label">
        Alternate Phone Number (Optional)
        <PhoneInput
          country={"us"}
          value={formData.altPhoneNumber}
          onChange={(value) => setFormData({ ...formData, altPhoneNumber: value })}
          inputStyle={{
            width: "100%",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            backgroundColor: "#ffffff",
          }}
        />
      </label>
      <label className="form-label">
        Email
        <input
          type="email"
          className="form-input"
          placeholder="Enter Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </label>
      <label className="form-label">
        Alternate Email (Optional)
        <input
          type="email"
          className="form-input"
          placeholder="Enter Alternate Email"
          value={formData.altEmail}
          onChange={(e) => setFormData({ ...formData, altEmail: e.target.value })}
        />
      </label>
      <label className="form-label">
        Upload Aadhar/Passport/PAN Card
        <input type="file" className="form-input" multiple onChange={handleFileUpload} />
      </label>
      {formData.uploadedDocuments.length > 0 && (
        <ul>
          {formData.uploadedDocuments.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
      )}

      <button className="next-button" onClick={handleNext}>
        Step {step} out of {totalSteps}
      </button>
    </div>
  );
};

export default Step2;
