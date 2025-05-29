import React, { useState, useEffect } from "react";
import "./SubSiteModal.css";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const SubSiteModal = ({ onClose, parentCompanyId }) => {
  const { admin } = useAuth();
  const parentCompanyId = admin?.companyId;


  const [form, setForm] = useState({
    siteName: "",
    siteEmail: "",
    siteAltEmail: "",
    siteAddress1: "",
    siteAddress2: "",
    sitePincode: "",
    sitePanS3: "",
    siteGstS3: "",
    phone_number: "",
  });



  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(120);

  useEffect(() => {
    if (otpSent && timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [otpSent, timer]);

  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOtpChange = (index, value) => {
    if (!/\d?/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`subsite-otp-${index + 1}`).focus();
    }
  };

  const sendOtp = async () => {
    try {
      const { siteEmail, phone_number } = form;
      if (!siteEmail && !phone_number) {
        return toast.error("Enter site email or phone number");
      }

      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/subsite/send-otp`, {
        email: siteEmail,
        phone_number,
        otp_method: siteEmail ? "email" : "phone",
      });
      toast.success("OTP sent successfully");
      setOtpSent(true);
      setTimer(120);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    }
  };

  const registerSubSite = async () => {
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) {
      return toast.error("Enter valid 6-digit OTP");
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/subsite/register`, {
        ...form,
        parentCompanyId,
        otp: finalOtp,
      });
      toast.success("Sub-site registered ✅");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="subsite-modal-overlay">
      <div className="subsite-modal">
        <h2>Register New Sub-Site</h2>
        <div className="modal-fields">
          <input name="siteName" placeholder="Site Name" onChange={handleChange} />
          <input name="siteEmail" placeholder="Site Email" onChange={handleChange} />
          <input name="siteAltEmail" placeholder="Alt Email (Optional)" onChange={handleChange} />
          <input name="siteAddress1" placeholder="Address Line 1" onChange={handleChange} />
          <input name="siteAddress2" placeholder="Address Line 2 (Optional)" onChange={handleChange} />
          <input name="sitePincode" placeholder="Pincode" onChange={handleChange} />
          <input name="sitePanS3" placeholder="PAN URL (Optional)" onChange={handleChange} />
          <input name="siteGstS3" placeholder="GST URL (Optional)" onChange={handleChange} />
          <input name="phone_number" placeholder="Phone Number" onChange={handleChange} />
        </div>

        {!otpSent ? (
          <button className="subsite-btn" onClick={sendOtp}>Proceed to OTP</button>
        ) : (
          <>
            <div className="otp-input-container">
              {otp.map((val, i) => (
                <input
                  key={i}
                  maxLength={1}
                  className="otp-box"
                  id={`subsite-otp-${i}`}
                  value={val}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                />
              ))}
            </div>
            <button className="subsite-btn" onClick={registerSubSite}>Verify OTP & Register</button>
            <p className="timer-text">
              {timer > 0
                ? `Resend available in ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, "0")}`
                : "You can now resend OTP"}
            </p>
          </>
        )}

        <button className="close-btn" onClick={onClose}>✖</button>
      </div>
    </div>
  );
};

export default SubSiteModal;