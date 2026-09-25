import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../components/styles/doctor-dashboard.css";

export default function DoctorDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] =
    useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  // =====================================================
  // FETCH DOCTOR PROFILE + APPOINTMENTS
  // =====================================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setAppointmentsLoading(true);

      const profileResponse = await api.get(
        "/api/doctors/profile/me"
      );

      setProfile(
        profileResponse.data?.profile || null
      );

      const appointmentResponse = await api.get(
        "/api/appointments/doctor"
      );

      setAppointments(
        appointmentResponse.data?.appointments || []
      );
    } catch (error) {
      console.error(
        "DOCTOR DASHBOARD ERROR:",
        error.response?.data || error.message
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
  // ONLY ACTIVE / VISIBLE APPOINTMENTS
  // Cancelled appointments are hidden from dashboard
  // =====================================================

  const visibleAppointments = appointments.filter(
    (appointment) =>
      appointment.status !== "cancelled"
  );

  // =====================================================
  // HELPERS
  // =====================================================

  const getLatestAppointment = () => {
    if (!visibleAppointments.length) {
      return null;
    }

    const sorted = [...visibleAppointments].sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    );

    return sorted[0];
  };

  const getPendingAppointments = () => {
    return visibleAppointments.filter(
      (appointment) =>
        appointment.status === "pending"
    );
  };

  const getActiveAppointments = () => {
    return visibleAppointments.filter(
      (appointment) =>
        appointment.status === "accepted"
    );
  };

  const getCompletedAppointments = () => {
    return visibleAppointments.filter(
      (appointment) =>
        appointment.status === "completed"
    );
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString(
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

    const value = String(severity).toLowerCase();

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

  const getStatusClass = (status) => {
    if (!status) return "";

    return `status-${String(status).toLowerCase()}`;
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="doctor-loading">
        <div className="doctor-loading-box">
          <div className="doctor-spinner"></div>

          <p>
            Loading doctor dashboard...
          </p>
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
            type="button"
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
              type="button"
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
                  {profile.verificationStatus ||
                    "Pending"}
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
                  {visibleAppointments.length}
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

              {/* PROFILE */}

              <button
                type="button"
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

              {/* AVAILABILITY */}

              <button
                type="button"
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

              {/* APPOINTMENTS */}

              <button
                type="button"
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
                    {getPendingAppointments().length}{" "}
                    pending
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
                  type="button"
                  className="doctor-outline-btn"
                  onClick={() =>
                    navigate("/doctor-appointments")
                  }
                >
                  View all
                </button>

              </div>

              {/* APPOINTMENT LOADING */}

              {appointmentsLoading ? (

                <div className="doctor-empty-card">
                  Loading consultations...
                </div>

              ) : visibleAppointments.length ===
                0 ? (

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

                  {visibleAppointments
                    .slice(0, 5)
                    .map((appointment) => {

                      const patient =
                        appointment.patient || {};

                      const assessment =
                        appointment.assessment;

                      const prediction =
                        assessment?.prediction || {};

                      return (
                        <div
                          className="doctor-consultation-card"
                          key={appointment._id}
                        >

                          {/* =================================
                              PATIENT
                          ================================= */}

                          <div className="consultation-patient">

                            <div className="patient-avatar">
                              {patient.fullName
                                ?.charAt(0)
                                ?.toUpperCase() || "P"}
                            </div>

                            <div>

                              <h3>
                                {patient.fullName ||
                                  "Patient"}
                              </h3>

                              <p>
                                {patient.email ||
                                  "No email available"}
                              </p>

                            </div>

                          </div>

                          {/* =================================
                              APPOINTMENT INFO
                          ================================= */}

                          <div className="consultation-info">

                            <div>
                              <span>
                                Date
                              </span>

                              <strong>
                                {appointment.date ||
                                  "—"}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Time
                              </span>

                              <strong>
                                {appointment.startTime ||
                                  "—"}

                                {" - "}

                                {appointment.endTime ||
                                  "—"}
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

                          {/* =================================
                              STATUS
                          ================================= */}

                          <div className="consultation-status">

                            <span
                              className={`appointment-status ${getStatusClass(
                                appointment.status
                              )}`}
                            >
                              {appointment.status ||
                                "pending"}
                            </span>

                          </div>

                          {/* =================================
                              REPORT
                          ================================= */}

                          <div className="consultation-report">

                            {assessment ? (

                              <>

                                <div className="report-label">
                                  AI SKIN REPORT
                                </div>

                                <div className="report-disease">
                                  {prediction.disease ||
                                    "Analysis available"}
                                </div>

                                <div className="report-meta">

                                  <span>
                                    Severity:{" "}

                                    <strong
                                      className={getSeverityClass(
                                        prediction.severity
                                      )}
                                    >
                                      {prediction.severity ||
                                        "—"}
                                    </strong>
                                  </span>

                                  <span>
                                    Confidence:{" "}

                                    {prediction.confidence !=
                                      null
                                      ? `${Math.round(
                                          Number(
                                            prediction.confidence
                                          ) * 100
                                        )}%`
                                      : "—"}
                                  </span>

                                  <span>
                                    Report:{" "}

                                    {formatDate(
                                      assessment.createdAt
                                    )}
                                  </span>

                                </div>

                                <button
                                  type="button"
                                  className="view-report-btn"
                                  onClick={() =>
                                    navigate(
                                      `/doctor/assessment/${assessment._id}`
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

                          {/* =================================
                              OPEN CONSULTATION
                          ================================= */}

                          <button
                            type="button"
                            className="consultation-open-btn"
                            onClick={() =>
                              navigate(
                                `/doctor-appointments/${appointment._id}`
                              )
                            }
                          >
                            Open Consultation
                          </button>

                        </div>
                      );
                    })}

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
                    latest?.assessment;

                  const prediction =
                    assessment?.prediction || {};

                  if (!latest || !assessment) {
                    return null;
                  }

                  return (
                    <div className="latest-report-card">

                      {/* PATIENT */}

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

                      {/* DIAGNOSIS */}

                      <div className="latest-report-diagnosis">

                        <span>
                          AI Prediction
                        </span>

                        <strong>
                          {prediction.disease ||
                            "Not available"}
                        </strong>

                      </div>

                      {/* SEVERITY */}

                      <div className="latest-report-diagnosis">

                        <span>
                          Severity
                        </span>

                        <strong
                          className={getSeverityClass(
                            prediction.severity
                          )}
                        >
                          {prediction.severity ||
                            "Not available"}
                        </strong>

                      </div>

                      {/* OPEN REPORT */}

                      <button
                        type="button"
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