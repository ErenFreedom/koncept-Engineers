import React from "react";
import { useFormData } from "../../context/FormDataContext"; // ✅ Import useFormData for global state

const Step4 = ({ handleNext, step, totalSteps }) => {
  const { formData, setFormData } = useFormData(); // ✅ Use global context for form data

  return (
    <div className="form-container">
      <h2 className="form-heading">Company Address Details</h2>

      {/* ✅ Company Address 1 */}
      <label className="form-label">
        Company Address 1
        <input
          type="text"
          className="form-input"
          placeholder="Enter Company Address Line 1"
          value={formData.company_address1} // ✅ Fixed naming
          onChange={(e) => setFormData({ ...formData, company_address1: e.target.value })} // ✅ Fixed naming
        />
      </label>

      {/* ✅ Company Address 2 */}
      <label className="form-label">
        Company Address 2
        <input
          type="text"
          className="form-input"
          placeholder="Address Line 2"
          value={formData.company_address2} // ✅ Fixed naming
          onChange={(e) => setFormData({ ...formData, company_address2: e.target.value })} // ✅ Fixed naming
        />
      </label>

      {/* ✅ Pincode */}
      <label className="form-label">
        Pincode
        <input
          type="text"
          className="form-input"
          placeholder="Enter Pincode"
          value={formData.company_pincode} // ✅ Fixed naming
          onChange={(e) => setFormData({ ...formData, company_pincode: e.target.value })} // ✅ Fixed naming
        />
      </label>

      {/* ✅ Next Button */}
      <button className="next-button" onClick={handleNext}>
        Step {step} out of {totalSteps}
      </button>
    </div>
  );
};

export default Step4;
