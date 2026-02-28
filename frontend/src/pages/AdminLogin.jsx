import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/api/admin/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("admin", JSON.stringify({
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      }));
      toast.success(`Welcome, ${res.data.name}!`);
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: "100%", padding: "13px 16px 13px 46px", borderRadius: 10,
    border: `1.5px solid ${focused === field ? "#6366f1" : "#e2e8f0"}`,
    fontSize: 15, fontWeight: 500, outline: "none", boxSizing: "border-box",
    fontFamily: "inherit", background: focused === field ? "#f8f7ff" : "#f8fafc",
    color: "#1e293b", transition: "all 0.2s ease",
    boxShadow: focused === field ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
  });

  const iconColor = (field) => focused === field ? "#6366f1" : "#94a3b8";

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <style>{`
        @keyframes adminSpin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 860px) {
          .admin-split-left { display: none !important; }
          .admin-split-right { width: 100% !important; }
        }
      `}</style>

      {/* ─── Left panel — Branding ─── */}
      <div className="admin-split-left" style={{
        width: "44%", minHeight: "100vh",
        background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        padding: "60px 48px", position: "relative", overflow: "hidden",
      }}>
        {/* Subtle grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }} />

        {/* Accent glow */}
        <div style={{
          position: "absolute", width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          top: "20%", right: "-10%",
        }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 380 }}>
          {/* Logo */}
          <div style={{
            display: "flex", alignItems: "center", gap: 14, marginBottom: 56,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span style={{ color: "white", fontSize: 20, fontWeight: 800, letterSpacing: "-0.3px" }}>
              ServiceHub
            </span>
          </div>

          <h2 style={{
            fontSize: 34, fontWeight: 800, color: "white",
            lineHeight: 1.2, marginBottom: 18, letterSpacing: "-0.5px",
          }}>
            Enterprise<br />Administration
          </h2>
          <p style={{
            color: "rgba(203,213,225,0.7)", fontSize: 15, lineHeight: 1.7,
            marginBottom: 48, fontWeight: 400,
          }}>
            Manage users, monitor bookings, configure platform settings and oversee system operations from a single dashboard.
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              ["Real-time Analytics", "Monitor platform metrics and revenue"],
              ["User Management", "Manage providers and customers"],
              ["System Configuration", "Toggle features and set commission rates"],
            ].map(([title, desc]) => (
              <div key={title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <div style={{ color: "white", fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{title}</div>
                  <div style={{ color: "rgba(148,163,184,0.6)", fontSize: 13, fontWeight: 400 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{
          position: "absolute", bottom: 32, left: 48, right: 48,
          color: "rgba(148,163,184,0.35)", fontSize: 12, fontWeight: 500,
        }}>
          © 2026 ServiceHub — All rights reserved
        </div>
      </div>

      {/* ─── Right panel — Login form ─── */}
      <div className="admin-split-right" style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 32px", background: "#ffffff",
      }}>
        <div style={{
          width: "100%", maxWidth: 400,
          animation: "fadeIn 0.5s ease-out",
        }}>
          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#f0f0ff", borderRadius: 20, padding: "6px 14px",
              marginBottom: 20,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                Secure Access
              </span>
            </div>
            <h1 style={{
              fontSize: 28, fontWeight: 800, color: "#0f172a",
              marginBottom: 8, letterSpacing: "-0.5px",
            }}>Welcome back</h1>
            <p style={{ color: "#64748b", fontSize: 15, fontWeight: 400, lineHeight: 1.5 }}>
              Sign in to the admin dashboard to continue.
            </p>
          </div>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: "block", fontWeight: 600, fontSize: 13, marginBottom: 7,
                color: "#374151",
              }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)",
                  color: iconColor("email"), transition: "color 0.2s",
                  display: "flex", alignItems: "center",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <input
                  type="email" required
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@servicehub.com"
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                  style={inputStyle("email")}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 32 }}>
              <label style={{
                display: "block", fontWeight: 600, fontSize: 13, marginBottom: 7,
                color: "#374151",
              }}>Password</label>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)",
                  color: iconColor("password"), transition: "color 0.2s",
                  display: "flex", alignItems: "center",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  type="password" required
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                  style={inputStyle("password")}
                />
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "14px 20px",
              background: loading ? "#a5b4fc" : "#4f46e5",
              color: "white", border: "none", borderRadius: 10,
              fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 4px 14px rgba(79,70,229,0.25)",
              transition: "all 0.2s ease",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}>
              {loading ? (
                <>
                  <div style={{
                    width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white", borderRadius: "50%",
                    animation: "adminSpin 0.7s linear infinite",
                  }} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={{
            marginTop: 32, padding: "16px 0",
            borderTop: "1px solid #f1f5f9",
            textAlign: "center",
          }}>
            <p style={{
              color: "#94a3b8", fontSize: 13, fontWeight: 500, lineHeight: 1.6,
            }}>
              Admin accounts are provisioned internally.
              <br />
              <span style={{ color: "#cbd5e1" }}>Contact your system administrator for access.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
