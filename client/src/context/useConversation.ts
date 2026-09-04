import { useContext } from "react";
import {ConversationContext} from "./ConversationProvider.tsx";

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error("useConversation must be used inside UserProvider");
  }
  
  return context;
}