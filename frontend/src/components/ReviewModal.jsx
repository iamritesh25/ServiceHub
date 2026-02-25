import { useState } from "react";
import API from "../api/axios";

const ReviewModal = ({ booking, onClose }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const submitReview = async () => {
    try {
      await API.post("/api/reviews", {
        bookingId: booking.id,
        rating,
        comment
      });

      alert("Review submitted successfully!");
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || "Error submitting review");
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3>Give Review</h3>

        <div style={{ marginBottom: "15px" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              style={{
                fontSize: "30px",
                cursor: "pointer",
                color: star <= rating ? "gold" : "gray"
              }}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          placeholder="Write your review..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px"
          }}
        />

        <button onClick={submitReview} style={submitBtn}>
          Submit
        </button>

        <button onClick={onClose} style={cancelBtn}>
          Cancel
        </button>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modalStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  width: "400px"
};

const submitBtn = {
  background: "#2563eb",
  color: "white",
  padding: "8px 15px",
  marginRight: "10px",
  border: "none",
  borderRadius: "5px"
};

const cancelBtn = {
  background: "gray",
  color: "white",
  padding: "8px 15px",
  border: "none",
  borderRadius: "5px"
};

export default ReviewModal;