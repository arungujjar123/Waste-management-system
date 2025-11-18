import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// 1️⃣ Context create kar rahe hain
const AuthContext = createContext();

// 2️⃣ Custom hook - isse kisi bhi component mein use kar sakte ho
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// 3️⃣ Provider component - Yeh poore app ko wrap karega
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // 4️⃣ States - user info aur loading state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 5️⃣ App load hote hi check karo - user logged in hai ya nahi
  useEffect(() => {
    checkAuth();
  }, []);

  // 6️⃣ LocalStorage se user info nikalo
  const checkAuth = () => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // Token expire ho gaya hai kya?
        if (decoded.exp && decoded.exp < currentTime) {
          console.warn("Token expired");
          logout();
        } else {
          setUser(JSON.parse(userData));
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  // 7️⃣ Login function - Login API call ke baad yeh call hoga
  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // 8️⃣ Logout function - User ko logout karne ke liye
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  // 9️⃣ Value object - Yeh sab cheezein poore app mein available hongi
  const value = {
    user, // Current logged-in user ka data
    loading, // Loading state
    login, // Login function
    logout, // Logout function
    isAuthenticated: !!user, // Boolean - logged in hai ya nahi
  };

  // 🔟 Provider return - Sabko wrap kar rahe hain
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
