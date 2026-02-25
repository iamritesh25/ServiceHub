import { useState } from "react";
import API from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";

const CreateProfile = () => {
  const { user } = useAuth();

  const [form, setForm] = useState({
    serviceType: "PLUMBER",
    experience: "",
    description: "",
    location: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submitProfile = async (e) => {
    e.preventDefault();
    await API.post(`/api/provider/profile?userId=${user.id}`, form);
    toast.success("Profile created successfully!");

  };

  return (
    <div className="container">
      <div className="card">
        <h2>Create Professional Profile</h2>

        <form onSubmit={submitProfile}>
          <select
            name="serviceType"
            className="input"
            onChange={handleChange}
          >
            <option>PLUMBER</option>
            <option>ELECTRICIAN</option>
            <option>CARPENTER</option>
            <option>CLEANER</option>
          </select>

          <input
            name="experience"
            className="input"
            placeholder="Years of Experience"
            onChange={handleChange}
            required
          />

          <input
            name="location"
            className="input"
            placeholder="Location"
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            className="input"
            placeholder="Describe your services"
            onChange={handleChange}
            required
          />

          <button className="btn-primary">Create Profile</button>
        </form>
      </div>
    </div>
  );
};

export default CreateProfile;
