import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const Step3 = ({ formData, setFormData, handleNext, step, totalSteps }) => {
  const handleFileUpload = (e, key) => {
    setFormData({ ...formData, [key]: Array.from(e.target.files) });
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
        Landline (Optional)
        <input
          type="text"
          className="form-input"
          placeholder="Enter Landline Number"
          value={formData.landline}
          onChange={(e) => setFormData({ ...formData, landline: e.target.value })}
        />
      </label>
      <label className="form-label">
        Company/Organisation Name
        <input
          type="text"
          className="form-input"
          placeholder="Enter Company Name"
          value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
        />
      </label>
      <label className="form-label">
        Upload Company's PAN Card
        <input type="file" className="form-input" multiple onChange={(e) => handleFileUpload(e, "companyPan")} />
      </label>
      {formData.companyPan.length > 0 && (
        <ul>
          {formData.companyPan.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
      )}
      <label className="form-label">
        Upload Company's GST
        <input type="file" className="form-input" multiple onChange={(e) => handleFileUpload(e, "companyGst")} />
      </label>
      {formData.companyGst.length > 0 && (
        <ul>
          {formData.companyGst.map((file, index) => (
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

export default Step3;
