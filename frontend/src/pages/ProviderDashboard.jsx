import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../App.css";
import MapView from "../components/MapView";
import useGeolocation from "../hooks/useGeolocation";

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("create");
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(false);

  // ================= MAP STATE =================
  const [activeMapRequestId, setActiveMapRequestId] = useState(null);
  const [myProviderLocation, setMyProviderLocation] = useState(null);
  const [providerMapError, setProviderMapError] = useState(null);
  const { getLocation: getProviderLocation, loading: providerGeoLoading } = useGeolocation();

  // ================= MANUAL LOCATION STATE (PROVIDER) =================
  const [providerLocationMode, setProviderLocationMode] = useState("auto"); // "auto" | "manual"
  const [providerManualAddress, setProviderManualAddress] = useState("");
  const [providerGeocoding, setProviderGeocoding] = useState(false);
  const [providerGeocodeError, setProviderGeocodeError] = useState(null);

  // ================= SHARE LOCATION STATE =================
  const [locationShared, setLocationShared] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(false);

  const [newService, setNewService] = useState({ name: "", price: "", description: "" });

  const [profile, setProfile] = useState({
    serviceType: "",
    experience: "",
    description: "",
    location: "",
  });

  // ================= TAB SWITCH =================
  useEffect(() => {
    if (activeTab === "services") fetchServices();
    if (activeTab === "requests") fetchRequests();
    if (activeTab === "profile") fetchProfile();
    if (activeTab === "reviews") fetchReviews();
  }, [activeTab]);

  // ================= FETCH SERVICES =================
  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/services/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(res.data);
    } catch (error) {
      console.error("Failed to fetch services", error);
    } finally {
      setLoading(false);
    }
  };

  // ================= CREATE SERVICE =================
  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      await API.post("/api/services", newService, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Service Created Successfully ✅");
      setNewService({ name: "", price: "", description: "" });
      setActiveTab("services");
    } catch (error) {
      console.error("Service creation failed", error);
      alert("Failed to create service ❌");
    }
  };

  // ================= FETCH REQUESTS =================
  const fetchRequests = async () => {
    try {
      const res = await API.get("/api/bookings/provider", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  // ================= UPDATE STATUS =================
  const updateRequestStatus = async (id, status) => {
    try {
      await API.put(
        `/api/bookings/${id}?status=${status}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRequests();
    } catch (err) {
      console.error("Failed to update request", err);
    }
  };

  // ================= FETCH REVIEWS =================
  const fetchReviews = async () => {
    try {
      const res = await API.get("/api/reviews/provider", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(res.data);
      if (res.data.length > 0) {
        const avg = res.data.reduce((sum, r) => sum + r.rating, 0) / res.data.length;
        setAverageRating(avg.toFixed(1));
      } else {
        setAverageRating(0);
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    }
  };

  // ================= FETCH PROFILE =================
  const fetchProfile = async () => {
    try {
      const res = await API.get("/api/provider/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile({
        serviceType: res.data.serviceType || "",
        experience: res.data.experience || "",
        description: res.data.description || "",
        location: res.data.location || "",
      });
    } catch (error) {
      console.error("Failed to fetch profile", error);
    }
  };

  // ================= UPDATE PROFILE =================
  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      await API.put("/api/provider/profile", profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Profile Updated Successfully ✅");
    } catch (error) {
      console.error("Profile update failed", error);
      alert("Failed to update profile ❌");
    }
  };

  // ================= DELETE SERVICE =================
  const deleteService = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this service?");
    if (!confirmDelete) return;
    try {
      await API.delete(`/api/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Service deleted successfully ✅");
      fetchServices();
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete service ❌");
    }
  };

  // ================= SHARE MY LOCATION =================
  const shareMyLocation = async () => {
    setSharingLocation(true);
    try {
      const loc = await getProviderLocation();
      setMyProviderLocation(loc);
      setLocationShared(true);
      alert("✅ Location saved! Customers can now see the route to you.");
    } catch (err) {
      alert("❌ Location access denied. Please allow location in your browser and try again.");
    } finally {
      setSharingLocation(false);
    }
  };

  // ================= GEOCODE ADDRESS =================
  const geocodeAddress = async (address) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data = await res.json();
      if (data.length === 0) throw new Error("Address not found. Try a more specific address.");
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== "OK" || data.results.length === 0) {
      throw new Error("Address not found. Try a more specific address.");
    }
    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };
  };

  // ================= LOCATE CUSTOMER =================
  const handleLocateCustomer = async (request) => {
    setProviderMapError(null);
    setProviderGeocodeError(null);

    if (activeMapRequestId === request.id) {
      setActiveMapRequestId(null);
      setMyProviderLocation(null);
      return;
    }

    const customerLat = request.customer?.latitude;
    const customerLng = request.customer?.longitude;

    if (!customerLat || !customerLng) {
      setProviderMapError(`Customer "${request.customer?.name}" has not shared their location yet.`);
      setActiveMapRequestId(request.id);
      return;
    }

    try {
      let loc;
      if (providerLocationMode === "manual") {
        if (!providerManualAddress.trim()) {
          setProviderGeocodeError("Please enter your address first.");
          setActiveMapRequestId(request.id);
          return;
        }
        setProviderGeocoding(true);
        loc = await geocodeAddress(providerManualAddress);
        setProviderGeocoding(false);
      } else {
        loc = await getProviderLocation();
      }
      setMyProviderLocation(loc);
      setActiveMapRequestId(request.id);
    } catch (err) {
      setProviderGeocoding(false);
      setProviderMapError(err.message);
      setActiveMapRequestId(request.id);
    }
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // ================= RENDER =================
  const renderContent = () => {
    switch (activeTab) {

      case "create":
        return (
          <div className="dashboard-section">
            <h2>Create Service</h2>
            <form onSubmit={handleCreateService} className="dashboard-form">
              <input
                type="text"
                placeholder="Service Name"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                required
              />
              <button type="submit" className="dashboard-btn">Add Service</button>
            </form>
          </div>
        );

      case "services":
        return (
          <div className="dashboard-section">
            <h2>My Services</h2>
            {loading ? (
              <p>Loading services...</p>
            ) : services.length === 0 ? (
              <p>No services created yet.</p>
            ) : (
              <div className="services-grid">
                {services.map((s) => (
                  <div key={s.id} className="card" style={{ position: "relative" }}>
                    <button
                      onClick={() => deleteService(s.id)}
                      title="Delete Service"
                      style={{
                        position: "absolute", top: "12px", right: "12px",
                        background: "transparent", border: "none",
                        fontSize: "18px", cursor: "pointer", color: "#dc2626"
                      }}
                    >
                      🗑️
                    </button>
                    <h3 style={{ marginBottom: "10px", color: "#2563eb" }}>{s.name}</h3>
                    <p><strong>Price:</strong> ₹ {s.price}</p>
                    <p style={{ marginTop: "8px" }}><strong>Description:</strong> {s.description}</p>
                    <hr style={{ margin: "15px 0", opacity: 0.2 }} />
                    <p><strong>Provider:</strong> {s.provider?.name || "N/A"}</p>
                    <p>
                      <strong>Experience:</strong>{" "}
                      {s.provider?.providerProfile?.experience
                        ? `${s.provider.providerProfile.experience} Years`
                        : "Not Updated"}
                    </p>
                    <p>
                      <strong>Location:</strong>{" "}
                      {s.provider?.providerProfile?.location || "Not Updated"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "requests":
        return (
          <div className="dashboard-section">
            <h2>Customer Requests</h2>

            {/* ── PROVIDER LOCATION MODE TOGGLE ── */}
            {requests.length > 0 && (
              <div style={{
                marginBottom: "20px",
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
                    onClick={() => { setProviderLocationMode("auto"); setProviderGeocodeError(null); }}
                    style={{
                      padding: "7px 16px",
                      background: providerLocationMode === "auto" ? "#2563eb" : "#e2e8f0",
                      color: providerLocationMode === "auto" ? "white" : "#374151",
                      border: "none", borderRadius: "6px",
                      cursor: "pointer", fontWeight: "600", fontSize: "13px",
                    }}
                  >
                    📡 Use Current Location
                  </button>
                  <button
                    onClick={() => { setProviderLocationMode("manual"); setProviderGeocodeError(null); }}
                    style={{
                      padding: "7px 16px",
                      background: providerLocationMode === "manual" ? "#2563eb" : "#e2e8f0",
                      color: providerLocationMode === "manual" ? "white" : "#374151",
                      border: "none", borderRadius: "6px",
                      cursor: "pointer", fontWeight: "600", fontSize: "13px",
                    }}
                  >
                    ✏️ Enter Location Manually
                  </button>
                </div>

                {providerLocationMode === "manual" && (
                  <div style={{ marginTop: "12px" }}>
                    <input
                      type="text"
                      placeholder="Enter your address (e.g. Baner, Pune)"
                      value={providerManualAddress}
                      onChange={(e) => setProviderManualAddress(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    />
                    {providerGeocodeError && (
                      <p style={{ color: "#dc2626", fontSize: "13px", margin: "4px 0 0 0" }}>
                        ⚠️ {providerGeocodeError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {requests.length === 0 ? (
              <p>No customer requests yet.</p>
            ) : (
              requests.map((r) => (
                <div key={r.id} className="card">
                  <h3>{r.service?.name}</h3>
                  <p><strong>Description:</strong> {r.service?.description}</p>
                  <p><strong>Customer:</strong> {r.customer?.name}</p>
                  <p><strong>Phone:</strong> {r.customer?.phone}</p>
                  <p><strong>Location:</strong> {r.customer?.location}</p>
                  <p><strong>Status:</strong> {r.status}</p>

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
                        background: r.paymentStatus === "PAID" ? "#dcfce7" : "#fef9c3",
                        color: r.paymentStatus === "PAID" ? "#16a34a" : "#92400e",
                      }}
                    >
                      {r.paymentStatus === "PAID" ? "✅ PAID — Payment Received" : "⏳ UNPAID"}
                    </span>
                  </p>

                  {/* Locate Customer Button */}
                  <button
                    onClick={() => handleLocateCustomer(r)}
                    style={{
                      marginTop: "10px",
                      padding: "8px 14px",
                      backgroundColor: activeMapRequestId === r.id ? "#16a34a" : "#0f766e",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                    disabled={(providerGeoLoading || providerGeocoding) && activeMapRequestId === r.id}
                  >
                    {(providerGeoLoading || providerGeocoding) && activeMapRequestId === r.id
                      ? "Locating..."
                      : activeMapRequestId === r.id
                      ? "Hide Map"
                      : "📍 Locate Customer"}
                  </button>

                  {/* Map error */}
                  {activeMapRequestId === r.id && providerMapError && (
                    <div style={{ marginTop: "10px", color: "#dc2626", fontSize: "14px" }}>
                      ⚠️ {providerMapError}
                    </div>
                  )}

                  {/* Embedded Map */}
                  {activeMapRequestId === r.id && myProviderLocation && !providerMapError && (
                    <MapView
                      origin={myProviderLocation}
                      destination={{ lat: r.customer.latitude, lng: r.customer.longitude }}
                      originLabel={providerLocationMode === "manual" ? providerManualAddress || "Your Location" : "Your Location"}
                      destinationLabel={r.customer?.name || "Customer"}
                    />
                  )}

                  {r.status === "PENDING" && (
                    <div className="card-actions">
                      <button
                        className="accept"
                        onClick={() => updateRequestStatus(r.id, "ACCEPTED")}
                      >
                        Accept
                      </button>
                      <button
                        className="reject"
                        onClick={() => updateRequestStatus(r.id, "REJECTED")}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        );

      case "reviews":
        return (
          <div className="dashboard-section">
            <h2>My Reviews</h2>

            <div style={{
              marginBottom: "30px", padding: "12px 18px",
              background: "#f8fafc", borderRadius: "8px",
              display: "inline-block", fontWeight: "600"
            }}>
              <span style={{ fontSize: "16px", marginRight: "10px" }}>Average Rating:</span>
              <div style={{ fontSize: "22px", color: "#facc15" }}>
                {"★".repeat(Math.round(averageRating))}
                {"☆".repeat(5 - Math.round(averageRating))}
                <span style={{ fontSize: "16px", marginLeft: "8px", color: "#111" }}>{averageRating}</span>
              </div>
              <span style={{ marginLeft: "8px", color: "#64748b" }}>({reviews.length} reviews)</span>
            </div>

            {reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              <div className="services-grid">
                {reviews.map((r) => (
                  <div key={r.id} className="card">
                    <h4>Customer: {r.customerName}</h4>
                    <div style={{ color: "#facc15", fontSize: "22px", margin: "10px 0" }}>
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </div>
                    <p style={{ marginTop: "10px" }}>{r.comment}</p>
                    <small style={{ color: "#64748b" }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "profile":
        return (
          <div className="dashboard-section">
            <h2>My Profile</h2>

            <form onSubmit={updateProfile} className="dashboard-form">
              <select
                value={profile.serviceType}
                onChange={(e) => setProfile({ ...profile, serviceType: e.target.value })}
                required
              >
                <option value="">Select Service Type</option>
                <option value="PLUMBING">Plumbing</option>
                <option value="ELECTRICIAN">Electrician</option>
                <option value="CARPENTER">Carpenter</option>
                <option value="CLEANING">Cleaning</option>
                <option value="PAINTER">Painter</option>
                <option value="AC_REPAIR">AC Repair</option>
                <option value="REFRIGERATOR_REPAIR">Refrigerator Repair</option>
                <option value="WASHING_MACHINE_REPAIR">Washing Machine Repair</option>
                <option value="CCTV_INSTALLATION">CCTV Installation</option>
                <option value="WATER_PURIFIER_SERVICE">Water Purifier Service</option>
                <option value="BEAUTICIAN">Beautician</option>
                <option value="MAKEUP_ARTIST">Makeup Artist</option>
                <option value="FITNESS_TRAINER">Fitness Trainer</option>
                <option value="YOGA_TRAINER">Yoga Trainer</option>
                <option value="MASSAGE_THERAPIST">Massage Therapist</option>
                <option value="MOBILE_REPAIR">Mobile Repair</option>
                <option value="LAPTOP_REPAIR">Laptop Repair</option>
                <option value="COMPUTER_TECHNICIAN">Computer Technician</option>
                <option value="WEB_DEVELOPER">Web Developer</option>
                <option value="APP_DEVELOPER">App Developer</option>
                <option value="HOME_TUTOR">Home Tutor</option>
                <option value="MUSIC_TEACHER">Music Teacher</option>
                <option value="DANCE_TEACHER">Dance Teacher</option>
                <option value="DRIVER">Driver</option>
                <option value="PACKERS_MOVERS">Packers & Movers</option>
                <option value="EVENT_PLANNER">Event Planner</option>
              </select>

              <input
                type="number"
                placeholder="Experience (Years)"
                value={profile.experience}
                onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={profile.description}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                required
              />
              <button type="submit" className="dashboard-btn">Update Profile</button>
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
                Customers need your GPS coordinates to see the route to you.
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
                  ✅ Location saved! Customers can now see the route to you.
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
        <h3>Provider Panel</h3>
        <button onClick={() => setActiveTab("create")}>Create Service</button>
        <button onClick={() => setActiveTab("services")}>My Services</button>
        <button onClick={() => setActiveTab("requests")}>Customer Requests</button>
        <button onClick={() => setActiveTab("reviews")}>My Reviews</button>
        <button onClick={() => setActiveTab("profile")}>My Profile</button>
        <button onClick={handleLogout} className="logout">Logout</button>
      </aside>

      <main className="dashboard-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default ProviderDashboard;
