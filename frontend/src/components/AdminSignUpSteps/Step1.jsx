import React, { useEffect } from "react";
import { useFormData } from "../../context/FormDataContext"; // ✅ Import global state

const Step1 = ({ handleNext, step, totalSteps }) => {
  const { formData, setFormData } = useFormData(); // ✅ Use global state

  // ✅ Ensure formData persists between steps
  useEffect(() => {
    // Check if formData already exists, if not, set it to a valid object
    setFormData((prevData) => ({
      ...prevData,
      first_name: prevData.first_name || "",
      middle_name: prevData.middle_name || "",
      last_name: prevData.last_name || "",
      date_of_birth: prevData.date_of_birth || "",
    }));
  }, [setFormData]);

  return (
    <div className="form-container">
      <h2 className="form-heading">Personal Information</h2>

      {/* ✅ First Name Field */}
      <label className="form-label">
        First Name
        <input
          type="text"
          className="form-input"
          placeholder="Enter First Name"
          value={formData.first_name}
          onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
          required
        />
      </label>

      {/* ✅ Middle Name Field (Optional) */}
      <label className="form-label">
        Middle Name (optional)
        <input
          type="text"
          className="form-input"
          placeholder="Enter Middle Name"
          value={formData.middle_name}
          onChange={(e) => setFormData((prev) => ({ ...prev, middle_name: e.target.value }))}
        />
      </label>

      {/* ✅ Last Name Field */}
      <label className="form-label">
        Last Name
        <input
          type="text"
          className="form-input"
          placeholder="Enter Last Name"
          value={formData.last_name}
          onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
          required
        />
      </label>

      {/* ✅ Date of Birth Field */}
      <label className="form-label">
        Date of Birth
        <input
          type="date"
          className="form-input"
          value={formData.date_of_birth}
          onChange={(e) => setFormData((prev) => ({ ...prev, date_of_birth: e.target.value }))}
          required
        />
      </label>

      {/* ✅ Next Button */}
      <button className="next-button" onClick={handleNext}>
        Step {step} out of {totalSteps}
      </button>
    </div>
  );
};

export default Step1;
