import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../components/styles/doctor-dashboard.css";

export default function DoctorDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  // =====================================================
  // FETCH DOCTOR PROFILE + APPOINTMENTS
  // =====================================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const profileResponse = await api.get(
        "/api/doctors/profile/me"
      );

      setProfile(profileResponse.data.profile);

      // Doctor appointments
      const appointmentResponse = await api.get(
        "/api/appointments/doctor"
      );

      setAppointments(
        appointmentResponse.data.appointments || []
      );
    } catch (error) {
      console.error(
        "DOCTOR DASHBOARD ERROR:",
        error
      );

      if (error.response?.status === 404) {
        setProfile(null);
      }
    } finally {
      setLoading(false);
      setAppointmentsLoading(false);
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const getLatestAppointment = () => {
    if (!appointments.length) return null;

    const sorted = [...appointments].sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

    return sorted[0];
  };

  const getPendingAppointments = () => {
    return appointments.filter(
      (appointment) =>
        appointment.status === "pending"
    );
  };

  const getActiveAppointments = () => {
    return appointments.filter(
      (appointment) =>
        appointment.status === "accepted"
    );
  };

  const getCompletedAppointments = () => {
    return appointments.filter(
      (appointment) =>
        appointment.status === "completed"
    );
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getSeverityClass = (severity) => {
    if (!severity) return "";

    const value =
      severity.toLowerCase();

    if (value.includes("high")) {
      return "severity-high";
    }

    if (value.includes("medium")) {
      return "severity-medium";
    }

    if (value.includes("low")) {
      return "severity-low";
    }

    return "";
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="doctor-loading">
        <div className="doctor-loading-box">
          <div className="doctor-spinner"></div>
          <p>Loading doctor dashboard...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="doctor-dashboard">
      <div className="doctor-dashboard-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="doctor-header">
          <div>
            <p className="doctor-eyebrow">
              DERMADETECT AI
            </p>

            <h1>
              Doctor Dashboard
            </h1>

            <p>
              Manage your professional profile,
              patient consultations and AI-assisted
              skin assessment reports.
            </p>
          </div>

          <button
            className="doctor-refresh-btn"
            onClick={fetchDashboard}
          >
            ↻ Refresh
          </button>
        </div>

        {/* =================================================
            ONBOARDING
        ================================================= */}

        {!profile ? (
          <div className="doctor-onboard-card">
            <div className="doctor-onboard-icon">
              +
            </div>

            <h2>
              Complete your doctor profile
            </h2>

            <p>
              Complete your professional information
              before patients can find you and book
              consultations.
            </p>

            <button
              onClick={() =>
                navigate("/doctor-onboarding")
              }
            >
              Onboard to DermaDetect AI
            </button>
          </div>
        ) : (
          <>
            {/* =================================================
                STATUS
            ================================================= */}

            <div className="doctor-status-card">

              <div className="doctor-status-item">
                <span>
                  Verification status
                </span>

                <strong className="verification-status">
                  {profile.verificationStatus}
                </strong>
              </div>

              <div className="doctor-status-item">
                <span>
                  Availability
                </span>

                <strong
                  className={
                    profile.isAvailable
                      ? "available-status"
                      : "unavailable-status"
                  }
                >
                  {profile.isAvailable
                    ? "Available"
                    : "Unavailable"}
                </strong>
              </div>

              <div className="doctor-status-item">
                <span>
                  Total consultations
                </span>

                <strong>
                  {appointments.length}
                </strong>
              </div>

              <div className="doctor-status-item">
                <span>
                  Pending requests
                </span>

                <strong className="pending-status">
                  {getPendingAppointments().length}
                </strong>
              </div>

            </div>

            {/* =================================================
                DASHBOARD NAVIGATION
            ================================================= */}

            <div className="doctor-dashboard-grid">

              <button
                onClick={() =>
                  navigate("/doctor-profile")
                }
              >
                <div className="doctor-card-icon">
                  👨‍⚕️
                </div>

                <h3>
                  My Profile
                </h3>

                <p>
                  Update your professional
                  information.
                </p>
              </button>

              <button
                onClick={() =>
                  navigate("/doctor-availability")
                }
              >
                <div className="doctor-card-icon">
                  🕒
                </div>

                <h3>
                  Availability
                </h3>

                <p>
                  Manage consultation timings
                  and availability.
                </p>
              </button>

              <button
                onClick={() =>
                  navigate("/doctor-appointments")
                }
              >
                <div className="doctor-card-icon">
                  📅
                </div>

                <h3>
                  Appointments
                </h3>

                <p>
                  View and manage patient
                  consultation requests.
                </p>

                {getPendingAppointments().length >
                  0 && (
                  <span className="doctor-card-badge">
                    {getPendingAppointments().length} pending
                  </span>
                )}
              </button>

            </div>

            {/* =================================================
                PATIENT CONSULTATION SECTION
            ================================================= */}

            <section className="doctor-section">

              <div className="doctor-section-header">
                <div>
                  <p className="doctor-section-label">
                    PATIENT CARE
                  </p>

                  <h2>
                    Recent Consultations
                  </h2>

                  <p>
                    Patients who have requested or
                    completed consultations with you.
                  </p>
                </div>

                <button
                  className="doctor-outline-btn"
                  onClick={() =>
                    navigate("/doctor-appointments")
                  }
                >
                  View all
                </button>
              </div>

              {appointmentsLoading ? (
                <div className="doctor-empty-card">
                  Loading consultations...
                </div>
              ) : appointments.length === 0 ? (
                <div className="doctor-empty-card">
                  <div className="doctor-empty-icon">
                    📋
                  </div>

                  <h3>
                    No consultations yet
                  </h3>

                  <p>
                    Patient consultation requests
                    will appear here.
                  </p>
                </div>
              ) : (
                <div className="doctor-consultation-list">

                  {appointments
                    .slice(0, 5)
                    .map((appointment) => (
                      <div
                        className="doctor-consultation-card"
                        key={appointment._id}
                      >

                        {/* Patient */}
                        <div className="consultation-patient">

                          <div className="patient-avatar">
                            {appointment.patient?.fullName
                              ?.charAt(0)
                              ?.toUpperCase() || "P"}
                          </div>

                          <div>
                            <h3>
                              {appointment.patient
                                ?.fullName ||
                                "Patient"}
                            </h3>

                            <p>
                              {appointment.patient
                                ?.email ||
                                "No email available"}
                            </p>
                          </div>

                        </div>

                        {/* Appointment */}
                        <div className="consultation-info">

                          <div>
                            <span>
                              Date
                            </span>

                            <strong>
                              {appointment.date}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Time
                            </span>

                            <strong>
                              {appointment.startTime}
                              {" - "}
                              {appointment.endTime}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Mode
                            </span>

                            <strong>
                              {appointment.mode ===
                              "video"
                                ? "Video"
                                : "Text"}
                            </strong>
                          </div>

                        </div>

                        {/* Status */}
                        <div className="consultation-status">

                          <span
                            className={`appointment-status status-${appointment.status}`}
                          >
                            {appointment.status}
                          </span>

                        </div>

                        {/* Report */}
                        <div className="consultation-report">

                          {appointment.assessment ? (
                            <>
                              <div className="report-label">
                                AI SKIN REPORT
                              </div>

                              <div className="report-disease">
                                {appointment.assessment
                                  ?.prediction
                                  ?.disease ||
                                  "Analysis available"}
                              </div>

                              <div className="report-meta">

                                <span>
                                  Severity:
                                  {" "}
                                  <strong
                                    className={getSeverityClass(
                                      appointment
                                        .assessment
                                        ?.prediction
                                        ?.severity
                                    )}
                                  >
                                    {appointment
                                      .assessment
                                      ?.prediction
                                      ?.severity ||
                                      "—"}
                                  </strong>
                                </span>

                                <span>
                                  Confidence:
                                  {" "}
                                  {appointment
                                    .assessment
                                    ?.prediction
                                    ?.confidence
                                    ? `${Math.round(
                                        appointment
                                          .assessment
                                          .prediction
                                          .confidence *
                                          100
                                      )}%`
                                    : "—"}
                                </span>

                                <span>
                                  Report:
                                  {" "}
                                  {formatDate(
                                    appointment
                                      .assessment
                                      ?.createdAt
                                  )}
                                </span>

                              </div>

                              <button
                                className="view-report-btn"
                                onClick={() =>
                                  navigate(
                                    `/doctor/assessment/${appointment.assessment._id}`
                                  )
                                }
                              >
                                View Patient Report →
                              </button>
                            </>
                          ) : (
                            <div className="no-report">
                              <span>
                                No AI assessment attached
                              </span>

                              <small>
                                Patient has not submitted
                                an assessment for this
                                consultation.
                              </small>
                            </div>
                          )}

                        </div>

                        {/* Open consultation */}
                        <button
                          className="consultation-open-btn"
                          onClick={() =>
                            navigate(
                              `/doctor/appointments/${appointment._id}`
                            )
                          }
                        >
                          Open Consultation
                        </button>

                      </div>
                    ))}

                </div>
              )}

            </section>

            {/* =================================================
                LATEST PATIENT REPORT
            ================================================= */}

            {getLatestAppointment()?.assessment && (
              <section className="doctor-section">

                <div className="doctor-section-header">
                  <div>
                    <p className="doctor-section-label">
                      AI ASSISTED SCREENING
                    </p>

                    <h2>
                      Latest Patient Report
                    </h2>

                    <p>
                      The latest AI skin assessment
                      associated with your consultation.
                    </p>
                  </div>
                </div>

                {(() => {
                  const latest =
                    getLatestAppointment();

                  const assessment =
                    latest.assessment;

                  return (
                    <div className="latest-report-card">

                      <div className="latest-report-left">

                        <div className="latest-report-icon">
                          🩺
                        </div>

                        <div>
                          <span className="latest-report-label">
                            PATIENT
                          </span>

                          <h3>
                            {latest.patient
                              ?.fullName ||
                              "Patient"}
                          </h3>

                          <p>
                            Assessment generated on{" "}
                            {formatDate(
                              assessment.createdAt
                            )}
                          </p>
                        </div>

                      </div>

                      <div className="latest-report-diagnosis">

                        <span>
                          AI Prediction
                        </span>

                        <strong>
                          {assessment.prediction
                            ?.disease ||
                            "Not available"}
                        </strong>

                      </div>

                      <div className="latest-report-diagnosis">

                        <span>
                          Severity
                        </span>

                        <strong
                          className={getSeverityClass(
                            assessment.prediction
                              ?.severity
                          )}
                        >
                          {assessment.prediction
                            ?.severity ||
                            "Not available"}
                        </strong>

                      </div>

                      <button
                        className="latest-report-btn"
                        onClick={() =>
                          navigate(
                            `/doctor/assessment/${assessment._id}`
                          )
                        }
                      >
                        Open Full Report
                      </button>

                    </div>
                  );
                })()}

              </section>
            )}

          </>
        )}

      </div>
    </div>
  );
}