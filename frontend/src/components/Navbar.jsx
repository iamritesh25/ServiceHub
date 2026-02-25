import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav
      style={{
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(10px)",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        style={{
          fontSize: "1.4rem",
          fontWeight: "700",
          color: "#3b82f6",
          textDecoration: "none",
        }}
      >
        ServiceHub
      </Link>

      {/* Right Section */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {!user && (
          <>
            <Link to="/login" style={{ color: "white", textDecoration: "none" }}>
              Login
            </Link>
            <Link to="/register">
              <button className="btn-primary">Register</button>
            </Link>
          </>
        )}

        {user && (
          <>
            {/* Role-based links */}
            {user.role === "CUSTOMER" && (
              <Link to="/providers" style={{ color: "white", textDecoration: "none" }}>
                Explore Services
              </Link>
            )}

            {user.role === "PROVIDER" && (
              <Link to="/provider-profile" style={{ color: "white", textDecoration: "none" }}>
                My Profile
              </Link>
            )}

            <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>
              {user.name} ({user.role})
            </span>

            <button
              onClick={handleLogout}
              style={{
                background: "#ef4444",
                border: "none",
                padding: "8px 14px",
                borderRadius: "8px",
                color: "white",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
