import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../components/styles/doctorpages.css";
import "../components/styles/doctor-extra.css";

const MODES = [
  { value: "video", label: "Video" },
  { value: "text", label: "Text" },
  { value: "in-person", label: "In-person" },
];

export default function DoctorProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/doctors/profile/me");
      const data = response.data?.profile || null;

      setProfile(data);

      if (data) {
        setForm({
          specialization: data.specialization || "",
          qualification: data.qualification || "",
          experience: data.experience ?? "",
          hospital: data.hospital || "",
          clinic: data.clinic || "",
          city: data.city || "",
          address: data.address || "",
          consultationFee: data.consultationFee ?? "",
          languages: (data.languages || []).join(", "),
          consultationModes: data.consultationModes || [],
          bio: data.bio || "",
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSuccess("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleMode = (mode) => {
    setSuccess("");
    setForm((prev) => ({
      ...prev,
      consultationModes: prev.consultationModes.includes(mode)
        ? prev.consultationModes.filter((m) => m !== mode)
        : [...prev.consultationModes, mode],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.consultationModes.length === 0) {
      setError("Select at least one consultation mode.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put("/api/doctors/profile/me", {
        ...form,
        experience: Number(form.experience) || 0,
        consultationFee: Number(form.consultationFee) || 0,
        languages: form.languages
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });

      setProfile(response.data?.profile || profile);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="doctor-page">
        <div className="doctor-container">
          <div className="doctor-loading">
            <div className="doctor-spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile || !form) {
    return (
      <div className="doctor-page">
        <div className="doctor-container">
          <div className="doctor-card">
            <div className="doctor-empty">
              <div className="doctor-empty-icon">👨‍⚕️</div>
              <h3>No profile found</h3>
              <p>{error || "Complete onboarding first."}</p>
              <button
                className="doctor-btn doctor-btn-primary"
                onClick={() => navigate("/doctor-onboarding")}
              >
                Go to onboarding
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-page">
      <div className="doctor-container">
        <div className="doctor-page-header">
          <div>
            <span className="doctor-eyebrow">Doctor Settings</span>
            <h1>My Profile</h1>
            <p>Update your professional information shown to patients.</p>
          </div>

          <button
            className="doctor-btn doctor-btn-secondary"
            onClick={() => navigate("/doctor-dashboard")}
          >
            ← Dashboard
          </button>
        </div>

        {error && <div className="doctor-alert doctor-alert-error">{error}</div>}
        {success && (
          <div className="doctor-alert doctor-alert-success">{success}</div>
        )}

        <div className="doctor-card availability-overview">
          <div>
            <span className="overview-label">Verification status</span>
            <strong>{profile.verificationStatus}</strong>
          </div>

          <div className="overview-item">
            <span>Registration number</span>
            <strong>{profile.registrationNumber || "—"}</strong>
          </div>
        </div>

        <form className="doctor-card profile-form" onSubmit={handleSubmit}>
          <div className="profile-grid">
            <div className="slot-field">
              <label>Specialization</label>
              <input
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                required
              />
            </div>

            <div className="slot-field">
              <label>Qualification</label>
              <input
                name="qualification"
                value={form.qualification}
                onChange={handleChange}
                required
              />
            </div>

            <div className="slot-field">
              <label>Experience (years)</label>
              <input
                type="number"
                min="0"
                name="experience"
                value={form.experience}
                onChange={handleChange}
                required
              />
            </div>

            <div className="slot-field">
              <label>Consultation fee (₹)</label>
              <input
                type="number"
                min="0"
                name="consultationFee"
                value={form.consultationFee}
                onChange={handleChange}
              />
            </div>

            <div className="slot-field">
              <label>Hospital</label>
              <input name="hospital" value={form.hospital} onChange={handleChange} />
            </div>

            <div className="slot-field">
              <label>Clinic</label>
              <input name="clinic" value={form.clinic} onChange={handleChange} />
            </div>

            <div className="slot-field">
              <label>City</label>
              <input name="city" value={form.city} onChange={handleChange} required />
            </div>

            <div className="slot-field">
              <label>Languages (comma separated)</label>
              <input
                name="languages"
                value={form.languages}
                onChange={handleChange}
                placeholder="Hindi, English"
              />
            </div>
          </div>

          <div className="slot-field">
            <label>Clinic / Hospital address</label>
            <input name="address" value={form.address} onChange={handleChange} />
          </div>

          <div className="slot-field">
            <label>Consultation modes</label>
            <div className="mode-row">
              {MODES.map((mode) => (
                <label key={mode.value} className="toggle-row">
                  <input
                    type="checkbox"
                    checked={form.consultationModes.includes(mode.value)}
                    onChange={() => toggleMode(mode.value)}
                  />
                  <span>{mode.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="slot-field">
            <label>Professional bio</label>
            <textarea
              name="bio"
              rows="5"
              value={form.bio}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="doctor-btn doctor-btn-primary"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}