import { createContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@/types/auth.types";
import api from "@/api/api";

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
  loading: boolean;
}

export const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      }
      catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, [])


  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.log("Logout error: ", err);
    } finally {
      setUser(null);
    }
  };
  return (
    <UserContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};
