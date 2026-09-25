import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";
import { useToast } from "../components/context/ToastContext";

import "../components/styles/doctor-appointment-details.css";

export default function DoctorAppointmentDetails() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const { showToast } = useToast();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // =====================================================
  // FETCH APPOINTMENT
  // =====================================================

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/api/appointments/${appointmentId}`
      );

      const data = response.data?.appointment;

      setAppointment(data);
      setNotes(data?.doctorNotes || "");
    } catch (err) {
      console.error(
        "GET APPOINTMENT ERROR:",
        err.response?.data || err.message
      );

      const message =
        err.response?.data?.message ||
        "Unable to load consultation";

      setError(message);

      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!appointmentId) {
      showToast("Appointment ID is missing.", "error");
      setLoading(false);
      return;
    }

    fetchAppointment();
  }, [appointmentId]);

  // =====================================================
  // APPOINTMENT ACTION
  // =====================================================

  const runAction = async (path, successMessage, failMessage) => {
    try {
      setActionLoading(true);

      const response = await api.patch(
        `/api/appointments/${appointmentId}/${path}`
      );

      showToast(
        response.data?.message ||
          successMessage,
        "success"
      );

      await fetchAppointment();
    } catch (err) {
      console.error(
        `APPOINTMENT ${path.toUpperCase()} ERROR:`,
        err.response?.data || err.message
      );

      showToast(
        err.response?.data?.message ||
          failMessage,
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const acceptAppointment = () =>
    runAction(
      "accept",
      "Appointment accepted successfully.",
      "Unable to accept appointment."
    );

  const rejectAppointment = () =>
    runAction(
      "reject",
      "Appointment rejected successfully.",
      "Unable to reject appointment."
    );

  const completeAppointment = () =>
    runAction(
      "complete",
      "Consultation marked as completed.",
      "Unable to complete appointment."
    );

  // =====================================================
  // SAVE DOCTOR NOTES
  // =====================================================

  const saveNotes = async () => {
    try {
      setSavingNotes(true);

      const response = await api.patch(
        `/api/appointments/${appointmentId}/notes`,
        {
          doctorNotes: notes,
        }
      );

      showToast(
        response.data?.message ||
          "Doctor notes saved successfully.",
        "success"
      );

      await fetchAppointment();
    } catch (err) {
      console.error(
        "SAVE NOTES ERROR:",
        err.response?.data || err.message
      );

      showToast(
        err.response?.data?.message ||
          "Unable to save notes.",
        "error"
      );
    } finally {
      setSavingNotes(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading && !appointment) {
    return (
      <div className="doctor-detail-state">
        Loading consultation...
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && !appointment) {
    return (
      <div className="doctor-detail-state">
        <h3>Unable to load consultation</h3>

        <p>{error}</p>

        <button
          onClick={() =>
            navigate("/doctor-appointments")
          }
        >
          Back to appointments
        </button>
      </div>
    );
  }

  if (!appointment) {
    return null;
  }

  // =====================================================
  // DATA
  // =====================================================

  const patient = appointment.patient || {};
  const assessment = appointment.assessment;
  const prediction = assessment?.prediction || {};
  const optional = assessment?.optionalDetails || {};

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="doctor-detail-page">
      <div className="doctor-detail-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="doctor-detail-header">
          <button
            onClick={() =>
              navigate("/doctor-appointments")
            }
          >
            ← Appointments
          </button>

          <div>
            <p>DERMADETECT AI</p>
            <h1>Patient Consultation</h1>
          </div>
        </div>

        {/* =================================================
            PATIENT INFORMATION
        ================================================= */}

        <section className="detail-card">
          <div className="section-heading">
            <h2>Patient Information</h2>
          </div>

          <div className="patient-detail-grid">

            <div>
              <span>Name</span>
              <strong>
                {patient.fullName || "Patient"}
              </strong>
            </div>

            <div>
              <span>Email</span>
              <strong>
                {patient.email || "Not available"}
              </strong>
            </div>

            <div>
              <span>Gender</span>
              <strong>
                {patient.gender || "Not specified"}
              </strong>
            </div>

            <div>
              <span>Age</span>
              <strong>
                {patient.age
                  ? `${patient.age} years`
                  : "Not specified"}
              </strong>
            </div>

            <div>
              <span>Weight</span>
              <strong>
                {patient.weight
                  ? `${patient.weight} kg`
                  : "Not specified"}
              </strong>
            </div>

            <div>
              <span>Height</span>
              <strong>
                {patient.height
                  ? `${patient.height} cm`
                  : "Not specified"}
              </strong>
            </div>

          </div>
        </section>

        {/* =================================================
            APPOINTMENT
        ================================================= */}

        <section className="detail-card">
          <div className="section-heading">
            <h2>Appointment</h2>
          </div>

          <div className="patient-detail-grid">

            <div>
              <span>Date</span>
              <strong>
                {appointment.date}
              </strong>
            </div>

            <div>
              <span>Time</span>
              <strong>
                {appointment.startTime} -{" "}
                {appointment.endTime}
              </strong>
            </div>

            <div>
              <span>Consultation mode</span>

              <strong>
                {appointment.mode === "video"
                  ? "🎥 Video consultation"
                  : appointment.mode === "in-person"
                  ? "🏥 In-person consultation"
                  : "💬 Text consultation"}
              </strong>
            </div>

            <div>
              <span>Status</span>

              <strong
                className={`status ${appointment.status}`}
              >
                {appointment.status}
              </strong>
            </div>

          </div>

          {appointment.reason && (
            <div className="message-box">
              <span>Consultation reason</span>
              <p>{appointment.reason}</p>
            </div>
          )}

          {appointment.patientMessage && (
            <div className="message-box">
              <span>Patient message</span>
              <p>
                {appointment.patientMessage}
              </p>
            </div>
          )}
        </section>

        {/* =================================================
            SKIN REPORT
        ================================================= */}

        <section className="detail-card report-card">

          <div className="section-heading">
            <div>
              <h2>Skin Analysis Report</h2>

              {assessment && (
                <p>
                  Assessment created{" "}
                  {new Date(
                    assessment.createdAt
                  ).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {!assessment ? (
            <div className="no-report">

              <h3>No report attached</h3>

              <p>
                The patient did not attach an AI
                skin report to this appointment.
              </p>

            </div>
          ) : (
            <div className="report-content">

              {/* IMAGE */}

              {assessment.image && (
                <div className="report-image-wrapper">

                  <img
                    src={assessment.image}
                    alt="Patient skin assessment"
                    className="report-image"
                  />

                </div>
              )}

              {/* PREDICTION */}

              <div className="prediction-grid">

                <div className="prediction-box">
                  <span>
                    Detected condition
                  </span>

                  <strong>
                    {prediction.disease ||
                      "Not available"}
                  </strong>
                </div>

                <div className="prediction-box">
                  <span>
                    Confidence
                  </span>

                  <strong>
                    {prediction.confidence != null
                      ? `${(
                          prediction.confidence *
                          100
                        ).toFixed(1)}%`
                      : "Not available"}
                  </strong>
                </div>

                <div className="prediction-box">
                  <span>Severity</span>

                  <strong>
                    {prediction.severity ||
                      "Not available"}
                  </strong>
                </div>

                <div className="prediction-box">
                  <span>Status</span>

                  <strong>
                    {assessment.status}
                  </strong>
                </div>

              </div>

              {/* DESCRIPTION */}

              {prediction.description && (
                <div className="report-section">
                  <h3>Description</h3>
                  <p>
                    {prediction.description}
                  </p>
                </div>
              )}

              {/* EXPLANATION */}

              {assessment.explanation && (
                <div className="report-section">
                  <h3>
                    Analysis explanation
                  </h3>

                  <p>
                    {assessment.explanation}
                  </p>
                </div>
              )}

              {/* RECOMMENDATION */}

              {(prediction.recommendation ||
                assessment.recommendation) && (
                <div className="report-section">
                  <h3>Recommendation</h3>

                  <p>
                    {prediction.recommendation ||
                      assessment.recommendation}
                  </p>
                </div>
              )}

              {/* CONTAGIOUS */}

              {prediction.contagious && (
                <div className="report-section">
                  <h3>Contagious</h3>

                  <p>
                    {prediction.contagious}
                  </p>
                </div>
              )}

              {/* PATIENT REPORTED DETAILS */}

              <div className="report-section">

                <h3>
                  Patient-reported details
                </h3>

                <div className="assessment-details">

                  <div>
                    <span>Location</span>
                    <strong>
                      {assessment.location ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Duration</span>
                    <strong>
                      {assessment.duration ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Itching</span>
                    <strong>
                      {assessment.itching ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Pain / Burning</span>
                    <strong>
                      {assessment.painBurning ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Changed / Spread
                    </span>

                    <strong>
                      {assessment.changeSpread ||
                        "—"}
                    </strong>
                  </div>

                </div>
              </div>

              {/* CHANGES */}

              {assessment.changeDetails?.length >
                0 && (
                <div className="report-section">

                  <h3>Changes reported</h3>

                  <p>
                    {assessment.changeDetails.join(
                      ", "
                    )}
                  </p>

                </div>
              )}

              {/* OPTIONAL DETAILS */}

              {Object.keys(optional).length >
                0 && (
                <div className="report-section">

                  <h3>
                    Additional information
                  </h3>

                  <div className="assessment-details">

                    {Object.entries(
                      optional
                    ).map(([key, value]) => (
                      <div key={key}>

                        <span>{key}</span>

                        <strong>
                          {Array.isArray(value)
                            ? value.join(", ")
                            : String(value)}
                        </strong>

                      </div>
                    ))}

                  </div>
                </div>
              )}

              {/* FULL REPORT */}

              <button
                className="view-report-btn"
                onClick={() =>
                  navigate(
                    `/doctor/assessment/${assessment._id}`
                  )
                }
              >
                Open full report →
              </button>

            </div>
          )}
        </section>

        {/* =================================================
            DOCTOR NOTES
        ================================================= */}

        <section className="detail-card">

          <div className="section-heading">
            <h2>Doctor Notes</h2>
          </div>

          <textarea
            className="doctor-notes"
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
            placeholder="Write your consultation notes here..."
            rows={7}
          />

          <button
            className="save-notes-btn"
            onClick={saveNotes}
            disabled={savingNotes}
          >
            {savingNotes
              ? "Saving..."
              : "Save Notes"}
          </button>

        </section>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <section className="detail-card">

          <div className="appointment-action-row">

            {appointment.status ===
              "pending" && (
              <>
                <button
                  className="accept-btn"
                  onClick={
                    acceptAppointment
                  }
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Processing..."
                    : "Accept Appointment"}
                </button>

                <button
                  className="reject-btn"
                  onClick={
                    rejectAppointment
                  }
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Processing..."
                    : "Reject Appointment"}
                </button>
              </>
            )}

            {appointment.status ===
              "accepted" && (
              <button
                className="complete-btn"
                onClick={
                  completeAppointment
                }
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Processing..."
                  : "Mark Consultation Complete"}
              </button>
            )}

          </div>

        </section>

      </div>
    </div>
  );
}