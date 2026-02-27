import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../auth/AuthContext";
import "../App.css";

const Login = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // Google role selection modal state
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingGoogleToken, setPendingGoogleToken] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/api/auth/login", form);
      handleAuthSuccess(res.data);
    } catch {
      toast.error("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Single source of truth for post-auth setup.
  // Writes token to localStorage, calls updateUser (which syncs React state + localStorage),
  // shows welcome toast, and navigates to the correct dashboard.
  const handleAuthSuccess = (userData) => {
    const { token, ...userWithoutToken } = userData;
    localStorage.setItem("token", token);
    // updateUser keeps AuthContext React state + localStorage in sync
    updateUser(userWithoutToken);
    toast.success(`Welcome back, ${userWithoutToken.name}!`);
    if (userWithoutToken.role === "PROVIDER") navigate("/provider-dashboard");
    else navigate("/customer-dashboard");
  };

  // Credential-based Google OAuth flow (id_token directly from GoogleLogin button)
  const handleGoogleCredential = async (credentialResponse) => {
    setGoogleLoading(true);
    try {
      const res = await API.post("/api/auth/google", {
        idToken: credentialResponse.credential,
      });
      handleAuthSuccess(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || "";
      if (msg.includes("Role selection")) {
        setPendingGoogleToken(credentialResponse.credential);
        setShowRoleModal(true);
      } else {
        toast.error(msg || "Google login failed");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleRoleSelect = async (role) => {
    setShowRoleModal(false);
    setGoogleLoading(true);
    try {
      const res = await API.post("/api/auth/google", {
        idToken: pendingGoogleToken,
        role,
      });
      handleAuthSuccess(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setGoogleLoading(false);
      setPendingGoogleToken(null);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-logo">ServiceHub</div>
        <h2>Welcome back to your workspace</h2>
        <p>Log in to manage your bookings, connect with providers, and get things done.</p>
        <div className="auth-feature-list">
          <div className="auth-feature-item">
            <img src="https://cdn-icons-png.flaticon.com/32/684/684908.png" alt="location" style={{ width: 20 }} />
            Location-based service discovery
          </div>
          <div className="auth-feature-item">
            <img src="https://cdn-icons-png.flaticon.com/32/1086/1086741.png" alt="payment" style={{ width: 20 }} />
            Razorpay-powered secure payments
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Sign In</h2>
          <p className="subtitle">Enter your credentials to access your account</p>

          <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
            {googleLoading ? (
              <button className="google-btn" disabled>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Signing in with Google...
              </button>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleCredential}
                onError={() => toast.error("Google sign-in failed")}
                useOneTap={false}
                text="signin_with"
                shape="rectangular"
                theme="outline"
                size="large"
                width="320"
              />
            )}
          </div>

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="email" name="email" placeholder="Email address"
              value={form.email} onChange={handleChange} required
            />
            <input
              type="password" name="password" placeholder="Password"
              value={form.password} onChange={handleChange} required
            />
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>
          <p className="auth-footer">
            Don&apos;t have an account? <Link to="/register">Create one free</Link>
          </p>
        </div>
      </div>

      {/* Role Selection Modal for new Google users */}
      {showRoleModal && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Welcome to ServiceHub!</h3>
            <p>Please select your account type to complete registration.</p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 24 }}>
              <button
                className="dashboard-btn"
                onClick={() => handleRoleSelect("CUSTOMER")}
                style={{ flex: 1 }}
              >
                I need Services
                <br />
                <small style={{ fontWeight: 400 }}>Customer</small>
              </button>
              <button
                className="dashboard-btn"
                onClick={() => handleRoleSelect("PROVIDER")}
                style={{ flex: 1, background: "var(--primary-dark)" }}
              >
                I provide Services
                <br />
                <small style={{ fontWeight: 400 }}>Provider</small>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;