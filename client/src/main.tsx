import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import "@/index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./context/UserProvider.tsx";
import ConversationProvider from "./context/ConversationProvider.tsx";
import SocketProvider from "./context/SocketProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <SocketProvider>
          <ConversationProvider>
          <Toaster position="top-right" richColors />
          <App />
        </ConversationProvider>
        </SocketProvider>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>
);
