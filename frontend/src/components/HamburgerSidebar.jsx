import { useState, useEffect } from "react";
const HamburgerSidebar = ({
  navItems = [],
  activeTab,
  onTabChange,
  logoText = "ServiceHub",
  onLogout,
  accentColor = "#2563eb",
  onToggle,
}) => {
  const [open, setOpen] = useState(window.innerWidth >= 900);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = (val) => {
    const next = typeof val === 'function' ? val(open) : val;
    setOpen(next);
    if (onToggle) onToggle(next);
  };

  const handleTabChange = (tab) => {
    onTabChange(tab);
    if (isMobile) toggleSidebar(false);
  };

  const W = 260;
  const showSidebar = open;

  return (
    <>
      {/* Mobile overlay — click to close */}
      {isMobile && open && (
        <div
          onClick={() => toggleSidebar(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 200,
          }}
        />
      )}

      {/* Hamburger button (always visible) */}
      <button
        onClick={() => toggleSidebar(o => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        style={{
          position: "fixed", top: 14, left: open && !isMobile ? 210 : 14, zIndex: 400,
          width: 42, height: 42, borderRadius: 10,
          background: "#0f172a",
          border: "1.5px solid rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          transition: "left 0.26s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Animated hamburger / X icon */}
        <div style={{ display: "flex", flexDirection: "column", gap: open ? 0 : 5, position: "relative", width: 20, height: 14 }}>
          <div style={{
            width: 20, height: 2, background: "white", borderRadius: 2,
            transform: open ? "rotate(45deg) translate(0px, 6px)" : "none",
            transition: "transform 0.22s ease, opacity 0.22s ease",
          }} />
          <div style={{
            width: 20, height: 2, background: "white", borderRadius: 2,
            opacity: open ? 0 : 1,
            transition: "opacity 0.22s ease",
          }} />
          <div style={{
            width: 20, height: 2, background: "white", borderRadius: 2,
            transform: open ? "rotate(-45deg) translate(0px, -6px)" : "none",
            transition: "transform 0.22s ease",
          }} />
        </div>
      </button>

      {/* Sidebar panel */}
      <aside
        style={{
          position: "fixed", top: 0, left: 0,
          height: "100vh", width: W,
          background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
          zIndex: 300,
          display: "flex", flexDirection: "column",
          transform: showSidebar ? "translateX(0)" : `translateX(-${W}px)`,
          transition: "transform 0.26s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.25)",
        }}
      >
        {/* Logo row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "24px 20px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: accentColor, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, fontWeight: 800, color: "white",
          }}>
            {logoText[0]}
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "white", letterSpacing: "-0.3px" }}>
            {logoText}
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <div
                key={item.tab}
                role="button"
                tabIndex={0}
                onClick={() => handleTabChange(item.tab)}
                onKeyDown={(e) => e.key === "Enter" && handleTabChange(item.tab)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "11px 14px", borderRadius: 10, cursor: "pointer", marginBottom: 4,
                  background: isActive ? `${accentColor}22` : "transparent",
                  border: `1px solid ${isActive ? `${accentColor}44` : "transparent"}`,
                  color: isActive ? "white" : "rgba(255,255,255,0.58)",
                  fontWeight: isActive ? 700 : 500, fontSize: 14,
                  transition: "all 0.16s ease",
                  userSelect: "none",
                }}
              >
                <span style={{ fontSize: 18, width: 24, textAlign: "center", flexShrink: 0 }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div
          role="button"
          tabIndex={0}
          onClick={onLogout}
          onKeyDown={(e) => e.key === "Enter" && onLogout()}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "11px 14px", margin: "10px",
            borderRadius: 10, cursor: "pointer",
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.22)",
            color: "#f87171", fontWeight: 600, fontSize: 14,
            transition: "all 0.16s ease",
            userSelect: "none",
          }}
        >
          <span style={{ width: 24, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          </span>
          <span>Logout</span>
        </div>
      </aside>
    </>
  );
};

export default HamburgerSidebar;
