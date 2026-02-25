import { useEffect, useState } from "react";
import API from "../api/axios";
import CreateReview from "./CreateReview";

const Loader = () => (
  <div style={{ textAlign: "center", padding: "2rem" }}>
    <div className="spinner"></div>
  </div>
);
const SearchProviders = () => {
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await API.get("/api/providers");
      setProviders(res.data);
    };
    fetchProviders();
  }, []);

  return (
    <div className="container">
      <h2 style={{ marginBottom: "2rem" }}>Available Service Providers</h2>

      {providers.map((p) => (
        <div key={p.id} className="card">
          <h3>{p.userName}</h3>
          <p><strong>Service:</strong> {p.serviceType}</p>
          <p><strong>Location:</strong> {p.location}</p>
          <p><strong>Experience:</strong> {p.experience} years</p>
          <p><strong>Rating:</strong> ⭐ {p.rating}</p>

          <CreateReview providerId={p.id} />
        </div>
      ))}
    </div>
  );
};

export default SearchProviders;
