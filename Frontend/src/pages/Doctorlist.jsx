import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../components/styles/doctorList.css";

export default function DoctorList({ onBack, onSelectDoctor }) {
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
      console.error("FETCH DOCTORS ERROR:", err.response?.data || err.message);

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

    setTimeout(() => {
      fetchDoctors();
    }, 0);
  };

  const openDoctor = (doctorId) => {
    if (onSelectDoctor) {
      onSelectDoctor(doctorId);
      return;
    }

    navigate(`/doctors/${doctorId}`);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    navigate(-1);
  };

  return (
    <div className="doctor-list-page">
      {/* HEADER */}
      <div className="doctor-list-header">
        <button className="doctor-back-btn" onClick={handleBack}>
          ← Back
        </button>

        <div>
          <h1>Consult a Dermatologist</h1>

          <p>
            Choose from our verified doctors and book an online consultation.
          </p>
        </div>
      </div>

      {/* FILTERS */}
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
          <label>Consultation Mode</label>

          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="">All modes</option>

            <option value="video">Video Consultation</option>

            <option value="text">Text Consultation</option>
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

      {/* LOADING */}
      {loading && (
        <div className="doctor-state">
          <div className="doctor-loader"></div>
          <p>Loading available doctors...</p>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="doctor-state doctor-error">
          <h3>Unable to load doctors</h3>

          <p>{error}</p>

          <button onClick={fetchDoctors} className="doctor-search-btn">
            Try Again
          </button>
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && doctors.length === 0 && (
        <div className="doctor-state">
          <div className="empty-icon">🩺</div>

          <h3>No doctors available</h3>

          <p>
            There are currently no verified and available doctors matching your
            search.
          </p>
        </div>
      )}

      {/* DOCTORS */}
      {!loading && !error && doctors.length > 0 && (
        <div className="doctor-results">
          <div className="doctor-results-top">
            <div>
              <h2>Available Doctors</h2>

              <p>Verified doctors available for consultation</p>
            </div>

            <span className="doctor-count">
              {doctors.length} {doctors.length === 1 ? "Doctor" : "Doctors"}
            </span>
          </div>

          <div className="doctor-grid">
            {doctors.map((doctor) => {
              const user = doctor.user || {};

              const initials =
                user.fullName
                  ?.split(" ")
                  .map((name) => name.charAt(0))
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "DR";

              return (
                <div className="doctor-card" key={doctor._id}>
                  {/* PROFILE */}
                  <div className="doctor-card-top">
                    <div className="doctor-avatar">
                      {doctor.profileImage ? (
                        <img
                          src={doctor.profileImage}
                          alt={user.fullName || "Doctor"}
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>

                    <div className="doctor-basic-info">
                      <div className="doctor-name-row">
                        <h3>Dr. {user.fullName || "Doctor"}</h3>

                        <span className="verified-check">✓</span>
                      </div>

                      <p>{doctor.specialization || "Dermatologist"}</p>

                      <span className="verified-badge">✓ Verified Doctor</span>
                    </div>
                  </div>

                  {/* DETAILS */}
                  <div className="doctor-details">
                    <div className="doctor-detail-row">
                      <span>Qualification</span>

                      <strong>{doctor.qualification || "Not specified"}</strong>
                    </div>

                    <div className="doctor-detail-row">
                      <span>Experience</span>

                      <strong>{doctor.experience || 0} years</strong>
                    </div>

                    <div className="doctor-detail-row">
                      <span>Location</span>

                      <strong>{doctor.city || "Not specified"}</strong>
                    </div>

                    <div className="doctor-detail-row">
                      <span>Consultation Fee</span>

                      <strong className="doctor-fee">
                        ₹{doctor.consultationFee || 0}
                      </strong>
                    </div>
                  </div>

                  {/* MODES */}
                  <div className="doctor-modes">
                    {doctor.consultationModes?.includes("video") && (
                      <span className="mode-badge">🎥 Video</span>
                    )}

                    {doctor.consultationModes?.includes("text") && (
                      <span className="mode-badge">💬 Text</span>
                    )}
                  </div>

                  {/* LANGUAGES */}
                  {doctor.languages?.length > 0 && (
                    <div className="doctor-languages">
                      <span>Languages:</span> {doctor.languages.join(", ")}
                    </div>
                  )}

                  {/* AVAILABILITY */}
                  <div className="doctor-available">
                    <span className="available-dot"></span>
                    Available for consultation
                  </div>

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