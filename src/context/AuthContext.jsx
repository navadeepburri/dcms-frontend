import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("dcms_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (userData) => {
    localStorage.setItem("dcms_user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token); // ✅ save token separately
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("dcms_user");
    localStorage.removeItem("token"); // ✅ clear token on logout
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
