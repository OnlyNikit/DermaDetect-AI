import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import "../components/styles/doctorDetails.css";

export default function DoctorDetails({
  doctorId: doctorIdProp,
  onBack,
  onBook,
}) {
  const { id: doctorIdParam } = useParams();
  const navigate = useNavigate();

  const doctorId = doctorIdProp || doctorIdParam;

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDoctor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  const fetchDoctor = async () => {
    if (!doctorId) {
      setLoading(false);
      setError("Doctor ID is missing.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/api/doctors/${doctorId}`);

      setDoctor(response.data?.doctor || null);
    } catch (err) {
      console.error(
        "FETCH DOCTOR ERROR:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to load doctor profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    navigate("/doctors");
  };

  const handleBook = () => {
    if (onBook) {
      onBook();
      return;
    }

    navigate(`/doctors/${doctor._id}/book`);
  };

  if (loading) {
    return (
      <div className="doctor-details-page">
        <div className="doctor-details-state">
          <div className="doctor-loader"></div>
          <p>Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="doctor-details-page">
        <div className="doctor-details-state doctor-error-state">
          <div className="state-icon">!</div>
          <h3>Doctor not found</h3>
          <p>{error || "This doctor profile is unavailable."}</p>

          <button
            className="doctor-primary-btn"
            onClick={handleBack}
          >
            ← Back to Doctors
          </button>
        </div>
      </div>
    );
  }

  const user = doctor.user || {};

  const enabledAvailability = (doctor.availability || []).filter(
    (slot) => slot.enabled
  );

  const hasVideo =
    doctor.consultationModes?.includes("video");

  const hasText =
    doctor.consultationModes?.includes("text");

  return (
    <div className="doctor-details-page">
      <div className="doctor-details-container">

        {/* BACK */}
        <button
          className="doctor-back-btn"
          onClick={handleBack}
        >
          ← Back to Doctors
        </button>

        {/* PROFILE HERO */}
        <section className="doctor-profile-card">

          <div className="doctor-profile-header">

            <div className="doctor-profile-avatar">
              {doctor.profileImage ? (
                <img
                  src={doctor.profileImage}
                  alt={user.fullName || "Doctor"}
                />
              ) : (
                <span>
                  {(user.fullName || "D")
                    .charAt(0)
                    .toUpperCase()}
                </span>
              )}
            </div>

            <div className="doctor-profile-main">

              <div className="doctor-name-row">
                <h1>
                  Dr. {user.fullName || "Doctor"}
                </h1>

                <span className="verified-badge">
                  ✓ Verified
                </span>
              </div>

              <p className="doctor-specialization">
                {doctor.specialization || "Dermatologist"}
              </p>

              <p className="doctor-location">
                📍 {doctor.city || "Location not specified"}
              </p>

              <div className="doctor-quick-tags">

                <span>
                  🎓 {doctor.qualification || "Qualification not specified"}
                </span>

                <span>
                  💼 {doctor.experience || 0} years experience
                </span>

              </div>

            </div>

          </div>

          {/* QUICK INFO */}
          <div className="doctor-stat-grid">

            <div className="doctor-stat">
              <span>Experience</span>
              <strong>
                {doctor.experience || 0} years
              </strong>
            </div>

            <div className="doctor-stat">
              <span>Consultation Fee</span>
              <strong>
                ₹{doctor.consultationFee || 0}
              </strong>
            </div>

            <div className="doctor-stat">
              <span>Consultation</span>
              <strong>
                {doctor.consultationModes?.length || 0} modes
              </strong>
            </div>

            <div className="doctor-stat">
              <span>Status</span>
              <strong className="available-text">
                {doctor.isAvailable
                  ? "Available"
                  : "Unavailable"}
              </strong>
            </div>

          </div>

        </section>

        {/* MAIN GRID */}
        <div className="doctor-content-grid">

          {/* LEFT */}
          <div className="doctor-main-content">

            {/* ABOUT */}
            <section className="doctor-info-card">
              <div className="section-heading">
                <div className="section-icon">👨‍⚕️</div>

                <div>
                  <h2>About Doctor</h2>
                  <p>Professional information</p>
                </div>
              </div>

              <p className="doctor-bio">
                {doctor.bio ||
                  "No professional information has been provided by this doctor yet."}
              </p>
            </section>

            {/* PROFESSIONAL DETAILS */}
            <section className="doctor-info-card">

              <div className="section-heading">
                <div className="section-icon">📋</div>

                <div>
                  <h2>Professional Details</h2>
                  <p>Doctor's qualifications and practice information</p>
                </div>
              </div>

              <div className="professional-grid">

                <div className="professional-item">
                  <span>Qualification</span>
                  <strong>
                    {doctor.qualification || "Not specified"}
                  </strong>
                </div>

                <div className="professional-item">
                  <span>Specialization</span>
                  <strong>
                    {doctor.specialization || "Not specified"}
                  </strong>
                </div>

                <div className="professional-item">
                  <span>Experience</span>
                  <strong>
                    {doctor.experience || 0} years
                  </strong>
                </div>

                <div className="professional-item">
                  <span>Registration Number</span>
                  <strong>
                    {doctor.registrationNumber || "Not specified"}
                  </strong>
                </div>

                <div className="professional-item">
                  <span>Hospital</span>
                  <strong>
                    {doctor.hospital || "Not specified"}
                  </strong>
                </div>

                <div className="professional-item">
                  <span>Clinic</span>
                  <strong>
                    {doctor.clinic || "Not specified"}
                  </strong>
                </div>

              </div>

              {doctor.address && (
                <div className="doctor-address">
                  <span>📍 Address</span>
                  <p>{doctor.address}</p>
                </div>
              )}

            </section>

            {/* LANGUAGES */}
            <section className="doctor-info-card">

              <div className="section-heading">
                <div className="section-icon">🌐</div>

                <div>
                  <h2>Languages</h2>
                  <p>Languages supported during consultation</p>
                </div>
              </div>

              {doctor.languages?.length > 0 ? (
                <div className="language-list">
                  {doctor.languages.map((language, index) => (
                    <span key={index}>
                      {language}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="empty-info">
                  No languages specified.
                </p>
              )}

            </section>

            {/* CONSULTATION MODES */}
            <section className="doctor-info-card">

              <div className="section-heading">
                <div className="section-icon">💬</div>

                <div>
                  <h2>Consultation Options</h2>
                  <p>Available ways to consult this doctor</p>
                </div>
              </div>

              <div className="consultation-mode-grid">

                {hasVideo && (
                  <div className="consultation-mode-card">
                    <div className="mode-icon">
                      🎥
                    </div>

                    <div>
                      <h3>Video Consultation</h3>
                      <p>
                        Talk to the doctor through a video call.
                      </p>
                    </div>
                  </div>
                )}

                {hasText && (
                  <div className="consultation-mode-card">
                    <div className="mode-icon">
                      💬
                    </div>

                    <div>
                      <h3>Text Consultation</h3>
                      <p>
                        Chat with the doctor through text.
                      </p>
                    </div>
                  </div>
                )}

                {!hasVideo && !hasText && (
                  <p className="empty-info">
                    No consultation modes available.
                  </p>
                )}

              </div>

            </section>

            {/* AVAILABILITY */}
            <section className="doctor-info-card">

              <div className="section-heading">
                <div className="section-icon">🕐</div>

                <div>
                  <h2>Availability</h2>
                  <p>Doctor's consultation schedule</p>
                </div>
              </div>

              {enabledAvailability.length > 0 ? (
                <div className="availability-list">

                  {enabledAvailability.map((slot, index) => (
                    <div
                      className="availability-item"
                      key={index}
                    >
                      <div className="availability-day">
                        <span className="availability-dot"></span>
                        <strong>{slot.day}</strong>
                      </div>

                      <span className="availability-time">
                        {slot.startTime} – {slot.endTime}
                      </span>
                    </div>
                  ))}

                </div>
              ) : (
                <div className="empty-availability">
                  <span>🕐</span>
                  <p>
                    This doctor has not added availability yet.
                  </p>
                </div>
              )}

            </section>

          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="doctor-sidebar">

            <div className="booking-card">

              <div className="booking-card-top">
                <span>Consultation fee</span>

                <strong>
                  ₹{doctor.consultationFee || 0}
                </strong>
              </div>

              <div className="booking-divider"></div>

              <div className="booking-status">

                <span
                  className={
                    doctor.isAvailable
                      ? "status-dot active"
                      : "status-dot"
                  }
                ></span>

                <span>
                  {doctor.isAvailable
                    ? "Currently accepting appointments"
                    : "Currently unavailable"}
                </span>

              </div>

              <button
                className="book-doctor-btn"
                disabled={!doctor.isAvailable}
                onClick={handleBook}
              >
                {doctor.isAvailable
                  ? "Book Consultation"
                  : "Currently Unavailable"}
              </button>

              <p className="booking-note">
                You can attach your AI skin assessment
                report while booking.
              </p>

            </div>

            {/* MODES SUMMARY */}
            <div className="sidebar-card">

              <h3>Available consultation</h3>

              {hasVideo && (
                <div className="sidebar-option">
                  <span>🎥</span>
                  <div>
                    <strong>Video</strong>
                    <small>Online consultation</small>
                  </div>
                </div>
              )}

              {hasText && (
                <div className="sidebar-option">
                  <span>💬</span>
                  <div>
                    <strong>Text</strong>
                    <small>Chat consultation</small>
                  </div>
                </div>
              )}

            </div>

            {/* LOCATION */}
            {(doctor.hospital ||
              doctor.clinic ||
              doctor.address) && (
              <div className="sidebar-card">

                <h3>Practice location</h3>

                {doctor.hospital && (
                  <div className="location-row">
                    <span>🏥</span>
                    <div>
                      <strong>{doctor.hospital}</strong>
                      <small>Hospital</small>
                    </div>
                  </div>
                )}

                {doctor.clinic && (
                  <div className="location-row">
                    <span>🏠</span>
                    <div>
                      <strong>{doctor.clinic}</strong>
                      <small>Clinic</small>
                    </div>
                  </div>
                )}

                {doctor.address && (
                  <div className="location-row">
                    <span>📍</span>
                    <div>
                      <strong>{doctor.address}</strong>
                      <small>
                        {doctor.city}
                      </small>
                    </div>
                  </div>
                )}

              </div>
            )}

          </aside>

        </div>

      </div>
    </div>
  );
}