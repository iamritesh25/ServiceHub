import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import "../App.css";
import MapView from "../components/MapView";
import CancellationModal from "../components/CancellationModal";
import ProfileImageUpload from "../components/ProfileImageUpload";
import { ViewModeToggle, ViewContainer } from "../components/ViewModeToggle";
import HamburgerSidebar from "../components/HamburgerSidebar";
import useGeolocation from "../hooks/useGeolocation";
import { getServiceImage } from "../utils/serviceImages";

const NAV_ITEMS = [
  { tab: "requests", label: "Customer Requests", icon: "📨" },
  { tab: "services", label: "My Services", icon: "🛠️" },
  { tab: "profile", label: "My Profile", icon: "👤" },
  { tab: "reviews", label: "Reviews", icon: "⭐" },
];

const statusColor = (s) =>
  s === "ACCEPTED" ? "badge-green" :
    s === "REJECTED" ? "badge-red" :
      s === "COMPLETED" ? "badge-blue" :
        s === "CANCELLED" ? "badge-gray" : "badge-yellow";

const formatPrice = (s) => {
  if (!s) return "";
  if (s.priceType === "RANGE" && s.minPrice != null && s.maxPrice != null) {
    return `₹${s.minPrice} – ₹${s.maxPrice}`;
  }
  return `₹ ${s.price ?? s.minPrice ?? 0}`;
};

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("requests");

  const [requests, setRequests] = useState([]);
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ name: "", price: "", description: "", priceType: "FIXED", minPrice: "", maxPrice: "" });
  const [addingService, setAddingService] = useState(false);
  const [profile, setProfile] = useState({ serviceType: "PLUMBING", experience: "", description: "", location: "" });
  const [hasProfile, setHasProfile] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [cancelBooking, setCancelBooking] = useState(null);

  const [profileImage, setProfileImage] = useState(
    JSON.parse(localStorage.getItem("user") || "{}").profileImage || null
  );

  const [requestsView, setRequestsView] = useState("grid");
  const [servicesView, setServicesView] = useState("grid");
  const [reviewsView, setReviewsView] = useState("grid");

  const [filterStatus, setFilterStatus] = useState("");
  const [filterSort, setFilterSort] = useState("DESC");
  const [filterServiceType, setFilterServiceType] = useState("");

  const [activeMapReqId, setActiveMapReqId] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [mapMode, setMapMode] = useState("auto");
  const [manualAddress, setManualAddress] = useState("");
  const { getLocation, loading: geoLoading } = useGeolocation();

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 900);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const serviceTypes = [
    "PLUMBING", "ELECTRICIAN", "CARPENTER", "CLEANING", "PAINTER",
    "AC_REPAIR", "REFRIGERATOR_REPAIR", "WASHING_MACHINE_REPAIR",
    "CCTV_INSTALLATION", "WATER_PURIFIER_SERVICE",
    "BEAUTICIAN", "MAKEUP_ARTIST", "FITNESS_TRAINER", "YOGA_TRAINER", "MASSAGE_THERAPIST",
    "MOBILE_REPAIR", "LAPTOP_REPAIR", "COMPUTER_TECHNICIAN", "WEB_DEVELOPER", "APP_DEVELOPER",
    "HOME_TUTOR", "MUSIC_TEACHER", "DANCE_TEACHER",
    "DRIVER", "PACKERS_MOVERS", "EVENT_PLANNER"
  ];

  const geocodeAddress = async (address) => {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`, { headers: { "Accept-Language": "en" } });
    const data = await res.json();
    if (!data.length) throw new Error("Address not found.");
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  };

  const getCustomerDestination = (req) => {
    if (req.bookingLatitude && req.bookingLongitude) return { lat: req.bookingLatitude, lng: req.bookingLongitude, label: req.bookingLocation || "Booking Location" };
    if (req.customer?.latitude && req.customer?.longitude) return { lat: req.customer.latitude, lng: req.customer.longitude, label: req.customer.location || "Customer Location" };
    return null;
  };

  const fetchRequests = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);
      params.append("sort", filterSort);
      const res = await API.get(`/api/bookings/provider?${params}`);
      setRequests(res.data);
    } catch { toast.error("Failed to load requests"); }
  };

  useEffect(() => {
    if (activeTab === "requests") fetchRequests();
  }, [activeTab, filterStatus, filterSort]);

  const filteredRequests = useMemo(() => {
    let r = requests;
    if (filterServiceType) {
      r = r.filter((req) => req.service?.name?.toUpperCase().includes(filterServiceType.toUpperCase()));
    }
    return r;
  }, [requests, filterServiceType]);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/api/bookings/${id}?status=${status}`);
      toast.success(
        status === "ACCEPTED" ? "Booking accepted! Customer notified." :
          status === "COMPLETED" ? "Job marked as completed. Customer can now pay." :
            "Status updated."
      );
      fetchRequests();
    } catch { toast.error("Failed to update booking"); }
  };

  // Delete allowed for COMPLETED, CANCELLED, REJECTED
  const deleteBooking = async (id) => {
    if (!confirm("Delete this booking?")) return;
    try {
      await API.delete(`/api/bookings/${id}`);
      toast.success("Booking deleted");
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || "Cannot delete this booking");
    }
  };

  const fetchServices = async () => {
    try { const res = await API.get("/api/services/my"); setServices(res.data); }
    catch { toast.error("Failed to load services"); }
  };

  const addService = async (e) => {
    e.preventDefault(); setAddingService(true);
    try {
      const payload = {
        name: newService.name,
        description: newService.description,
        priceType: newService.priceType,
      };
      if (newService.priceType === "RANGE") {
        payload.minPrice = parseFloat(newService.minPrice);
        payload.maxPrice = parseFloat(newService.maxPrice);
      } else {
        payload.price = parseFloat(newService.price);
      }
      await API.post("/api/services", payload);
      toast.success("Service created");
      setNewService({ name: "", price: "", description: "", priceType: "FIXED", minPrice: "", maxPrice: "" });
      fetchServices();
    } catch (err) { toast.error(err.response?.data?.error || "Failed to create service"); }
    finally { setAddingService(false); }
  };

  const deleteService = async (id) => {
    if (!confirm("Delete this service?")) return;
    try { await API.delete(`/api/services/${id}`); toast.success("Service deleted"); fetchServices(); }
    catch { toast.error("Cannot delete — active bookings may exist"); }
  };

  const fetchProfile = async () => {
    try {
      const res = await API.get("/api/provider/profile");
      if (res.data) { setProfile({ ...res.data }); setHasProfile(true); }
    } catch { setHasProfile(false); }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = hasProfile
        ? await API.put("/api/provider/profile", profile)
        : await API.post("/api/provider/profile", profile);
      setProfile(res.data);
      setHasProfile(true);
      toast.success(hasProfile ? "Profile updated" : "Profile created");
    } catch { toast.error("Failed to save profile"); }
  };

  const fetchReviews = async () => {
    try { const res = await API.get("/api/reviews/provider"); setReviews(res.data); }
    catch { toast.error("Failed to load reviews"); }
  };

  useEffect(() => {
    if (activeTab === "services") fetchServices();
    if (activeTab === "profile") fetchProfile();
    if (activeTab === "reviews") fetchReviews();
  }, [activeTab]);

  const handleLocateCustomer = async (req) => {
    if (activeMapReqId === req.id) { setActiveMapReqId(null); setMyLocation(null); return; }
    const dest = getCustomerDestination(req);
    if (!dest) { toast.error("Customer location unavailable"); setActiveMapReqId(req.id); return; }
    try {
      let loc;
      if (mapMode === "manual") {
        if (!manualAddress.trim()) { toast.error("Enter your address first."); setActiveMapReqId(req.id); return; }
        loc = await geocodeAddress(manualAddress);
      } else { loc = await getLocation(); }
      setMyLocation(loc); setActiveMapReqId(req.id);
    } catch (err) { toast.error(err.message || "Location error"); setActiveMapReqId(req.id); }
  };

  const handleLogout = () => { localStorage.clear(); navigate("/"); };

  const renderContent = () => {
    switch (activeTab) {

      case "requests": return (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Customer Requests</h2>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <ViewModeToggle mode={requestsView} onChange={setRequestsView} available={["grid", "list", "card", "table"]} />
              <button className="dashboard-btn" onClick={fetchRequests} style={{ padding: "8px 14px", fontSize: 13 }}>Refresh</button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, padding: "14px 18px", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)" }}>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 14 }}>
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <input placeholder="Filter by service type..." value={filterServiceType}
              onChange={(e) => setFilterServiceType(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 14, minWidth: 180 }} />

            <select value={filterSort} onChange={(e) => setFilterSort(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 14 }}>
              <option value="DESC">Newest First</option>
              <option value="ASC">Oldest First</option>
            </select>

            {(filterStatus || filterServiceType) && (
              <button onClick={() => { setFilterStatus(""); setFilterServiceType(""); }}
                style={{ padding: "8px 14px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                Clear
              </button>
            )}
          </div>

          <div className="location-panel" style={{ marginBottom: 20 }}>
            <div className="location-panel-title">Your location for route map</div>
            <div className="location-btns">
              <button className={`loc-btn${mapMode === "auto" ? " active" : ""}`} onClick={() => setMapMode("auto")}>Use GPS</button>
              <button className={`loc-btn${mapMode === "manual" ? " active" : ""}`} onClick={() => setMapMode("manual")}>Enter Manually</button>
            </div>
            {mapMode === "manual" && (
              <input type="text" placeholder="Your location..."
                value={manualAddress} onChange={(e) => setManualAddress(e.target.value)}
                style={{ marginTop: 10, width: "100%", padding: "9px 14px", borderRadius: 8, border: "1.5px solid var(--border)", fontSize: 14, fontFamily: "inherit" }} />
            )}
          </div>

          {filteredRequests.length === 0 && <p style={{ color: "var(--text-secondary)" }}>No requests found.</p>}

          <ViewContainer mode={requestsView}>
            {filteredRequests.map((req) => {
              const dest = getCustomerDestination(req);
              return (
                <div key={req.id} className="card">
                  <img src={getServiceImage(req.service?.name)} alt={req.service?.name}
                    style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginBottom: 12 }} />
                  <h3>{req.service?.name}</h3>
                  <p><strong>Customer:</strong> {req.customer?.name}</p>
                  <p><strong>Phone:</strong> {req.customer?.phone}</p>
                  <p><strong>Price:</strong> {formatPrice(req.service)}</p>
                  {req.bookingLocation
                    ? <p><strong>Location:</strong> {req.bookingLocation}</p>
                    : req.customer?.location && <p><strong>Customer Location:</strong> {req.customer.location}</p>}
                  {req.cancellationReason && (
                    <p style={{ color: "#dc2626", fontSize: 13 }}><strong>Cancelled:</strong> {req.cancellationReason}</p>
                  )}
                  <hr />
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                    <span className={`badge ${statusColor(req.status)}`}>{req.status}</span>
                    <span className={`badge ${req.paymentStatus === "PAID" ? "badge-green" : "badge-yellow"}`}>{req.paymentStatus}</span>
                  </div>
                  <div className="card-actions" style={{ flexWrap: "wrap" }}>
                    {req.status === "PENDING" && (
                      <>
                        <button className="accept" onClick={() => updateStatus(req.id, "ACCEPTED")}>Accept</button>
                        <button className="reject" onClick={() => updateStatus(req.id, "REJECTED")}>Reject</button>
                      </>
                    )}
                    {req.status === "ACCEPTED" && (
                      <button className="dashboard-btn" onClick={() => updateStatus(req.id, "COMPLETED")}
                        style={{ background: "#0f766e" }}>
                        Mark Completed
                      </button>
                    )}
                    {["PENDING", "ACCEPTED"].includes(req.status) && (
                      <button onClick={() => setCancelBooking(req)}
                        style={{ padding: "7px 14px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                        Cancel
                      </button>
                    )}
                    {/* Delete for COMPLETED, CANCELLED, REJECTED */}
                    {["COMPLETED", "CANCELLED", "REJECTED"].includes(req.status) && (
                      <button onClick={() => deleteBooking(req.id)}
                        style={{ padding: "7px 14px", background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                        Delete
                      </button>
                    )}
                    {dest && (
                      <button onClick={() => handleLocateCustomer(req)} disabled={geoLoading && activeMapReqId === req.id}
                        style={{ padding: "8px 14px", background: activeMapReqId === req.id ? "#16a34a" : "#0f766e", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                        {geoLoading && activeMapReqId === req.id ? "Locating..." : activeMapReqId === req.id ? "Hide Map" : "Route"}
                      </button>
                    )}
                  </div>
                  {activeMapReqId === req.id && myLocation && dest && (
                    <MapView origin={myLocation} destination={dest}
                      originLabel={mapMode === "manual" ? manualAddress : "Your Location"}
                      destinationLabel={dest.label} />
                  )}
                </div>
              );
            })}
          </ViewContainer>
          {cancelBooking && <CancellationModal booking={cancelBooking} onClose={() => setCancelBooking(null)} onSuccess={fetchRequests} />}
        </div>
      );

      case "services": return (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>My Services</h2>
            <ViewModeToggle mode={servicesView} onChange={setServicesView} available={["grid", "list", "card"]} />
          </div>
          <div style={{ background: "white", padding: 28, borderRadius: "var(--radius)", border: "1px solid var(--border)", marginBottom: 32, maxWidth: 540 }}>
            <h3 style={{ marginBottom: 18, fontWeight: 700 }}>Add New Service</h3>
            <form onSubmit={addService} className="dashboard-form">
              <input type="text" placeholder="Service name" value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })} required />
              <textarea placeholder="Description..." value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })} required />

              {/* Price type selector */}
              <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
                  <input type="radio" name="priceType" value="FIXED" checked={newService.priceType === "FIXED"}
                    onChange={() => setNewService({ ...newService, priceType: "FIXED" })} />
                  Fixed Price
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
                  <input type="radio" name="priceType" value="RANGE" checked={newService.priceType === "RANGE"}
                    onChange={() => setNewService({ ...newService, priceType: "RANGE" })} />
                  Price Range
                </label>
              </div>

              {newService.priceType === "FIXED" ? (
                <input type="number" placeholder="Price (₹)" value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: e.target.value })} required min={0} />
              ) : (
                <div style={{ display: "flex", gap: 10 }}>
                  <input type="number" placeholder="Min Price (₹)" value={newService.minPrice}
                    onChange={(e) => setNewService({ ...newService, minPrice: e.target.value })} required min={0} style={{ flex: 1 }} />
                  <input type="number" placeholder="Max Price (₹)" value={newService.maxPrice}
                    onChange={(e) => setNewService({ ...newService, maxPrice: e.target.value })} required min={0} style={{ flex: 1 }} />
                </div>
              )}

              <button type="submit" className="dashboard-btn" disabled={addingService}>
                {addingService ? "Creating..." : "Create Service"}
              </button>
            </form>
          </div>
          <ViewContainer mode={servicesView}>
            {services.map((s) => (
              <div key={s.id} className="card">
                <img src={getServiceImage(s.name)} alt={s.name}
                  style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginBottom: 12 }} />
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                <p style={{ fontSize: 18, fontWeight: 700, marginTop: 8, color: "#2563eb" }}>{formatPrice(s)}</p>
                <div className="card-actions">
                  <button onClick={() => deleteService(s.id)}
                    style={{ padding: "7px 16px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {services.length === 0 && <p style={{ color: "var(--text-secondary)" }}>No services yet.</p>}
          </ViewContainer>
        </div>
      );

      case "profile": return (
        <div className="dashboard-section">
          <div className="section-header"><h2>{hasProfile ? "Update Profile" : "Create Profile"}</h2></div>
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
            <form onSubmit={saveProfile} className="dashboard-form" style={{ flex: 1, maxWidth: 440 }}>
              <select value={profile.serviceType} onChange={(e) => setProfile({ ...profile, serviceType: e.target.value })}>
                {serviceTypes.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
              </select>
              <input type="number" placeholder="Years of experience" value={profile.experience}
                onChange={(e) => setProfile({ ...profile, experience: e.target.value })} required min={0} />
              <input type="text" placeholder="Location (e.g. Kharadi, Pune)" value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })} required />
              <textarea placeholder="Describe your expertise..." value={profile.description}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })} required />
              <button type="submit" className="dashboard-btn">
                {hasProfile ? "Save Changes" : "Create Profile"}
              </button>
            </form>
          </div>
        </div>
      );

      case "reviews": return (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Customer Reviews</h2>
            <ViewModeToggle mode={reviewsView} onChange={setReviewsView} available={["grid", "list", "card"]} />
          </div>
          {reviews.length === 0 && <p style={{ color: "var(--text-secondary)" }}>No reviews yet.</p>}
          <ViewContainer mode={reviewsView}>
            {reviews.map((r) => (
              <div key={r.id} className="card">
                <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} style={{ fontSize: 20, color: s <= r.rating ? "#f59e0b" : "#e2e8f0" }}>★</span>
                  ))}
                </div>
                <p style={{ fontStyle: "italic", color: "var(--text-secondary)" }}>"{r.comment}"</p>
                <hr />
                <p><strong>From:</strong> {r.customerName}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{r.createdAt?.split("T")[0]}</p>
              </div>
            ))}
          </ViewContainer>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--background)" }}>
      <HamburgerSidebar
        navItems={NAV_ITEMS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        logoText="ServiceHub"
        onLogout={handleLogout}
        accentColor="#0f766e"
        onToggle={setSidebarOpen}
      />
      <main
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? 260 : 0,
          padding: sidebarOpen ? "32px 28px" : "68px 28px 32px",
          maxWidth: sidebarOpen ? "calc(100vw - 260px)" : "100vw",
          boxSizing: "border-box",
          overflowX: "hidden",
          transition: "margin-left 0.26s cubic-bezier(0.4,0,0.2,1), max-width 0.26s cubic-bezier(0.4,0,0.2,1)",
        }}
        className="dashboard-content responsive-main"
      >
        {renderContent()}
      </main>
    </div>
  );
};

export default ProviderDashboard;
