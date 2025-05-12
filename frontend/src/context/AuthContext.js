import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const login = (token, adminData) => {
    setAccessToken(token);
    setAdmin(adminData);
  };

  const logout = () => {
    setAccessToken(null);
    setAdmin(null);
    axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/admin/auth/logout`, {}, { withCredentials: true });
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
      } catch (err) {
        console.warn("🔒 Auto-login failed:", err.response?.data || err.message);
        setAccessToken(null);
        setAdmin(null);
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
