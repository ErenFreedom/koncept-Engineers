import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useFormData } from "../../context/FormDataContext";
import AuthHeader from "../../components/AuthPage/AuthHeader";
import "react-toastify/dist/ReactToastify.css";
import "./Otp.css";

const AdminOtp = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(120);
  const navigate = useNavigate();
  const { formData } = useFormData();

  // ✅ Ensure formData is fully loaded before running validation
  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      if (!formData.email || !formData.phone_number) {
        toast.error("Invalid session! Please restart registration.");
        navigate("/Admin");
      }
    }
  }, [formData, navigate]);

  // ✅ OTP Countdown Timer
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  // ✅ Handle OTP Input
  const handleInputChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  // ✅ Handle OTP Resend
  const resendOtp = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/admin/send-otp`, {
        email: formData.email,
        phone_number: formData.phone_number,
      });

      toast.success("OTP Resent Successfully!");
      setTimer(120);
    } catch (error) {
      toast.error("Failed to resend OTP. Try again.");
    }
  };

  // ✅ Register Admin After OTP Verification
  const registerAdmin = async (req, res) => {
    let connection;
    try {
        const {
            first_name, middle_name, last_name, date_of_birth, nationality,
            address1, address2, pincode, phone_number, landline, password,
            email, company_name, company_address1, company_address2, company_pincode, otp
        } = req.body;

        console.log("📌 Incoming Data:", req.body); // ✅ Debug Incoming Data

        // ✅ Check for missing required fields
        if (!first_name || !last_name || !date_of_birth || !phone_number || !password || !email || !company_name || !company_address1 || !company_pincode) {
            return res.status(400).json({ message: "Missing required fields!" });
        }

        // ✅ Verify OTP First
        const otpQuery = `
            SELECT * FROM RegisterOtp 
            WHERE (email = ? OR phone_number = ?) 
            AND otp = ? 
            AND expires_at > UTC_TIMESTAMP();
        `;
        const [otpResults] = await db.execute(otpQuery, [email, phone_number, otp]);

        if (otpResults.length === 0) {
            console.error("❌ Invalid or expired OTP for", email, phone_number);
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // ✅ Proceed with registration if OTP is correct
        connection = await db.getConnection();
        await connection.beginTransaction();

        // ✅ Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Insert Company Details FIRST to get `company_id`
        const insertCompanyQuery = `
            INSERT INTO Company (name, address1, address2, pincode) 
            VALUES (?, ?, ?, ?);
        `;
        const [companyResult] = await connection.execute(insertCompanyQuery, [
            company_name, company_address1, company_address2 || null, company_pincode
        ]);

        const companyId = companyResult.insertId; // ✅ Fetch new Company ID

        // ✅ Insert Admin Details
        const insertAdminQuery = `
            INSERT INTO Admin (first_name, middle_name, last_name, date_of_birth, nationality, 
                              address1, address2, pincode, phone_number, landline, email, password_hash, company_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        await connection.execute(insertAdminQuery, [
            first_name, middle_name || null, last_name, date_of_birth, nationality || null,
            address1 || null, address2 || null, pincode || null, phone_number, landline || null, 
            email, hashedPassword, companyId
        ]);

        // ✅ Delete OTP after successful registration
        await db.execute(`DELETE FROM RegisterOtp WHERE email = ? OR phone_number = ?`, [email, phone_number]);

        await connection.commit();
        console.log(`✅ Admin & Company registered successfully.`);

        res.status(201).json({ message: "Admin and Company registered successfully" });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("❌ Error registering admin:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    } finally {
        if (connection) await connection.release();
    }
};


  return (
    <div>
      <AuthHeader />
      <div className="otp-body">
        <h1 className="otp-heading">Admin OTP Verification</h1>
        <p className="otp-instructions">Enter the OTP sent to your email/phone.</p>

        <div className="otp-input-container">
          {otp.map((value, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              className="otp-box"
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
              id={`otp-input-${index}`}
            />
          ))}
        </div>

        <button className="otp-button" onClick={registerAdmin}>Verify OTP & Register ✅</button>

        <p className="resend-otp">
          {timer > 0 ? (
            `Resend OTP in ${Math.floor(timer / 60)}:${timer % 60 < 10 ? "0" : ""}${timer % 60}`
          ) : (
            <button className="resend-button" onClick={resendOtp}>
              Resend OTP 🔄
            </button>
          )}
        </p>
      </div>
    </div>
  );
};

export default AdminOtp;
