import React, { useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useFormData } from "../../context/FormDataContext"; // ✅ Import global state

const Step3 = ({ handleNext, step, totalSteps }) => {
  const { formData, setFormData } = useFormData(); // ✅ Use global context for form data

  const handleFileUpload = (e, key) => {
    setFormData((prev) => ({
      ...prev,
      [key]: Array.from(e.target.files),
    }));
  };

  // ✅ Ensure formData persists between steps
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      phone_number: prevData.phone_number || "",
      landline: prevData.landline || "",
      company_name: prevData.company_name || "", // ✅ Fixed to match backend
      companyPan: prevData.companyPan || null,
      companyGst: prevData.companyGst || null,
    }));
  }, [setFormData]);

  return (
    <div className="form-container">
      <h2 className="form-heading">Contact & Company Details</h2>

      {/* ✅ Phone Number Field */}
      <label className="form-label">
        Phone Number
        <PhoneInput
          country={"in"} // Default country set to India
          value={formData.phone_number} // ✅ Use `phone_number` (same as backend expects)
          onChange={(value) => {
            if (!value.startsWith("+")) {
              value = `+${value}`;
            }
            setFormData((prev) => ({ ...prev, phone_number: value })); // ✅ Use `phone_number` instead of `phoneNumber`
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
          onChange={(e) => setFormData((prev) => ({ ...prev, landline: e.target.value }))}
        />
      </label>

      {/* ✅ Company Name */}
      <label className="form-label">
        Company/Organisation Name
        <input
          type="text"
          className="form-input"
          placeholder="Enter Company Name"
          value={formData.company_name} // ✅ Use `company_name` instead of `companyName`
          onChange={(e) => setFormData((prev) => ({ ...prev, company_name: e.target.value }))}
          required
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
