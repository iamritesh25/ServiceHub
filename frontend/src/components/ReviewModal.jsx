import { useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const ReviewModal = ({ booking, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submitReview = async () => {
    if (!rating) { toast.error("Please select a star rating."); return; }
    if (!comment.trim()) { toast.error("Please write a comment."); return; }
    setLoading(true);
    try {
      await API.post("/api/reviews", { bookingId: booking.id, rating, comment });
      toast.success("Review submitted! Thank you ⭐");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
      <div style={{ background: "white", borderRadius: 16, padding: 36, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>Leave a Review</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>✕</button>
        </div>

        <p style={{ fontSize: 14, color: "#475569", marginBottom: 20 }}>
          How was your experience with <strong>{booking.provider?.name}</strong> for <strong>{booking.service?.name}</strong>?
        </p>

        {/* Stars */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[1,2,3,4,5].map((star) => (
            <span key={star} onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
              style={{ fontSize: 36, cursor: "pointer", color: star <= (hover || rating) ? "#f59e0b" : "#e2e8f0", transition: "color 0.15s" }}>★</span>
          ))}
        </div>
        {rating > 0 && (
          <p style={{ fontSize: 13, color: "#f59e0b", marginBottom: 16, fontWeight: 600 }}>
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]} — {rating}/5
          </p>
        )}

        <textarea value={comment} onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          style={{ width: "100%", padding: "12px 16px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, fontFamily: "inherit", resize: "vertical", minHeight: 100, outline: "none", boxSizing: "border-box", color: "#1e293b" }}
          onFocus={(e) => e.target.style.borderColor = "#2563eb"} onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={submitReview} disabled={loading}
            style={{ flex: 1, padding: "12px", background: "#2563eb", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Submitting..." : "Submit Review"}
          </button>
          <button onClick={onClose}
            style={{ padding: "12px 18px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
