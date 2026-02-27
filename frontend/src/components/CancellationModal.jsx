import { useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

/**
 * CancellationModal
 * Shows a modal for cancelling a booking with a required reason field.
 */
const CancellationModal = ({ booking, onClose, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }
    setLoading(true);
    try {
      await API.post(`/api/bookings/${booking.id}/cancel`, { reason });
      toast.success("Booking cancelled");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || "Cancellation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <h3 style={{ marginBottom: 8, color: "var(--danger)" }}>Cancel Booking</h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: 16, fontSize: 14 }}>
          Please provide a reason for cancelling <strong>{booking.service?.name}</strong>.
        </p>
        <textarea
          placeholder="Reason for cancellation (required)..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 8,
            border: "1.5px solid var(--border)", fontSize: 14,
            fontFamily: "inherit", resize: "vertical", marginBottom: 16,
          }}
        />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 20px", background: "var(--surface)",
              border: "1.5px solid var(--border)", borderRadius: 8,
              cursor: "pointer", fontWeight: 600,
            }}
          >
            Keep Booking
          </button>
          <button
            onClick={handleCancel}
            disabled={loading || !reason.trim()}
            style={{
              padding: "9px 20px",
              background: loading || !reason.trim() ? "#9ca3af" : "#dc2626",
              color: "white", border: "none", borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer", fontWeight: 600,
            }}
          >
            {loading ? "Cancelling..." : "Confirm Cancellation"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancellationModal;
