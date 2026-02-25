import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api/axios";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const bookingId = params.get("bookingId");

  useEffect(() => {
    if (bookingId) {
      API.post(`/api/payment/confirm/${bookingId}`);
    }
  }, [bookingId]);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>✅ Payment Successful</h2>
      <p>Your booking has been marked as PAID.</p>
    </div>
  );
};

export default PaymentSuccess;