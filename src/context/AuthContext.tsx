import { createContext, useContext, useState } from "react";
import axios from "axios";
import api from "../api/axiosInstance";

interface User {
  registerNo: string;
  role: string;
  isFirstLogin: boolean;
}

interface Profile {
  userId: string;
  name: string;
  gender: string;
  department: string;
  year: number;
  dob: string | null;
  contacts: string[];
  fathersName: string | null;
  address: string | null;
  mailId: string;
  hostel: string | null;
  id: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  login: (reg_no: string, password: string) => Promise<any>;
  logout: () => void;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  login: (registerNo: string, password: string) => Promise<any>;
  logout: () => void;
  changePassword: (
    reg_no: string,
    oldPassword: string,
    newPassword: string
  ) => Promise<{ error: boolean; message: string }>; 
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(
    JSON.parse(localStorage.getItem("hmms_user") || "null")
  );
  const [profile, setProfile] = useState<Profile | null>(
    JSON.parse(localStorage.getItem("hmms_profile") || "null")
  );
  const [loading, setLoading] = useState<boolean>(false);

  const login = async (reg_no: string, password: string) => {
    try {
      setLoading(true);
      const res = await api.post("/auth/login", { reg_no, password });
  
      if (!res.data.error) {
        const userData: User = res.data.data.user;
        const profileData: Profile = res.data.data.profile;
  
        setUser(userData);
        setProfile(profileData);
  
        localStorage.setItem("hmms_user", JSON.stringify(userData));
        localStorage.setItem("hmms_profile", JSON.stringify(profileData));
  
        return { error: false, user: userData }; 
      }
  
      return { error: true, message: res.data.message };
    } catch (err) {
      console.error("Login error:", err);
      return { error: true, message: "Something went wrong" };
    } finally {
      setLoading(false);
    }
  };
  
  
  

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem("hmms_user");
    localStorage.removeItem("hmms_profile");
  };

  const changePassword = async (reg_no: string, oldPassword: string, newPassword: string) => {
    try {
      setLoading(true);
    
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/change-password`,
        { reg_no, oldPassword, newPassword },
        {withCredentials:true}
      );
  
      if (!res.data.error) {
        // Mark first login as false after successful password change
        if (user) {
          const updatedUser = { ...user, isFirstLogin: false };
          setUser(updatedUser);
          localStorage.setItem("hmms_user", JSON.stringify(updatedUser));
        }
      }
  
      return res.data;
    } catch (err) {
      console.error("Change password error:", err);
      return { error: true, message: "Something went wrong" };
    } finally {
      setLoading(false);
    }
  };
  

  return (
    
    <AuthContext.Provider value={{ user, profile, loading, login, logout ,changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};


