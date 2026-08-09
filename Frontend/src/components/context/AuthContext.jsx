import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading,setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/user/profile");
      console.log("Profile fetched successfully:", response.data);

      setUser(response.data.user);
    } catch (error) {
      if(error.response?.status !== 401){

        console.error("Error fetching profile:", error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const response = await api.post("/auth/logout");

      setUser(null);

      return response.data;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        fetchProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
