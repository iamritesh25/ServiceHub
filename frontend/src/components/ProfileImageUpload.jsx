import { useState, useRef, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

/**
 * Resolves a profile image URL to a displayable src.
 *
 * Three cases:
 *  1. blob:  — local preview, use as-is
 *  2. https:// or http:// — external URL (e.g. Google OAuth photo), use as-is
 *  3. /uploads/... — relative backend path, prepend backend base URL
 */
const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("blob:")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // Relative path from our backend
  return `http://localhost:8080${url}`;
};

/**
 * ProfileImageUpload
 * Lets users select and upload a profile image.
 * Handles local uploads (stored in backend) and external OAuth photos (Google).
 */
const ProfileImageUpload = ({ currentImage, onUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);
  const fileRef = useRef();

  // Sync preview whenever the parent passes a new currentImage
  useEffect(() => {
    if (currentImage) {
      setPreview(currentImage);
    }
  }, [currentImage]);

  const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED.includes(file.type)) {
      toast.error("Unsupported file type. Use JPG, PNG, GIF, or WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    // Show instant local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await API.post("/api/auth/profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      storedUser.profileImage = data.imageUrl;
      localStorage.setItem("user", JSON.stringify(storedUser));

      toast.success("Profile photo updated ✅");
      if (onUpdate) onUpdate(data.imageUrl);
    } catch (err) {
      toast.error(err.response?.data?.error || "Upload failed");
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  const resolvedSrc = resolveImageUrl(preview);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div
        onClick={() => !uploading && fileRef.current.click()}
        style={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          overflow: "hidden",
          border: "3px solid var(--primary)",
          cursor: uploading ? "not-allowed" : "pointer",
          position: "relative",
          background: "#f1f5f9",
        }}
      >
        {resolvedSrc ? (
          <img
            src={resolvedSrc}
            alt="Profile"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              // If image fails to load (e.g. broken URL), show fallback
              e.currentTarget.style.display = "none";
              e.currentTarget.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div style={{
          width: "100%", height: "100%", display: resolvedSrc ? "none" : "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 36, color: "var(--text-muted)",
        }}>
          👤
        </div>

        {/* Hover / uploading overlay */}
        <div style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: uploading ? 1 : 0,
          transition: "opacity 0.2s",
          color: "white", fontSize: 13, fontWeight: 600,
        }}
          onMouseEnter={(e) => !uploading && (e.currentTarget.style.opacity = 1)}
          onMouseLeave={(e) => !uploading && (e.currentTarget.style.opacity = 0)}
        >
          {uploading ? "Uploading..." : "Change Photo"}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <button
        onClick={() => fileRef.current.click()}
        disabled={uploading}
        style={{
          padding: "6px 16px",
          background: "transparent",
          border: "1.5px solid var(--primary)",
          color: "var(--primary)",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        {uploading ? "Uploading..." : "Upload Photo"}
      </button>
    </div>
  );
};

export default ProfileImageUpload;