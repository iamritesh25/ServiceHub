import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../App.css";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/api/auth/login", form);

      const userData = res.data;

      // Save token
      localStorage.setItem("token", userData.token);

      // Remove token from stored user object (clean practice)
      const { token, ...userWithoutToken } = userData;

      localStorage.setItem("user", JSON.stringify(userWithoutToken));

      console.log("Login success:", userWithoutToken);

      // Redirect based on role (optional but professional)
      if (userWithoutToken.role === "PROVIDER") {
        navigate("/provider-dashboard");
      } else if (userWithoutToken.role === "CUSTOMER") {
        navigate("/customer-dashboard");
      } else {
        navigate("/");
      }

    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      alert("Invalid email or password");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p>Login to your ServiceHub account</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="auth-btn">
            Login
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;