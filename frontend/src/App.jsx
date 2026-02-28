import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProviderDashboard from "./pages/ProviderDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import PaymentSuccess from "./pages/PaymentSuccess";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { AuthProvider } from "./auth/AuthContext";
import "./App.css";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: "10px",
              background: "#1e293b",
              color: "#f8fafc",
              fontSize: "14px",
              fontWeight: 500,
              padding: "12px 18px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            },
            success: {
              iconTheme: { primary: "#22c55e", secondary: "#fff" },
              style: { background: "#0f172a", border: "1px solid #22c55e33" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#fff" },
              style: { background: "#0f172a", border: "1px solid #ef444433" },
            },
          }}
        />

        <Routes>
          <Route path="/"                   element={<Landing />} />
          <Route path="/login"              element={<Login />} />
          <Route path="/register"           element={<Register />} />
          <Route path="/provider-dashboard" element={<ProviderDashboard />} />
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          <Route path="/payment-success"    element={<PaymentSuccess />} />
          <Route path="/admin/login"        element={<AdminLogin />} />
          <Route path="/admin/dashboard"    element={<AdminDashboard />} />
        </Routes>

      </Router>
    </AuthProvider>
  );
}

export default App;
