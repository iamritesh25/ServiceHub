import { useState } from "react";
import API from "../api/axios";

const StripeCheckout = ({ booking, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await API.post(
        `/api/payment/create-checkout/${booking.id}`
      );

      window.location.href = data.checkoutUrl;

    } catch (err) {
      setError(err.response?.data?.error || "Payment failed");
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <button
        onClick={handleCheckout}
        disabled={loading}
        style={{
          padding: "9px 18px",
          background: "#16a34a",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "600",
        }}
      >
        {loading ? "Redirecting..." : `💳 Pay ₹${booking.service?.price}`}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default StripeCheckout;