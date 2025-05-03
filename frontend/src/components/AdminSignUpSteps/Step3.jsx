import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useFormData } from "../../context/FormDataContext"; 

const Step3 = ({ handleNext, step, totalSteps }) => {
  const { formData, setFormData } = useFormData(); 

  const handleFileUpload = (e, key) => {
    
    const fileNames = Array.from(e.target.files).map((file) => file.name);
    setFormData((prev) => ({
      ...prev,
      [key]: fileNames, 
    }));
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">Contact & Company Details</h2>

      
      <label className="form-label">
        Phone Number
        <PhoneInput
          country={"in"} 
          value={formData.phone_number} 
          onChange={(value) => {
            if (!value.startsWith("+")) {
              value = `+${value}`;
            }
            setFormData((prev) => ({ ...prev, phone_number: value }));
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

      
      <label className="form-label">
        Company/Organisation Name
        <input
          type="text"
          className="form-input"
          placeholder="Enter Company Name"
          value={formData.company_name} 
          onChange={(e) => setFormData((prev) => ({ ...prev, company_name: e.target.value }))}
          required
        />
      </label>

      
      <label className="form-label">
        Company Email
        <input
          type="email"
          className="form-input"
          placeholder="Enter Company Email"
          value={formData.company_email} 
          onChange={(e) => setFormData((prev) => ({ ...prev, company_email: e.target.value }))}
          required
        />
      </label>

      
      <label className="form-label">
        Upload Company's PAN Card
        <input type="file" className="form-input" multiple onChange={(e) => handleFileUpload(e, "companyPan")} />
      </label>
      {formData.companyPan?.length > 0 && (
        <ul>
          {formData.companyPan.map((file, index) => (
            <li key={index}>{file}</li>
          ))}
        </ul>
      )}

      
      <label className="form-label">
        Upload Company's GST
        <input type="file" className="form-input" multiple onChange={(e) => handleFileUpload(e, "companyGst")} />
      </label>
      {formData.companyGst?.length > 0 && (
        <ul>
          {formData.companyGst.map((file, index) => (
            <li key={index}>{file}</li>
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
