import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../components/styles/doctorList.css";

export default function DoctorList() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [city, setCity] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [mode, setMode] = useState("");

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (city.trim()) {
        params.city = city.trim();
      }

      if (specialization.trim()) {
        params.specialization = specialization.trim();
      }

      if (mode) {
        params.mode = mode;
      }

      const response = await api.get("/api/doctors", {
        params,
      });

      setDoctors(response.data?.doctors || []);
    } catch (err) {
      console.error(
        "Failed to fetch doctors:",
        err.response?.data || err.message,
      );

      setError(err.response?.data?.message || "Unable to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const clearFilters = () => {
    setCity("");
    setSpecialization("");
    setMode("");

    // Directly fetch all verified + available doctors
    setTimeout(() => {
      fetchDoctors();
    }, 0);
  };

  const openDoctor = (doctorId) => {
    navigate(`/doctors/${doctorId}`);
  };

  return (
    <div className="doctor-list-page">
      {/* Header */}
      <div className="doctor-list-header">
        <button className="doctor-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div>
          <h1>Consult a Dermatologist</h1>

          <p>Find a verified dermatologist and book an online consultation.</p>
        </div>
      </div>

      {/* Filters */}
      <form className="doctor-filter-card" onSubmit={handleSearch}>
        <div className="filter-group">
          <label>City</label>

          <input
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Specialization</label>

          <input
            type="text"
            placeholder="e.g. Dermatologist"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Consultation mode</label>

          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="">All modes</option>
            <option value="video">Video consultation</option>
            <option value="text">Text consultation</option>
          </select>
        </div>

        <div className="filter-actions">
          <button type="submit" className="doctor-search-btn">
            Search
          </button>

          <button
            type="button"
            className="doctor-clear-btn"
            onClick={clearFilters}
          >
            Clear
          </button>
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <div className="doctor-state">
          <p>Loading doctors...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="doctor-state doctor-error">
          <h3>Unable to load doctors</h3>

          <p>{error}</p>

          <button onClick={fetchDoctors} className="doctor-search-btn">
            Try Again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && doctors.length === 0 && (
        <div className="doctor-state">
          <h3>No doctors available</h3>

          <p>No verified and available doctors match your current filters.</p>
        </div>
      )}

      {/* Doctor cards */}
      {!loading && !error && doctors.length > 0 && (
        <div className="doctor-results">
          <div className="doctor-results-top">
            <h2>Available Doctors</h2>

            <span>
              {doctors.length} doctor
              {doctors.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="doctor-grid">
            {doctors.map((doctor) => {
              const user = doctor.user || {};

              return (
                <div className="doctor-card" key={doctor._id}>
                  {/* Profile image */}
                  <div className="doctor-card-top">
                    <div className="doctor-avatar">
                      {doctor.profileImage ? (
                        <img
                          src={doctor.profileImage}
                          alt={user.fullName || "Doctor"}
                        />
                      ) : (
                        <span>
                          {(user.fullName || "D").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="doctor-basic-info">
                      <h3>{user.fullName || "Doctor"}</h3>

                      <p>{doctor.specialization || "Dermatologist"}</p>

                      <span className="verified-badge">✓ Verified</span>
                    </div>
                  </div>
                  {/* Details */}
                  <div className="doctor-details">
                    <div className="doctor-detail-row">
                      <span>Qualification</span>

                      <strong>{doctor.qualification || "Not specified"}</strong>
                    </div>

                    <div className="doctor-detail-row">
                      <span>Experience</span>

                      <strong>{doctor.experience} years</strong>
                    </div>

                    <div className="doctor-detail-row">
                      <span>Location</span>

                      <strong>{doctor.city || "Not specified"}</strong>
                    </div>

                    <div className="doctor-detail-row">
                      <span>Consultation fee</span>

                      <strong>₹{doctor.consultationFee || 0}</strong>
                    </div>
                  </div>
                  {/* Consultation modes */}
                  <div className="doctor-modes">
                    {doctor.consultationModes?.includes("video") && (
                      <span className="mode-badge">🎥 Video</span>
                    )}

                    {doctor.consultationModes?.includes("text") && (
                      <span className="mode-badge">💬 Text</span>
                    )}
                  </div>
                  33333333333333333333333333
                  {/* Languages */}
                  {doctor.languages?.length > 0 && (
                    <div className="doctor-languages">
                      <span>Languages:</span> {doctor.languages.join(", ")}
                    </div>
                  )}
                  {/* CTA */}
                  <button
                    className="view-doctor-btn"
                    onClick={() => openDoctor(doctor._id)}
                  >
                    View Profile →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
