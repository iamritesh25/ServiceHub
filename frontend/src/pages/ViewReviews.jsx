import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const ViewReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/reviews/all");
      setReviews(res.data);
    } catch (error) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: "center" }}>
          <div className="spinner"></div>
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: "2rem" }}>All Reviews</h2>

      {reviews.length === 0 && (
        <div className="card">
          <p>No reviews available yet.</p>
        </div>
      )}

      {reviews.map((review) => (
        <div key={review.id} className="card">
          {/* Rating */}
          <div style={{ marginBottom: "0.5rem" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                style={{
                  fontSize: "1.5rem",
                  color: star <= review.rating ? "#facc15" : "#555",
                }}
              >
                ★
              </span>
            ))}
          </div>

          {/* Comment */}
          <p style={{ marginBottom: "1rem", fontSize: "1rem" }}>
            {review.comment}
          </p>

          {/* Meta Info */}
          <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>
            <p><strong>Customer ID:</strong> {review.customerId}</p>
            <p><strong>Provider ID:</strong> {review.providerId}</p>
            <p><strong>Date:</strong> {review.createdAt?.split("T")[0]}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ViewReviews;
