import React from "react";
import { useFormData } from "../../context/FormDataContext"; // ✅ Import global state

const Step1 = ({ handleNext, step, totalSteps }) => {
  const { formData, setFormData } = useFormData(); // ✅ Use global state

  return (
    <div className="form-container">
      <h2 className="form-heading">Personal Information</h2>

      {/* ✅ First Name */}
      <label className="form-label">
        First Name
        <input
          type="text"
          className="form-input"
          placeholder="Enter First Name"
          value={formData.first_name}
          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          required
        />
      </label>

      {/* ✅ Middle Name (Optional) */}
      <label className="form-label">
        Middle Name (optional)
        <input
          type="text"
          className="form-input"
          placeholder="Enter Middle Name"
          value={formData.middle_name}
          onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
        />
      </label>

      {/* ✅ Last Name */}
      <label className="form-label">
        Last Name
        <input
          type="text"
          className="form-input"
          placeholder="Enter Last Name"
          value={formData.last_name}
          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          required
        />
      </label>

      {/* ✅ Date of Birth */}
      <label className="form-label">
        Date of Birth
        <input
          type="date"
          className="form-input"
          value={formData.date_of_birth}
          onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
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
