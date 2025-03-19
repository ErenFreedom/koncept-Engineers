import React, { useEffect } from "react";
import { useFormData } from "../../context/FormDataContext"; // ✅ Import global context

const Step4 = ({ handleNext, step, totalSteps }) => {
  const { formData, setFormData } = useFormData(); // ✅ Use global state

  // ✅ Ensure formData persists when navigating back & forth
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      company_address1: prevData.company_address1 || "",
      company_address2: prevData.company_address2 || "",
      company_pincode: prevData.company_pincode || "",
    }));

    console.log("🔍 Step 4 FormData (Loaded from LocalStorage):", formData); // ✅ Debugging
  }, [setFormData]);

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
          value={formData.company_address1} // ✅ Matches backend field
          onChange={(e) => setFormData((prev) => ({ ...prev, company_address1: e.target.value }))}
        />
      </label>

      {/* ✅ Company Address 2 */}
      <label className="form-label">
        Company Address 2
        <input
          type="text"
          className="form-input"
          placeholder="Address Line 2"
          value={formData.company_address2} // ✅ Matches backend field
          onChange={(e) => setFormData((prev) => ({ ...prev, company_address2: e.target.value }))}
        />
      </label>

      {/* ✅ Pincode */}
      <label className="form-label">
        Pincode
        <input
          type="text"
          className="form-input"
          placeholder="Enter Pincode"
          value={formData.company_pincode} // ✅ Matches backend field
          onChange={(e) => setFormData((prev) => ({ ...prev, company_pincode: e.target.value }))}
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
