import { StrictMode, type CSSProperties } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import "@/index.css";
import "@/styles.css";
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
          <Toaster
            position="top-right"
            theme="dark"
            toastOptions={{ className: "sumi-toast" }}
            style={
              {
                "--normal-bg": "rgb(var(--ink-2))",
                "--normal-border": "rgb(var(--paper) / 0.14)",
                "--normal-text": "rgb(var(--paper))",
              } as CSSProperties
            }
          />
          <App />
        </ConversationProvider>
        </SocketProvider>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>
);
