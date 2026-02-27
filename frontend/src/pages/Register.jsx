import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import "../App.css";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "CUSTOMER" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/api/auth/register", form);
      toast.success("Account created! Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-logo">ServiceHub</div>
        <h2>Join thousands of satisfied users</h2>
        <p>Create your free account and start booking professional services or offer your own expertise.</p>
        <div className="auth-feature-list">
          <div className="auth-feature-item"><span className="icon">🎯</span> As a Customer — find & book services</div>
          <div className="auth-feature-item"><span className="icon">🛠️</span> As a Provider — offer your skills</div>
          
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h2>Create Account</h2>
          <p className="subtitle">Free forever. No credit card required.</p>
          <form onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email address" value={form.email} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password (min 6 chars)" value={form.password} onChange={handleChange} required minLength={6} />
            <input type="tel" name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} required />
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="CUSTOMER">👤 I need services (Customer)</option>
              <option value="PROVIDER">🛠️ I offer services (Provider)</option>
            </select>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>
          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
