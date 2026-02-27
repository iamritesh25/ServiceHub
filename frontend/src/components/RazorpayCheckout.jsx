import { useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

/**
 * RazorpayCheckout — replaces StripeCheckout
 * Shows "Pay Now" button only when booking.status === "COMPLETED"
 * Loads Razorpay checkout SDK dynamically and verifies signature on backend.
 */
const RazorpayCheckout = ({ booking, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  // Only show if status is COMPLETED and not already paid
  if (booking.status !== "COMPLETED" || booking.paymentStatus === "PAID") {
    return null;
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    setLoading(true);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Failed to load Razorpay. Check your network connection.");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Create Razorpay order on backend
      const { data } = await API.post(`/api/payment/create-order/${booking.id}`);

      // Step 2: Open Razorpay checkout popup
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "ServiceHub",
        description: data.serviceName,
        order_id: data.orderId,
        handler: async (response) => {
          // Step 3: Verify payment on backend
          try {
            await API.post("/api/payment/verify", {
              bookingId: booking.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("✅ Payment successful!");
            if (onSuccess) onSuccess();
          } catch (err) {
            toast.error(err.response?.data?.error || "Payment verification failed");
          }
        },
        prefill: {
          name: booking.customer?.name || "",
          email: booking.customer?.email || "",
          contact: booking.customer?.phone || "",
        },
        theme: { color: "#0f766e" },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled");
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 10 }}>
      <button
        onClick={handlePay}
        disabled={loading}
        style={{
          padding: "9px 18px",
          background: loading ? "#9ca3af" : "#16a34a",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 600,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {loading ? (
          <>
            <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            Processing...
          </>
        ) : (
          `Pay ₹${booking.service?.price}`
        )}
      </button>
    </div>
  );
};

export default RazorpayCheckout;
