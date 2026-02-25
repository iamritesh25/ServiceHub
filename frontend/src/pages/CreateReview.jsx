import { useState } from "react";
import API from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";

const CreateReview = ({ providerId }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submitReview = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error("Please enter a review comment");
      return;
    }

    try {
      setLoading(true);

      await API.post("/api/reviews", {
        customerId: user.id,
        providerId,
        rating: Number(rating),
        comment,
      });

      toast.success("Review submitted successfully!");
      setComment("");
      setRating(5);
    } catch (err) {
      toast.error("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submitReview}
      style={{
        marginTop: "1.5rem",
        padding: "1rem",
        borderRadius: "12px",
        background: "rgba(255,255,255,0.05)",
      }}
    >
      {/* Star Rating */}
      <div style={{ marginBottom: "1rem" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => setRating(star)}
            style={{
              fontSize: "1.8rem",
              cursor: "pointer",
              color: star <= rating ? "#facc15" : "#555",
              transition: "0.2s ease",
            }}
          >
            ★
          </span>
        ))}
      </div>

      {/* Comment */}
      <input
        className="input"
        placeholder="Write your review..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {/* Submit Button */}
      <button
        className="btn-primary"
        disabled={loading}
        style={{ width: "100%" }}
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
};

export default CreateReview;
