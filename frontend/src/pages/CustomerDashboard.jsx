import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../App.css";
import ReviewModal from "../components/ReviewModal";
import MapView from "../components/MapView";
import StripeCheckout from "../components/StripeCheckout";
import useGeolocation from "../hooks/useGeolocation";

const CustomerDashboard = () => {

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState("explore");
  const [keyword, setKeyword] = useState("");
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // ================= MAP STATE =================
  const [activeMapServiceId, setActiveMapServiceId] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [mapError, setMapError] = useState(null);
  const { getLocation, loading: geoLoading } = useGeolocation();

  // ================= MANUAL LOCATION STATE =================
  const [locationMode, setLocationMode] = useState("auto"); // "auto" | "manual"
  const [manualAddress, setManualAddress] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState(null);

  // ================= SHARE LOCATION STATE =================
  const [locationShared, setLocationShared] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: ""
  });

  // ================= SEARCH =================
  const searchServices = async () => {
    try {
      setLoadingSearch(true);
      const res = await API.get(`/api/services/search?keyword=${keyword}`);
      setServices(res.data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoadingSearch(false);
    }
  };

  // ================= BOOK =================
  const bookService = async (id) => {
    try {
      await API.post(`/api/bookings/${id}`);
      alert("Booking request sent ✅");
    } catch (err) {
      console.error("Booking failed", err);
      alert("Booking failed ❌");
    }
  };

  // ================= BOOKINGS =================
  const fetchBookings = async () => {
    try {
      const res = await API.get("/api/bookings/customer");
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    }
  };

  // ================= PROFILE =================
  const fetchProfile = async () => {
    try {
      const res = await API.get("/api/customer/profile");
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      await API.put("/api/customer/profile", {
        name: profile.name,
        phone: profile.phone,
        location: profile.location
      });
      alert("Profile Updated ✅");
    } catch (err) {
      console.error("Profile update failed", err);
      alert("Profile update failed ❌");
    }
  };

  // ================= SHARE MY LOCATION =================
  const shareMyLocation = async () => {
    setSharingLocation(true);
    try {
      const loc = await getLocation();
      setMyLocation(loc);
      setLocationShared(true);
      alert("✅ Location saved! Providers can now see the route to you.");
    } catch (err) {
      alert("❌ Location access denied. Please allow location in your browser and try again.");
    } finally {
      setSharingLocation(false);
    }
  };

  useEffect(() => {
    if (activeTab === "bookings") fetchBookings();
    if (activeTab === "profile") fetchProfile();
  }, [activeTab]);

  // ================= LIVE SEARCH (DEBOUNCE) =================
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (keyword.trim() !== "") {
        searchServices();
      } else {
        setServices([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [keyword]);

  // ================= GEOCODE ADDRESS → LAT/LNG =================
  const geocodeAddress = async (address) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
      // Fallback: use OpenStreetMap Nominatim (free, no key)
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data = await res.json();
      if (data.length === 0) throw new Error("Address not found. Try a more specific address.");
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }

    // Use Google Geocoding API if key is set
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== "OK" || data.results.length === 0) {
      throw new Error("Address not found. Try a more specific address.");
    }
    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };
  };

  // ================= LOCATE PROVIDER =================
  const handleLocate = async (service) => {
    setMapError(null);
    setGeocodeError(null);

    // Toggle off if same service clicked again
    if (activeMapServiceId === service.id) {
      setActiveMapServiceId(null);
      setMyLocation(null);
      return;
    }

    // Check provider has saved coordinates
    const providerLat = service.provider?.providerProfile?.latitude;
    const providerLng = service.provider?.providerProfile?.longitude;

    if (!providerLat || !providerLng) {
      setMapError(`Provider "${service.provider?.name}" has not shared their location yet.`);
      setActiveMapServiceId(service.id);
      return;
    }

    try {
      let loc;
      if (locationMode === "manual") {
        if (!manualAddress.trim()) {
          setGeocodeError("Please enter your address first.");
          setActiveMapServiceId(service.id);
          return;
        }
        setGeocoding(true);
        loc = await geocodeAddress(manualAddress);
        setGeocoding(false);
      } else {
        loc = await getLocation();
      }
      setMyLocation(loc);
      setActiveMapServiceId(service.id);
    } catch (err) {
      setGeocoding(false);
      setMapError(err.message);
      setActiveMapServiceId(service.id);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const renderContent = () => {

    switch (activeTab) {

      case "explore":
        return (
          <div className="dashboard-section">
            <h2>Explore Services</h2>

            <div className="dashboard-form">
              <input
                type="text"
                placeholder="Search services..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <button onClick={searchServices} className="dashboard-btn">
                Search
              </button>
            </div>

            {loadingSearch && <p style={{ marginTop: "20px" }}>Searching...</p>}

            {!loadingSearch && services.length === 0 && keyword !== "" && (
              <p style={{ marginTop: "20px", color: "#64748b" }}>No services found</p>
            )}

            {/* ── LOCATION MODE TOGGLE ── */}
            {services.length > 0 && (
              <div style={{
                margin: "20px 0",
                padding: "14px 18px",
                background: "#f8fafc",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
              }}>
                <p style={{ margin: "0 0 10px 0", fontWeight: "600", color: "#1e293b", fontSize: "14px" }}>
                  📍 Your location for route calculation:
                </p>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => { setLocationMode("auto"); setGeocodeError(null); }}
                    style={{
                      padding: "7px 16px",
                      background: locationMode === "auto" ? "#2563eb" : "#e2e8f0",
                      color: locationMode === "auto" ? "white" : "#374151",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    📡 Use Current Location
                  </button>
                  <button
                    onClick={() => { setLocationMode("manual"); setGeocodeError(null); }}
                    style={{
                      padding: "7px 16px",
                      background: locationMode === "manual" ? "#2563eb" : "#e2e8f0",
                      color: locationMode === "manual" ? "white" : "#374151",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    ✏️ Enter Location Manually
                  </button>
                </div>

                {locationMode === "manual" && (
                  <div style={{ marginTop: "12px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <input
                      type="text"
                      placeholder="Enter your address (e.g. Koregaon Park, Pune)"
                      value={manualAddress}
                      onChange={(e) => setManualAddress(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        fontSize: "14px",
                        minWidth: "200px",
                      }}
                    />
                    {geocodeError && (
                      <p style={{ color: "#dc2626", fontSize: "13px", margin: "4px 0 0 0", width: "100%" }}>
                        ⚠️ {geocodeError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="services-grid">
              {services.map((s) => (
                <div key={s.id} className="card">
                  <h3>{s.name}</h3>

                  <p><strong>Description:</strong> {s.description}</p>
                  <p><strong>Price:</strong> ₹ {s.price}</p>

                  <hr />

                  <p><strong>Provider:</strong> {s.provider?.name || "Not Available"}</p>
                  <p><strong>Phone:</strong> {s.provider?.phone || "Not Available"}</p>
                  <p>
                    <strong>Location:</strong>{" "}
                    {s.provider?.providerProfile?.location || "Not Updated"}
                  </p>
                  <p>
                    <strong>Rating:</strong>{" "}
                    ⭐ {s.provider?.providerProfile?.rating ?? 0}
                  </p>

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                    <button
                      className="dashboard-btn"
                      onClick={() => bookService(s.id)}
                    >
                      Book Now
                    </button>

                    <button
                      className="dashboard-btn"
                      onClick={() => handleLocate(s)}
                      style={{ background: activeMapServiceId === s.id ? "#16a34a" : "#0f766e" }}
                      disabled={(geoLoading || geocoding) && activeMapServiceId === s.id}
                    >
                      {(geoLoading || geocoding) && activeMapServiceId === s.id
                        ? "Locating..."
                        : activeMapServiceId === s.id
                        ? "Hide Map"
                        : "📍 Locate"}
                    </button>
                  </div>

                  {/* Map error for this card */}
                  {activeMapServiceId === s.id && mapError && (
                    <div style={{ marginTop: "12px", color: "#dc2626", fontSize: "14px" }}>
                      ⚠️ {mapError}
                    </div>
                  )}

                  {/* Embedded Map */}
                  {activeMapServiceId === s.id && myLocation && !mapError && (
                    <MapView
                      origin={myLocation}
                      destination={{
                        lat: s.provider.providerProfile.latitude,
                        lng: s.provider.providerProfile.longitude,
                      }}
                      originLabel={locationMode === "manual" ? manualAddress || "Your Location" : "Your Location"}
                      destinationLabel={s.provider?.name || "Provider"}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "bookings":
        return (
          <div className="dashboard-section">
            <h2>My Bookings</h2>

            <div className="services-grid">
              {bookings.map((b) => (
                <div key={b.id} className="card">
                  <h3>{b.service?.name}</h3>

                  <p><strong>Customer:</strong> {b.customer?.name}</p>
                  <p><strong>Provider:</strong> {b.provider?.name}</p>
                  <p><strong>Price:</strong> ₹ {b.service?.price}</p>
                  <p><strong>Provider Phone:</strong> {b.provider?.phone}</p>

                  <hr />

                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      style={{
                        color:
                          b.status === "ACCEPTED" ? "green"
                          : b.status === "REJECTED" ? "red"
                          : "#f59e0b"
                      }}
                    >
                      {b.status}
                    </span>
                  </p>

                  {/* Payment Status Badge */}
                  <p>
                    <strong>Payment:</strong>{" "}
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 10px",
                        borderRadius: "999px",
                        fontSize: "13px",
                        fontWeight: "600",
                        background: b.paymentStatus === "PAID" ? "#dcfce7" : "#fef9c3",
                        color: b.paymentStatus === "PAID" ? "#16a34a" : "#92400e",
                      }}
                    >
                      {b.paymentStatus === "PAID" ? "✅ PAID" : "⏳ UNPAID"}
                    </span>
                  </p>

                  {/* Pay Now Button — only if ACCEPTED and not yet PAID */}
                  {b.status === "ACCEPTED" && b.paymentStatus !== "PAID" && (
                    <StripeCheckout booking={b} onSuccess={fetchBookings} />
                  )}

                  {/* Give Review Button */}
                  {b.status === "ACCEPTED" && (
                    <button
                      onClick={() => setSelectedBooking(b)}
                      style={{
                        marginTop: "10px",
                        padding: "8px 14px",
                        backgroundColor: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "block",
                      }}
                    >
                      Give Review
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Review Modal */}
            {selectedBooking && (
              <ReviewModal
                booking={selectedBooking}
                onClose={() => setSelectedBooking(null)}
              />
            )}
          </div>
        );

      case "profile":
        return (
          <div className="dashboard-section">
            <h2>My Profile</h2>

            <form onSubmit={updateProfile} className="dashboard-form">
              <input
                type="text"
                value={profile.name || ""}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Name"
              />
              <input
                type="email"
                value={profile.email || ""}
                disabled
              />
              <input
                type="text"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="Phone Number"
              />
              <input
                type="text"
                value={profile.location || ""}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="Location"
              />
              <button className="dashboard-btn">Update Profile</button>
            </form>

            {/* ================= SHARE MY LOCATION ================= */}
            <div style={{
              marginTop: "30px",
              padding: "20px",
              background: locationShared ? "#f0fdf4" : "#eff6ff",
              borderRadius: "12px",
              border: `1px solid ${locationShared ? "#86efac" : "#bfdbfe"}`,
            }}>
              <h3 style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#1e293b" }}>
                📍 Share Your GPS Location
              </h3>
              <p style={{ margin: "0 0 14px 0", fontSize: "14px", color: "#64748b", lineHeight: "1.5" }}>
                Providers need your GPS coordinates to see the route to you.
                Click the button below — your browser will ask for location permission. Click <strong>Allow</strong>.
              </p>

              {locationShared && (
                <div style={{
                  padding: "8px 14px",
                  background: "#dcfce7",
                  borderRadius: "8px",
                  color: "#16a34a",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "12px",
                }}>
                  ✅ Location saved! Providers can now see the route to you.
                </div>
              )}

              <button
                onClick={shareMyLocation}
                disabled={sharingLocation}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: locationShared ? "#16a34a" : "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: sharingLocation ? "not-allowed" : "pointer",
                  opacity: sharingLocation ? 0.7 : 1,
                }}
              >
                {sharingLocation
                  ? "📡 Saving your location..."
                  : locationShared
                  ? "🔄 Update My Location"
                  : "📍 Share My Location"}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <h3>Customer Panel</h3>
        <button onClick={() => setActiveTab("explore")}>Explore Services</button>
        <button onClick={() => setActiveTab("bookings")}>My Bookings</button>
        <button onClick={() => setActiveTab("profile")}>My Profile</button>
        <button onClick={handleLogout} className="logout">Logout</button>
      </aside>

      <main className="dashboard-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default CustomerDashboard;
