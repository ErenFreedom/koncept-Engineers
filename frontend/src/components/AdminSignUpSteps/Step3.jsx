import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useFormData } from "../../context/FormDataContext"; // ✅ Import useFormData for global state

const Step3 = ({ handleNext, step, totalSteps }) => {
  const { formData, setFormData } = useFormData(); // ✅ Use global context for form data

  const handleFileUpload = (e, key) => {
    setFormData({ ...formData, [key]: Array.from(e.target.files) });
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">Contact & Company Details</h2>

      {/* ✅ Phone Number Field */}
      <label className="form-label">
        Phone Number
        <PhoneInput
          country={"in"} // Default country set to India
          value={formData.phoneNumber}
          onChange={(value) => {
            // Ensure number starts with `+`
            if (!value.startsWith("+")) {
              value = `+${value}`;
            }
            setFormData({ ...formData, phoneNumber: value });
          }}
          inputStyle={{
            width: "100%",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            backgroundColor: "#ffffff",
          }}
        />
      </label>

      {/* ✅ Landline Field */}
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

      {/* ✅ Company Name */}
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

      {/* ✅ Upload PAN */}
      <label className="form-label">
        Upload Company's PAN Card
        <input type="file" className="form-input" multiple onChange={(e) => handleFileUpload(e, "companyPan")} />
      </label>
      {formData.companyPan?.length > 0 && (
        <ul>
          {formData.companyPan.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
      )}

      {/* ✅ Upload GST */}
      <label className="form-label">
        Upload Company's GST
        <input type="file" className="form-input" multiple onChange={(e) => handleFileUpload(e, "companyGst")} />
      </label>
      {formData.companyGst?.length > 0 && (
        <ul>
          {formData.companyGst.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
      )}

      {/* ✅ Next Button */}
      <button className="next-button" onClick={handleNext}>
        Step {step} out of {totalSteps}
      </button>
    </div>
  );
};

export default Step3;
