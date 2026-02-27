import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * PaymentSuccess — shown after Razorpay checkout completes.
 * Note: Razorpay payments are now verified inline in RazorpayCheckout,
 * so this page is a simple success confirmation.
 */
const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          navigate("/customer-dashboard");
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#f0fdf4",
    }}>
      <div style={{
        background: "white", borderRadius: 20, padding: "48px 40px",
        textAlign: "center", boxShadow: "0 4px 40px rgba(0,0,0,0.08)",
        maxWidth: 440,
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h2 style={{ color: "#16a34a", marginBottom: 8, fontSize: 28 }}>Payment Successful!</h2>
        <p style={{ color: "#64748b", marginBottom: 24 }}>
          Your payment has been verified and confirmed. A confirmation has been sent to your email.
        </p>
        <p style={{ fontSize: 14, color: "#94a3b8" }}>
          Redirecting to dashboard in {countdown}s...
        </p>
        <button
          onClick={() => navigate("/customer-dashboard")}
          style={{
            marginTop: 24, padding: "12px 32px",
            background: "#16a34a", color: "white",
            border: "none", borderRadius: 10,
            cursor: "pointer", fontWeight: 700, fontSize: 16,
          }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
