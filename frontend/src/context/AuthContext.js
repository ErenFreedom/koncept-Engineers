import React, { createContext, useContext, useState } from "react";

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
  };

  return (
    <AuthContext.Provider value={{ admin, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
