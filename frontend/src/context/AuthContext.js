import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem("admin");
    return saved ? JSON.parse(saved) : null;
  });

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("accessToken") || null;
  });

  const login = (token, adminData) => {
    setAccessToken(token);
    setAdmin(adminData);
    localStorage.setItem("accessToken", token);
    localStorage.setItem("admin", JSON.stringify(adminData));
  };

  const logout = () => {
    setAccessToken(null);
    setAdmin(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("admin");
    axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/api/admin/auth/logout`,
      {},
      { withCredentials: true }
    );
  };

  useEffect(() => {
    const refreshToken = async () => {
      try {
        const res = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/admin/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        const { accessToken, admin } = res.data;
        setAccessToken(accessToken);
        setAdmin(admin);
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("admin", JSON.stringify(admin));
      } catch (err) {
        console.warn("🔒 Auto-login failed:", err.response?.data || err.message);
        logout(); 
      }
    };

    refreshToken();
  }, []);

  return (
    <AuthContext.Provider value={{ admin, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
