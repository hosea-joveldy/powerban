import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Board from "./pages/Board.jsx";
import Settings from "./pages/Settings.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null; // avoid a login-page flash while /me resolves
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RootRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) {
    return <LandingPage />;
  }
  return <Dashboard />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/boards/:id"
        element={
          <ProtectedRoute>
            <Board />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
