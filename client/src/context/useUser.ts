import { useContext } from "react";
import { UserContext } from "./UserProvider";

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }
  
  return context;
}
