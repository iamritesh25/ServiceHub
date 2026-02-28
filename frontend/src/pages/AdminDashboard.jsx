import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

// ─── SVG Icons (no emojis) ─────────────────────────────────────────────────
const Icon = {
  analytics: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  bookings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  config: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2" /></svg>,
  logs: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
  logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  totalUsers: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  providers: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>,
  customers: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>,
  totalBook: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  revenue: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
  commission: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
  cancelRate: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
  topService: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  menu: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
  close: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  shield: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
};

const NAV_ITEMS = [
  { tab: "analytics", label: "Analytics", icon: Icon.analytics },
  { tab: "users", label: "User Management", icon: Icon.users },
  { tab: "bookings", label: "Bookings & Payments", icon: Icon.bookings },
  { tab: "config", label: "System Config", icon: Icon.config },
  { tab: "logs", label: "System Logs", icon: Icon.logs },
];

const SIDEBAR_W = 260;

// ─── Sidebar ──────────────────────────────────────────────────────────────
const Sidebar = ({ activeTab, onTabChange, onLogout, sidebarOpen, setSidebarOpen }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const handleTab = (tab) => {
    onTabChange(tab);
    if (isMobile) setSidebarOpen(false);
  };

  const visible = sidebarOpen;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200 }}
        />
      )}

      {/* Sidebar panel */}
      <aside style={{
        position: "fixed", top: 0, left: 0, height: "100vh", width: SIDEBAR_W,
        background: "linear-gradient(180deg, #0f172a 0%, #1a2540 100%)",
        zIndex: 300, display: "flex", flexDirection: "column",
        transform: visible ? "translateX(0)" : `translateX(-${SIDEBAR_W}px)`,
        transition: "transform 0.26s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: "4px 0 32px rgba(0,0,0,0.3)",
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "white", fontWeight: 800, fontSize: 16 }}>A</span>
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 800, fontSize: 16, letterSpacing: "-0.3px" }}>Admin</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Enterprise Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {NAV_ITEMS.map(({ tab, label, icon }) => {
            const active = activeTab === tab;
            return (
              <div
                key={tab}
                onClick={() => handleTab(tab)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleTab(tab)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 10, cursor: "pointer", marginBottom: 4,
                  background: active ? "rgba(124,58,237,0.2)" : "transparent",
                  border: `1px solid ${active ? "rgba(124,58,237,0.4)" : "transparent"}`,
                  color: active ? "white" : "rgba(255,255,255,0.55)",
                  fontWeight: active ? 700 : 500, fontSize: 13.5,
                  transition: "all 0.16s ease",
                }}
              >
                <span style={{ flexShrink: 0 }}>{icon}</span>
                <span>{label}</span>
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div
          onClick={onLogout}
          role="button" tabIndex={0}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "11px 14px", margin: "10px",
            borderRadius: 10, cursor: "pointer",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#f87171", fontWeight: 600, fontSize: 13.5,
          }}
        >
          {Icon.logout}
          <span>Logout</span>
        </div>
      </aside>
    </>
  );
};

// ─── Bar chart ──────────────────────────────────────────────────────────────
const BarChart = ({ data, valueKey, labelKey, color = "#7c3aed", title }) => {
  if (!data || data.length === 0)
    return <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>No data available yet</p>;
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 14, letterSpacing: "0.2px" }}>{title}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 90 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div
              title={`${d[labelKey]}: ${d[valueKey]}`}
              style={{
                width: "100%", minWidth: 6,
                height: `${Math.max((Number(d[valueKey]) / max) * 72, 3)}px`,
                background: `linear-gradient(180deg, ${color}cc, ${color})`,
                borderRadius: "3px 3px 0 0",
                transition: "height 0.4s ease",
              }}
            />
            <span style={{ fontSize: 9, color: "#94a3b8", whiteSpace: "nowrap", maxWidth: 34, overflow: "hidden", textOverflow: "ellipsis" }}>
              {String(d[labelKey]).slice(-5)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── KPI Card ───────────────────────────────────────────────────────────────
const KpiCard = ({ icon, label, value, color = "#2563eb", sub }) => (
  <div style={{
    background: "white", borderRadius: 14, padding: "20px 22px",
    border: "1px solid #e8edf5",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)",
    display: "flex", alignItems: "flex-start", gap: 14,
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 11, flexShrink: 0,
      background: `${color}12`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: color,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{sub}</div>}
    </div>
  </div>
);

// ─── Badge ───────────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const map = {
    ACTIVE: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
    SUSPENDED: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    DELETED: { bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb" },
    COMPLETED: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
    CANCELLED: { bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb" },
    REJECTED: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    ACCEPTED: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
    PENDING: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    PAID: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
    UNPAID: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    CREATED: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    CUSTOMER: { bg: "#faf5ff", color: "#7c3aed", border: "#ddd6fe" },
    PROVIDER: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  };
  const s = map[status] || { bg: "#f9fafb", color: "#374151", border: "#e5e7eb" };
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      padding: "3px 9px", borderRadius: 6,
      fontSize: 11, fontWeight: 700, display: "inline-block", letterSpacing: "0.3px",
    }}>{status}</span>
  );
};

// ─── Table styles ─────────────────────────────────────────────────────────
const th = { padding: "10px 14px", textAlign: "left", fontWeight: 700, fontSize: 11.5, color: "#6b7280", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", textTransform: "uppercase", letterSpacing: "0.5px" };
const td = { padding: "11px 14px", fontSize: 13, color: "#1f2937", borderBottom: "1px solid #f3f4f6", verticalAlign: "middle" };

// ─── Main component ───────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("analytics");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 900);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // Analytics
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Users
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userRole, setUserRole] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);

  // Bookings
  const [bookings, setBookings] = useState([]);
  const [bStatusFilter, setBStatusFilter] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [bTab, setBTab] = useState("bookings");

  // Config
  const [configEdits, setConfigEdits] = useState({});

  // Logs
  const [logs, setLogs] = useState([]);

  // ── Auth guard ──────────────────────────────────────────────
  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) { navigate("/admin/login"); return; }
  }, []);

  const adminRequest = useCallback(async (method, path, data) => {
    try {
      const res = await API({ method, url: path, data });
      return res.data;
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("admin");
        navigate("/admin/login");
      }
      throw err;
    }
  }, [navigate]);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const data = await adminRequest("get", "/api/admin/analytics");
      setAnalytics(data);
    } catch { toast.error("Failed to load analytics"); }
    finally { setAnalyticsLoading(false); }
  }, [adminRequest]);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (userRole) params.append("role", userRole);
      if (userSearch) params.append("search", userSearch);
      const data = await adminRequest("get", `/api/admin/users?${params}`);
      setUsers(data);
    } catch { toast.error("Failed to load users"); }
  }, [adminRequest, userRole, userSearch]);

  const fetchBookings = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (bStatusFilter) params.append("status", bStatusFilter);
      const data = await adminRequest("get", `/api/admin/bookings?${params}`);
      setBookings(data);
    } catch { toast.error("Failed to load bookings"); }
  }, [adminRequest, bStatusFilter]);

  const fetchTransactions = useCallback(async () => {
    try {
      const data = await adminRequest("get", "/api/admin/transactions");
      setTransactions(data);
    } catch { toast.error("Failed to load transactions"); }
  }, [adminRequest]);

  const fetchConfig = useCallback(async () => {
    try {
      const data = await adminRequest("get", "/api/admin/config");
      setConfigEdits(data);
    } catch { toast.error("Failed to load config"); }
  }, [adminRequest]);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await adminRequest("get", "/api/admin/logs");
      setLogs(data);
    } catch { toast.error("Failed to load logs"); }
  }, [adminRequest]);

  useEffect(() => {
    if (activeTab === "analytics") fetchAnalytics();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "bookings") { fetchBookings(); fetchTransactions(); }
    if (activeTab === "config") fetchConfig();
    if (activeTab === "logs") fetchLogs();
  }, [activeTab]);

  useEffect(() => { if (activeTab === "users") fetchUsers(); }, [userRole, userSearch]);
  useEffect(() => { if (activeTab === "bookings") fetchBookings(); }, [bStatusFilter]);

  // ── User actions ─────────────────────────────────────────────
  const suspendUser = async (id) => {
    try { await adminRequest("put", `/api/admin/users/${id}/suspend`); toast.success("User suspended"); fetchUsers(); }
    catch (err) { toast.error(err.response?.data?.error || "Failed"); }
  };

  const activateUser = async (id) => {
    try { await adminRequest("put", `/api/admin/users/${id}/activate`); toast.success("User activated"); fetchUsers(); }
    catch (err) { toast.error(err.response?.data?.error || "Failed"); }
  };

  const deleteUser = async (id) => {
    if (!confirm("Permanently delete this user? This cannot be undone.")) return;
    try { await adminRequest("delete", `/api/admin/users/${id}`); toast.success("User deleted"); fetchUsers(); }
    catch (err) { toast.error(err.response?.data?.error || "Failed"); }
  };

  const viewUserBookings = async (user) => {
    setSelectedUser(user);
    try {
      const data = await adminRequest("get", `/api/admin/users/${user.id}/bookings`);
      setUserBookings(data);
    } catch { setUserBookings([]); }
  };

  // ── Booking actions ──────────────────────────────────────────
  const forceCancel = async (id) => {
    const reason = prompt("Cancellation reason:");
    if (reason === null) return;
    try { await adminRequest("put", `/api/admin/bookings/${id}/cancel`, { reason }); toast.success("Booking cancelled"); fetchBookings(); }
    catch (err) { toast.error(err.response?.data?.error || "Failed"); }
  };

  const markComplete = async (id) => {
    try { await adminRequest("put", `/api/admin/bookings/${id}/complete`); toast.success("Booking completed"); fetchBookings(); }
    catch (err) { toast.error(err.response?.data?.error || "Failed"); }
  };

  const mockRefund = async (id) => {
    try {
      const data = await adminRequest("post", `/api/admin/transactions/${id}/refund`);
      toast.success("Mock refund initiated");
      alert(`Refund Details:\n\nAmount: ₹${data.amount}\nCommission: ₹${data.commissionAmount || 0}\nProvider Payout: ₹${data.providerPayout || 0}\nStatus: ${data.refundStatus}\n\n${data.message}`);
    } catch (err) { toast.error(err.response?.data?.error || "Failed"); }
  };

  // ── Config save ───────────────────────────────────────────────
  const saveConfig = async () => {
    try { await adminRequest("put", "/api/admin/config", configEdits); toast.success("Configuration saved successfully"); fetchConfig(); }
    catch { toast.error("Failed to save config"); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  const btn = (label, onClick, style = {}) => (
    <button
      onClick={onClick}
      style={{
        padding: "5px 11px", border: "none", borderRadius: 6,
        cursor: "pointer", fontWeight: 600, fontSize: 12, transition: "opacity 0.15s",
        ...style
      }}
    >{label}</button>
  );

  // ─── Content ─────────────────────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {

      // ── ANALYTICS ────────────────────────────────────────────
      case "analytics": return (
        <div>
          <h2 style={{ margin: "0 0 24px", fontWeight: 800, fontSize: 20, color: "#111827" }}>Platform Analytics</h2>
          {analyticsLoading && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#6b7280", fontSize: 14 }}>
              <div style={{ width: 18, height: 18, border: "2px solid #e5e7eb", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              Loading analytics...
            </div>
          )}
          {analytics && (
            <>
              {/* Primary KPIs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(195px, 1fr))", gap: 14, marginBottom: 14 }}>
                <KpiCard icon={Icon.totalUsers} label="Total Users" value={analytics.totalUsers} color="#2563eb" />
                <KpiCard icon={Icon.providers} label="Providers" value={analytics.totalProviders} color="#0f766e" />
                <KpiCard icon={Icon.customers} label="Customers" value={analytics.totalCustomers} color="#7c3aed" />
                <KpiCard icon={Icon.totalBook} label="Total Bookings" value={analytics.totalBookings} color="#f59e0b" />
              </div>
              {/* Secondary KPIs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(195px, 1fr))", gap: 14, marginBottom: 28 }}>
                <KpiCard icon={Icon.revenue} label="Gross Revenue" value={`₹${(analytics.totalRevenue || 0).toLocaleString("en-IN")}`} color="#16a34a" sub="From paid bookings" />
                <KpiCard icon={Icon.commission} label="Commission Earned" value={`₹${(analytics.commissionEarned || 0).toLocaleString("en-IN")}`} color="#7c3aed" sub="Platform earnings" />
                <KpiCard icon={Icon.cancelRate} label="Cancel Rate" value={`${(analytics.cancelRate || 0).toFixed(1)}%`} color="#dc2626" sub="Of total bookings" />
                <KpiCard icon={Icon.topService} label="Top Service" value={analytics.mostPopularService || "—"} color="#0ea5e9" />
              </div>

              {/* Charts */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div style={{ background: "white", borderRadius: 14, padding: 24, border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <BarChart data={analytics.revenueByMonth} valueKey="revenue" labelKey="month" color="#2563eb" title="Revenue by Month (₹)" />
                </div>
                <div style={{ background: "white", borderRadius: 14, padding: 24, border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <BarChart data={analytics.bookingTrends} valueKey="bookings" labelKey="month" color="#7c3aed" title="Booking Trends" />
                </div>
              </div>
            </>
          )}
        </div>
      );

      // ── USER MANAGEMENT ──────────────────────────────────────
      case "users": return (
        <div>
          <h2 style={{ margin: "0 0 20px", fontWeight: 800, fontSize: 20, color: "#111827" }}>User Management</h2>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
            <input
              placeholder="Search name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              style={{ padding: "9px 13px", borderRadius: 9, border: "1.5px solid #e5e7eb", fontSize: 13.5, minWidth: 220, outline: "none" }}
            />
            <select value={userRole} onChange={(e) => setUserRole(e.target.value)}
              style={{ padding: "9px 13px", borderRadius: 9, border: "1.5px solid #e5e7eb", fontSize: 13.5, background: "white" }}>
              <option value="">All Roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="PROVIDER">Provider</option>
            </select>
          </div>

          <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>{["ID", "Name", "Email", "Role", "Status", "Joined", "Actions"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ transition: "background 0.1s" }}>
                    <td style={{ ...td, color: "#9ca3af", fontSize: 12 }}>{u.id}</td>
                    <td style={{ ...td, fontWeight: 600 }}>{u.name}</td>
                    <td style={{ ...td, color: "#6b7280" }}>{u.email}</td>
                    <td style={td}><Badge status={u.role} /></td>
                    <td style={td}><Badge status={u.status || "ACTIVE"} /></td>
                    <td style={{ ...td, color: "#9ca3af", fontSize: 12 }}>{u.createdAt?.split("T")[0]}</td>
                    <td style={td}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {btn("Bookings", () => viewUserBookings(u), { background: "#eff6ff", color: "#2563eb" })}
                        {u.status === "SUSPENDED"
                          ? btn("Activate", () => activateUser(u.id), { background: "#f0fdf4", color: "#16a34a" })
                          : btn("Suspend", () => suspendUser(u.id), { background: "#fffbeb", color: "#d97706" })
                        }
                        {btn("Delete", () => deleteUser(u.id), { background: "#fef2f2", color: "#dc2626" })}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={7} style={{ ...td, textAlign: "center", color: "#9ca3af", padding: 40 }}>No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* User bookings modal */}
          {selectedUser && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
              <div style={{ background: "white", borderRadius: 16, padding: 28, width: "100%", maxWidth: 680, maxHeight: "80vh", overflow: "auto", boxShadow: "0 20px 64px rgba(0,0,0,0.25)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <h3 style={{ margin: 0, fontWeight: 800, fontSize: 17 }}>Bookings — {selectedUser.name}</h3>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>{selectedUser.email}</div>
                  </div>
                  <button onClick={() => setSelectedUser(null)} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Close</button>
                </div>
                {userBookings.length === 0
                  ? <p style={{ color: "#9ca3af", textAlign: "center", padding: 32 }}>No bookings found</p>
                  : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead><tr>{["ID", "Service", "Status", "Payment", "Date"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                      <tbody>
                        {userBookings.map(b => (
                          <tr key={b.id}>
                            <td style={{ ...td, color: "#9ca3af", fontSize: 12 }}>#{b.id}</td>
                            <td style={{ ...td, fontWeight: 600 }}>{b.serviceName}</td>
                            <td style={td}><Badge status={b.status} /></td>
                            <td style={td}><Badge status={b.paymentStatus} /></td>
                            <td style={{ ...td, color: "#9ca3af", fontSize: 12 }}>{b.createdAt?.split("T")[0]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                }
              </div>
            </div>
          )}
        </div>
      );

      // ── BOOKINGS & PAYMENTS ──────────────────────────────────
      case "bookings": return (
        <div>
          <h2 style={{ margin: "0 0 20px", fontWeight: 800, fontSize: 20, color: "#111827" }}>Bookings & Payments</h2>

          <div style={{ display: "flex", gap: 3, marginBottom: 20, background: "#f3f4f6", borderRadius: 10, padding: 4, width: "fit-content" }}>
            {[["bookings", "Bookings"], ["transactions", "Transactions"]].map(([t, l]) => (
              <button key={t} onClick={() => setBTab(t)} style={{
                padding: "7px 18px", borderRadius: 7, border: "none", cursor: "pointer",
                background: bTab === t ? "white" : "transparent",
                fontWeight: 700, fontSize: 13, color: bTab === t ? "#111827" : "#6b7280",
                boxShadow: bTab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s",
              }}>{l}</button>
            ))}
          </div>

          {bTab === "bookings" && (
            <>
              <div style={{ marginBottom: 16 }}>
                <select value={bStatusFilter} onChange={(e) => setBStatusFilter(e.target.value)}
                  style={{ padding: "9px 13px", borderRadius: 9, border: "1.5px solid #e5e7eb", fontSize: 13.5, background: "white" }}>
                  <option value="">All Statuses</option>
                  {["PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"].map(s =>
                    <option key={s} value={s}>{s}</option>
                  )}
                </select>
              </div>
              <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "auto", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>{["ID", "Service", "Customer", "Provider", "Status", "Payment", "Date", "Actions"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id}>
                        <td style={{ ...td, color: "#9ca3af", fontSize: 12 }}>#{b.id}</td>
                        <td style={{ ...td, fontWeight: 600 }}>{b.serviceName}</td>
                        <td style={td}>{b.customerName}</td>
                        <td style={td}>{b.providerName}</td>
                        <td style={td}><Badge status={b.status} /></td>
                        <td style={td}><Badge status={b.paymentStatus} /></td>
                        <td style={{ ...td, color: "#9ca3af", fontSize: 12 }}>{b.createdAt?.split("T")[0]}</td>
                        <td style={td}>
                          <div style={{ display: "flex", gap: 6 }}>
                            {!["CANCELLED", "COMPLETED"].includes(b.status) && btn("Cancel", () => forceCancel(b.id), { background: "#fef2f2", color: "#dc2626" })}
                            {!["COMPLETED", "CANCELLED"].includes(b.status) && btn("Complete", () => markComplete(b.id), { background: "#f0fdf4", color: "#16a34a" })}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr><td colSpan={8} style={{ ...td, textAlign: "center", color: "#9ca3af", padding: 40 }}>No bookings found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {bTab === "transactions" && (
            <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "auto", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["ID", "Booking", "Razorpay Order", "Amount", "Commission", "Payout", "Status", "Actions"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td style={{ ...td, color: "#9ca3af", fontSize: 12 }}>#{t.id}</td>
                      <td style={td}>#{t.booking?.id}</td>
                      <td style={{ ...td, fontFamily: "monospace", fontSize: 11, color: "#6b7280", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis" }}>{t.razorpayOrderId || "—"}</td>
                      <td style={{ ...td, fontWeight: 700 }}>₹{t.amount}</td>
                      <td style={{ ...td, color: "#7c3aed" }}>{t.commissionAmount ? `₹${t.commissionAmount}` : "—"}</td>
                      <td style={{ ...td, color: "#16a34a" }}>{t.providerPayout ? `₹${t.providerPayout}` : "—"}</td>
                      <td style={td}><Badge status={t.status} /></td>
                      <td style={td}>
                        {t.status === "PAID" && btn("Refund", () => mockRefund(t.id), { background: "#fffbeb", color: "#d97706" })}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr><td colSpan={8} style={{ ...td, textAlign: "center", color: "#9ca3af", padding: 40 }}>No transactions found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );

      // ── SYSTEM CONFIG ────────────────────────────────────────
      case "config": return (
        <div>
          <h2 style={{ margin: "0 0 6px", fontWeight: 800, fontSize: 20, color: "#111827" }}>System Configuration</h2>
          <p style={{ margin: "0 0 24px", fontSize: 13, color: "#9ca3af" }}>Changes take effect immediately without a restart.</p>

          <div style={{ background: "white", borderRadius: 14, padding: 28, border: "1px solid #e5e7eb", maxWidth: 520, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            {[
              { key: "commission_percent", label: "Platform Commission (%)", type: "number", hint: "Deducted from provider payout on each paid booking" },
              { key: "email_notifications", label: "Email Notifications", type: "toggle", hint: "Disabling stops all booking/payment emails globally" },
              { key: "maintenance_mode", label: "Maintenance Mode", type: "toggle", hint: "Blocks all service APIs except auth and admin endpoints" },
            ].map(({ key, label, type, hint }) => (
              <div key={key} style={{ marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid #f3f4f6" }}>
                <label style={{ display: "block", fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 4 }}>{label}</label>
                <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10 }}>{hint}</div>
                {type === "toggle" ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    {["true", "false"].map(v => {
                      const isActive = configEdits[key] === v;
                      const isOn = v === "true";
                      return (
                        <button key={v} onClick={() => setConfigEdits(c => ({ ...c, [key]: v }))} style={{
                          padding: "8px 22px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13,
                          border: `1.5px solid ${isActive ? (isOn ? "#86efac" : "#fca5a5") : "#e5e7eb"}`,
                          background: isActive ? (isOn ? "#f0fdf4" : "#fef2f2") : "white",
                          color: isActive ? (isOn ? "#16a34a" : "#dc2626") : "#9ca3af",
                          transition: "all 0.15s",
                        }}>{isOn ? "Enabled" : "Disabled"}</button>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    type="number" step="0.1" min="0" max="100"
                    value={configEdits[key] || ""}
                    onChange={(e) => setConfigEdits(c => ({ ...c, [key]: e.target.value }))}
                    style={{ padding: "9px 13px", borderRadius: 9, border: "1.5px solid #e5e7eb", fontSize: 14, width: 180, outline: "none" }}
                  />
                )}
              </div>
            ))}

            <button onClick={saveConfig} style={{
              padding: "11px 28px",
              background: "linear-gradient(90deg, #2563eb, #7c3aed)",
              color: "white", border: "none", borderRadius: 10,
              fontWeight: 700, fontSize: 14, cursor: "pointer",
              boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
              transition: "opacity 0.15s",
            }}>Save Configuration</button>
          </div>
        </div>
      );

      // ── LOGS ─────────────────────────────────────────────────
      case "logs": return (
        <div>
          <h2 style={{ margin: "0 0 20px", fontWeight: 800, fontSize: 20, color: "#111827" }}>System Logs</h2>
          <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "auto", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>{["Event Type", "Booking", "Status", "Customer", "Provider", "Timestamp"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i}>
                    <td style={{ ...td, fontWeight: 700, color: "#7c3aed", fontSize: 12, letterSpacing: "0.3px" }}>{log.type}</td>
                    <td style={{ ...td, color: "#6b7280" }}>#{log.bookingId}</td>
                    <td style={td}><Badge status={log.status} /></td>
                    <td style={{ ...td, color: "#6b7280", fontSize: 12 }}>{log.customer}</td>
                    <td style={{ ...td, color: "#6b7280", fontSize: 12 }}>{log.provider}</td>
                    <td style={{ ...td, color: "#9ca3af", fontSize: 12, fontFamily: "monospace" }}>{String(log.timestamp).split("T").join(" ").slice(0, 19)}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={6} style={{ ...td, textAlign: "center", color: "#9ca3af", padding: 40 }}>No logs found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );

      default: return null;
    }
  };

  const adminData = JSON.parse(localStorage.getItem("admin") || "{}");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Hamburger toggle (always visible) */}
      <button
        onClick={() => setSidebarOpen(o => !o)}
        aria-label="Toggle sidebar"
        style={{
          position: "fixed", top: 14, left: sidebarOpen && !isMobile ? SIDEBAR_W - 50 : 14, zIndex: 400,
          width: 42, height: 42, borderRadius: 10,
          background: "#0f172a", border: "1.5px solid rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          transition: "left 0.26s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <span style={{ color: "white" }}>
          {sidebarOpen ? Icon.close : Icon.menu}
        </span>
      </button>

      <main style={{
        flex: 1,
        marginLeft: sidebarOpen && !isMobile ? SIDEBAR_W : 0,
        padding: isMobile ? "64px 16px 24px" : sidebarOpen ? "30px 32px" : "68px 32px 30px",
        maxWidth: sidebarOpen && !isMobile ? `calc(100vw - ${SIDEBAR_W}px)` : "100vw",
        boxSizing: "border-box",
        overflowX: "hidden",
        transition: "margin-left 0.26s cubic-bezier(0.4,0,0.2,1), max-width 0.26s cubic-bezier(0.4,0,0.2,1)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.8px" }}>
              Enterprise Admin Panel
            </div>
            <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#111827" }}>ServiceHub Dashboard</h1>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "white", borderRadius: 10, padding: "8px 14px",
            border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
              {Icon.shield}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{adminData.name || "Admin"}</div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>Administrator</div>
            </div>
          </div>
        </div>

        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
