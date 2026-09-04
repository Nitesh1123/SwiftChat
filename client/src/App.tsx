import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "@/pages/Auth";
import Chat from "./pages/Chat";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/auth" element={<Auth />} />

      {/* Chat */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      {/* Default */}
      <Route path="*" element={<Navigate to="/auth" />} />
    </Routes>
  );
}
