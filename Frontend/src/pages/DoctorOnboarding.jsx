import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";

export default function DoctorOnboarding() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    specialization: "",
    qualification: "",
    registrationNumber: "",
    experience: "",
    hospital: "",
    clinic: "",
    city: "",
    address: "",
    consultationFee: "",
    languages: "",
    consultationModes: ["video", "text"],
    bio: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleMode = (mode) => {
    setForm((prev) => {
      const exists =
        prev.consultationModes.includes(mode);

      return {
        ...prev,
        consultationModes: exists
          ? prev.consultationModes.filter(
              (item) => item !== mode
            )
          : [...prev.consultationModes, mode],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post("/doctors/profile", {
        ...form,

        experience: Number(form.experience),

        consultationFee:
          Number(form.consultationFee) || 0,

        languages: form.languages
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });

      toast.success(
        "Profile submitted for verification"
      );

      navigate("/doctor-dashboard");
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to create doctor profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doctor-onboarding">
      <div className="doctor-form-container">

        <h1>Doctor Onboarding</h1>

        <p>
          Complete your professional information
          to join DermaDetect AI.
        </p>

        <form onSubmit={handleSubmit}>

          <input
            name="specialization"
            placeholder="Specialization e.g. Dermatologist"
            value={form.specialization}
            onChange={handleChange}
            required
          />

          <input
            name="qualification"
            placeholder="Qualification e.g. MBBS, MD"
            value={form.qualification}
            onChange={handleChange}
            required
          />

          <input
            name="registrationNumber"
            placeholder="Medical Registration Number"
            value={form.registrationNumber}
            onChange={handleChange}
            required
          />

          <input
            name="experience"
            type="number"
            min="0"
            placeholder="Years of experience"
            value={form.experience}
            onChange={handleChange}
            required
          />

          <input
            name="hospital"
            placeholder="Hospital"
            value={form.hospital}
            onChange={handleChange}
          />

          <input
            name="clinic"
            placeholder="Clinic"
            value={form.clinic}
            onChange={handleChange}
          />

          <input
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            required
          />

          <input
            name="address"
            placeholder="Clinic / Hospital address"
            value={form.address}
            onChange={handleChange}
          />

          <input
            name="consultationFee"
            type="number"
            min="0"
            placeholder="Consultation fee"
            value={form.consultationFee}
            onChange={handleChange}
          />

          <input
            name="languages"
            placeholder="Languages e.g. Hindi, English"
            value={form.languages}
            onChange={handleChange}
          />

          <div>
            <p>Consultation modes</p>

            <label>
              <input
                type="checkbox"
                checked={form.consultationModes.includes(
                  "video"
                )}
                onChange={() =>
                  toggleMode("video")
                }
              />
              Video
            </label>

            <label>
              <input
                type="checkbox"
                checked={form.consultationModes.includes(
                  "text"
                )}
                onChange={() =>
                  toggleMode("text")
                }
              />
              Text
            </label>
          </div>

          <textarea
            name="bio"
            placeholder="Professional bio"
            value={form.bio}
            onChange={handleChange}
            rows="5"
          />

          <button disabled={loading}>
            {loading
              ? "Submitting..."
              : "Submit for Verification"}
          </button>

        </form>
      </div>
    </div>
  );
}