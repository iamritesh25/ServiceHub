import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import "../App.css";
import ReviewModal from "../components/ReviewModal";
import MapView from "../components/MapView";
import RazorpayCheckout from "../components/RazorpayCheckout";
import CancellationModal from "../components/CancellationModal";
import ProfileImageUpload from "../components/ProfileImageUpload";
import { ViewModeToggle, ViewContainer } from "../components/ViewModeToggle";
import useGeolocation from "../hooks/useGeolocation";
import { getServiceImage } from "../utils/serviceImages";

const statusColor = (s) =>
  s === "ACCEPTED"  ? "badge-green"  :
  s === "REJECTED"  ? "badge-red"    :
  s === "COMPLETED" ? "badge-blue"   :
  s === "CANCELLED" ? "badge-gray"   : "badge-yellow";

// ── Booking Confirmation Modal ─────────────────────────────────────────────
const BookingConfirmModal = ({ booking, onClose }) => {
  if (!booking) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: 20,
    }}>
      <div style={{
        background: "white", borderRadius: 18, padding: 40,
        width: "100%", maxWidth: 460,
        boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
          Booking Confirmed!
        </h2>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>
          Your booking request has been sent to the provider.
        </p>
        <div style={{
          background: "#f8fafc", borderRadius: 12, padding: 20,
          border: "1px solid #e2e8f0", textAlign: "left", marginBottom: 24,
        }}>
          {[
            ["Service", booking.service?.name],
            ["Provider", booking.provider?.name],
            ["Price", `₹ ${booking.service?.price}`],
            booking.bookingLocation ? ["Location", booking.bookingLocation] : null,
            ["Booking ID", `#${booking.id}`],
          ].filter(Boolean).map(([label, value], i, arr) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: i < arr.length - 1 ? "1px solid #e2e8f0" : "none",
            }}>
              <span style={{ color: "#64748b", fontSize: 14, fontWeight: 600 }}>{label}</span>
              <span style={{ color: "#0f172a", fontSize: 14, fontWeight: 700, maxWidth: 240, textAlign: "right" }}>{value}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid #e2e8f0" }}>
            <span style={{ color: "#64748b", fontSize: 14, fontWeight: 600 }}>Status</span>
            <span style={{ background: "#fef9c3", color: "#92400e", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>PENDING</span>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>
          You will be notified by email once the provider accepts your booking.
        </p>
        <button
          onClick={onClose}
          style={{
            width: "100%", padding: "13px",
            background: "linear-gradient(90deg, #2563eb, #3b82f6)",
            color: "white", border: "none", borderRadius: 10,
            fontWeight: 700, fontSize: 15, cursor: "pointer",
          }}
        >
          View My Bookings →
        </button>
      </div>
    </div>
  );
};
// ──────────────────────────────────────────────────────────────────────────────

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("explore");
  const [keyword, setKeyword] = useState("");
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelBooking, setCancelBooking] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // View modes
  const [servicesView, setServicesView] = useState("grid");
  const [bookingsView, setBookingsView] = useState("grid");

  // Booking filters
  const [filterService, setFilterService] = useState("");
  const [filterProvider, setFilterProvider] = useState("");
  const [filterPriceMin, setFilterPriceMin] = useState("");
  const [filterPriceMax, setFilterPriceMax] = useState("");

  // Map state
  const [activeMapServiceId, setActiveMapServiceId] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [mapError, setMapError] = useState(null);
  const { getLocation, loading: geoLoading } = useGeolocation();
  const [locationMode, setLocationMode] = useState("auto");
  const [manualAddress, setManualAddress] = useState("");
  const [geocoding, setGeocoding] = useState(false);

  // Booking location
  const [bookingLocMode, setBookingLocMode] = useState("manual");
  const [bookingManualAddress, setBookingManualAddress] = useState("");
  const [bookingGpsLoading, setBookingGpsLoading] = useState(false);

  const [profile, setProfile] = useState({ name: "", email: "", phone: "", location: "" });
  const [profileImage, setProfileImage] = useState(
    JSON.parse(localStorage.getItem("user") || "{}").profileImage || null
  );

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const geocodeAddress = async (address) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    if (!data.length) throw new Error("Address not found. Try a more specific address.");
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  };

  const searchServices = async () => {
    if (!keyword.trim()) { setServices([]); return; }
    setLoadingSearch(true);
    try {
      const res = await API.get(`/api/services/search?keyword=${keyword}`);
      setServices(res.data);
    } catch { toast.error("Search failed"); }
    finally { setLoadingSearch(false); }
  };

  useEffect(() => {
    const t = setTimeout(searchServices, 500);
    return () => clearTimeout(t);
  }, [keyword]);

  const bookService = async (serviceId) => {
    let payload = {};
    try {
      if (bookingLocMode === "gps") {
        setBookingGpsLoading(true);
        const loc = await getLocation();
        let label = `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json`, { headers: { "Accept-Language": "en" } });
          const d = await r.json(); if (d.display_name) label = d.display_name;
        } catch (_) {}
        payload = { bookingLocation: label, bookingLatitude: loc.lat, bookingLongitude: loc.lng };
        setBookingGpsLoading(false);
      } else if (bookingLocMode === "manual") {
        if (!bookingManualAddress.trim()) { toast.error("Please enter an address first."); return; }
        const coords = await geocodeAddress(bookingManualAddress);
        payload = { bookingLocation: bookingManualAddress, bookingLatitude: coords.lat, bookingLongitude: coords.lng };
      }
      const res = await API.post(`/api/bookings/${serviceId}`, payload);
      setConfirmedBooking(res.data);
      toast.success("Booking request sent! Provider will be notified.");
    } catch (err) {
      setBookingGpsLoading(false);
      toast.error(err.message || "Booking failed");
    }
  };

  const handleConfirmClose = () => {
    setConfirmedBooking(null);
    setActiveTab("bookings");
    fetchBookings();
  };

  const deleteBooking = async (id) => {
    if (!confirm("Delete this booking? This cannot be undone.")) return;
    try {
      await API.delete(`/api/bookings/${id}`);
      toast.success("Booking deleted");
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.error || "Cannot delete — booking must be COMPLETED");
    }
  };

  const fetchBookings = async () => {
    try { const res = await API.get("/api/bookings/customer"); setBookings(res.data); }
    catch { toast.error("Failed to load bookings"); }
  };

  const fetchProfile = async () => {
    try { const res = await API.get("/api/customer/profile"); setProfile(res.data); }
    catch { toast.error("Failed to load profile"); }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      await API.put("/api/customer/profile", { name: profile.name, phone: profile.phone, location: profile.location });
      toast.success("Profile updated ✅");
    } catch { toast.error("Update failed"); }
  };

  useEffect(() => {
    if (activeTab === "bookings") fetchBookings();
    if (activeTab === "profile") fetchProfile();
  }, [activeTab]);

  // ── Filtered bookings ──────────────────────────────────────
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (filterService && !b.service?.name?.toLowerCase().includes(filterService.toLowerCase())) return false;
      if (filterProvider && !b.provider?.name?.toLowerCase().includes(filterProvider.toLowerCase())) return false;
      if (filterPriceMin && b.service?.price < parseFloat(filterPriceMin)) return false;
      if (filterPriceMax && b.service?.price > parseFloat(filterPriceMax)) return false;
      return true;
    });
  }, [bookings, filterService, filterProvider, filterPriceMin, filterPriceMax]);

  const handleLocate = async (service) => {
    setMapError(null);
    if (activeMapServiceId === service.id) { setActiveMapServiceId(null); setMyLocation(null); return; }
    const pLat = service.provider?.providerProfile?.latitude;
    const pLng = service.provider?.providerProfile?.longitude;
    if (!pLat || !pLng) {
      setMapError(`Provider "${service.provider?.name}" has not shared their location yet.`);
      setActiveMapServiceId(service.id); return;
    }
    try {
      let loc;
      if (locationMode === "manual") {
        if (!manualAddress.trim()) { toast.error("Enter address first."); setActiveMapServiceId(service.id); return; }
        setGeocoding(true); loc = await geocodeAddress(manualAddress); setGeocoding(false);
      } else { loc = await getLocation(); }
      setMyLocation(loc); setActiveMapServiceId(service.id);
    } catch (err) { setGeocoding(false); setMapError(err.message); setActiveMapServiceId(service.id); }
  };

  const NavButton = ({ tab, label }) => (
    <button className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>
      {label}
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {

      case "explore": return (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Explore Services</h2>
            <ViewModeToggle mode={servicesView} onChange={setServicesView} available={["grid", "list", "card", "compact"]} />
          </div>

          <div className="dashboard-form" style={{ maxWidth: 560, flexDirection: "row", gap: 10, marginBottom: 24 }}>
            <input
              type="text" placeholder="Search services (e.g. Plumbing, AC Repair...)"
              value={keyword} onChange={(e) => setKeyword(e.target.value)} style={{ flex: 1 }}
            />
            <button className="dashboard-btn" onClick={searchServices}>Search</button>
          </div>

          {services.length > 0 && (
            <>
              <div className="location-panel" style={{ marginBottom: 16 }}>
                <div className="location-panel-title">Booking Location</div>
                <div className="location-btns">
                  {[["gps","Current GPS"], ["manual","Enter Address"]].map(([mode, label]) => (
                    <button key={mode} className={`loc-btn${bookingLocMode === mode ? " active" : ""}`}
                      onClick={() => setBookingLocMode(mode)}>{label}</button>
                  ))}
                </div>
                {bookingLocMode === "manual" && (
                  <input type="text" placeholder="Enter address..."
                    value={bookingManualAddress} onChange={(e) => setBookingManualAddress(e.target.value)}
                    style={{ marginTop: 10, width: "100%", padding: "9px 14px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 14, fontFamily: "inherit" }}
                  />
                )}
              </div>
              <div className="location-panel" style={{ marginBottom: 24 }}>
                <div className="location-panel-title">Map Location</div>
                <div className="location-btns">
                  <button className={`loc-btn${locationMode === "auto" ? " active" : ""}`} onClick={() => setLocationMode("auto")}>GPS</button>
                  <button className={`loc-btn${locationMode === "manual" ? " active" : ""}`} onClick={() => setLocationMode("manual")}>Manual</button>
                </div>
                {locationMode === "manual" && (
                  <input type="text" placeholder="Enter your address"
                    value={manualAddress} onChange={(e) => setManualAddress(e.target.value)}
                    style={{ marginTop: 10, width: "100%", padding: "9px 14px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 14, fontFamily: "inherit" }}
                  />
                )}
              </div>
            </>
          )}

          {loadingSearch && <div style={{ textAlign: "center", padding: 32 }}><div className="spinner"/></div>}

          <ViewContainer mode={servicesView}>
            {services.map((s) => (
              <div key={s.id} className="card" style={servicesView === "list" ? { display: "flex", gap: 16, alignItems: "flex-start" } : {}}>
                {servicesView !== "compact" && (
                  <img
                    src={getServiceImage(s.name)}
                    alt={s.name}
                    style={{ width: servicesView === "list" ? 100 : "100%", height: servicesView === "list" ? 80 : 160, objectFit: "cover", borderRadius: 8, marginBottom: 12 }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <h3>{s.name}</h3>
                  {servicesView !== "compact" && <p style={{ color: "var(--text-secondary)", marginBottom: 4 }}>{s.description}</p>}
                  <p style={{ fontSize: 18, fontWeight: 700, color: "#1e293b" }}>₹ {s.price}</p>
                  {servicesView !== "compact" && (
                    <>
                      <hr />
                      <p><strong>Provider:</strong> {s.provider?.name}</p>
                      <p><strong>Location:</strong> {s.provider?.providerProfile?.location || "—"}</p>
                      <p><strong>Rating:</strong> ⭐ {s.provider?.providerProfile?.rating ?? 0}</p>
                    </>
                  )}
                  <div className="card-actions">
                    <button className="dashboard-btn" onClick={() => bookService(s.id)} disabled={bookingGpsLoading}>
                      {bookingGpsLoading ? "Getting GPS..." : "Book Now"}
                    </button>
                    <button onClick={() => handleLocate(s)} disabled={(geoLoading || geocoding) && activeMapServiceId === s.id}
                      style={{ padding: "8px 16px", background: activeMapServiceId === s.id ? "#16a34a" : "#0f766e", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                      {(geoLoading || geocoding) && activeMapServiceId === s.id ? "Locating..." : activeMapServiceId === s.id ? "Hide Map" : "Locate"}
                    </button>
                  </div>
                  {activeMapServiceId === s.id && mapError && <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 8 }}>{mapError}</p>}
                  {activeMapServiceId === s.id && myLocation && !mapError && (
                    <MapView origin={myLocation} destination={{ lat: s.provider.providerProfile.latitude, lng: s.provider.providerProfile.longitude }}
                      originLabel={locationMode === "manual" ? manualAddress || "Your Location" : "Your Location"}
                      destinationLabel={s.provider?.name || "Provider"} />
                  )}
                </div>
              </div>
            ))}
          </ViewContainer>
        </div>
      );

      case "bookings": return (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>My Bookings</h2>
            <ViewModeToggle mode={bookingsView} onChange={setBookingsView} available={["grid", "list", "card", "table"]} />
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24, padding: "16px 20px", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)" }}>
            <input placeholder="Filter by service name" value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 14, minWidth: 180 }} />
            <input placeholder="Filter by provider name" value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 14, minWidth: 180 }} />
            <input type="number" placeholder="Min price ₹" value={filterPriceMin}
              onChange={(e) => setFilterPriceMin(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 14, width: 120 }} />
            <input type="number" placeholder="Max price ₹" value={filterPriceMax}
              onChange={(e) => setFilterPriceMax(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 14, width: 120 }} />
            {(filterService || filterProvider || filterPriceMin || filterPriceMax) && (
              <button onClick={() => { setFilterService(""); setFilterProvider(""); setFilterPriceMin(""); setFilterPriceMax(""); }}
                style={{ padding: "8px 14px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                Clear Filters
              </button>
            )}
          </div>

          {filteredBookings.length === 0 && <p style={{ color: "var(--text-secondary)" }}>No bookings found.</p>}

          <ViewContainer mode={bookingsView}>
            {filteredBookings.map((b) => (
              <div key={b.id} className="card">
                <img src={getServiceImage(b.service?.name)} alt={b.service?.name}
                  style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginBottom: 12 }} />
                <h3>{b.service?.name}</h3>
                <p><strong>Provider:</strong> {b.provider?.name}</p>
                <p><strong>Price:</strong> ₹ {b.service?.price}</p>
                {b.bookingLocation && <p><strong>Location:</strong> {b.bookingLocation}</p>}
                {b.cancellationReason && (
                  <p style={{ color: "#dc2626", fontSize: 13 }}>
                    <strong>Cancelled:</strong> {b.cancellationReason}
                  </p>
                )}
                <hr />
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
                  <span className={`badge ${statusColor(b.status)}`}>{b.status}</span>
                  <span className={`badge ${b.paymentStatus === "PAID" ? "badge-green" : "badge-yellow"}`}>
                    {b.paymentStatus === "PAID" ? "PAID" : "UNPAID"}
                  </span>
                </div>
                <div className="card-actions">
                  {/* Pay button only when COMPLETED */}
                  <RazorpayCheckout booking={b} onSuccess={fetchBookings} />
                  {b.status === "COMPLETED" && (
                    <button onClick={() => setSelectedBooking(b)}
                      style={{ padding: "8px 14px", background: "var(--primary-light)", color: "var(--primary)", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                      Leave Review
                    </button>
                  )}
                  {["PENDING", "ACCEPTED"].includes(b.status) && (
                    <button onClick={() => setCancelBooking(b)}
                      style={{ padding: "8px 14px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                      Cancel
                    </button>
                  )}
                  {b.status === "COMPLETED" && (
                    <button onClick={() => deleteBooking(b.id)}
                      style={{ padding: "8px 14px", background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </ViewContainer>

          {selectedBooking && <ReviewModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} onSuccess={fetchBookings} />}
          {cancelBooking && <CancellationModal booking={cancelBooking} onClose={() => setCancelBooking(null)} onSuccess={fetchBookings} />}
        </div>
      );

      case "profile": return (
        <div className="dashboard-section">
          <div className="section-header"><h2>My Profile</h2></div>

          <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
            <ProfileImageUpload
              currentImage={profileImage}
              onUpdate={(url) => {
                setProfileImage(url);
                const u = JSON.parse(localStorage.getItem("user") || "{}");
                u.profileImage = url;
                localStorage.setItem("user", JSON.stringify(u));
              }}
            />
            <form onSubmit={updateProfile} className="dashboard-form" style={{ flex: 1, maxWidth: 440 }}>
              <input type="text" value={profile.name || ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Full Name" />
              <input type="email" value={profile.email || ""} disabled style={{ opacity: 0.6, cursor: "not-allowed" }} />
              <input type="tel" value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="Phone Number" />
              <input type="text" value={profile.location || ""} onChange={(e) => setProfile({ ...profile, location: e.target.value })} placeholder="Your Location" />
              <button type="submit" className="dashboard-btn">Save Changes</button>
            </form>
          </div>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">ServiceHub</div>
        <NavButton tab="explore" label="Explore Services" />
        <NavButton tab="bookings" label="My Bookings" />
        <NavButton tab="profile" label="My Profile" />
        <button className="logout" onClick={() => { localStorage.clear(); navigate("/"); }}>
          Logout
        </button>
      </aside>
      <main className="dashboard-content">{renderContent()}</main>

      {confirmedBooking && (
        <BookingConfirmModal booking={confirmedBooking} onClose={handleConfirmClose} />
      )}
    </div>
  );
};

export default CustomerDashboard;