import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";

import "../components/styles/doctor-appointments.css";

export default function DoctorAppointmentDetails() {
  const { appointmentId } =
    useParams();

  const navigate = useNavigate();

  const [appointment, setAppointment] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [savingNotes, setSavingNotes] =
    useState(false);

  const fetchAppointment = async () => {
    try {
      setLoading(true);

      const response =
        await api.get(
          `/api/appointments/${appointmentId}`
        );

      const data =
        response.data?.appointment;

      setAppointment(data);

      setNotes(
        data?.doctorNotes || ""
      );
    } catch (err) {
      console.error(
        "GET APPOINTMENT ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load consultation"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  const updateStatus = async (
    status
  ) => {
    try {
      await api.patch(
        `/api/appointments/${appointmentId}/status`,
        {
          status,
        }
      );

      fetchAppointment();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to update status"
      );
    }
  };

  const completeAppointment =
    async () => {
      try {
        await api.patch(
          `/api/appointments/${appointmentId}/complete`
        );

        fetchAppointment();
      } catch (err) {
        alert(
          err.response?.data?.message ||
            "Unable to complete appointment"
        );
      }
    };

  const saveNotes = async () => {
    try {
      setSavingNotes(true);

      await api.patch(
        `/api/appointments/${appointmentId}/notes`,
        {
          doctorNotes: notes,
        }
      );

      alert(
        "Doctor notes saved successfully"
      );

      fetchAppointment();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to save notes"
      );
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return (
      <div className="doctor-detail-state">
        Loading consultation...
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctor-detail-state">
        <h3>
          Unable to load consultation
        </h3>

        <p>{error}</p>

        <button
          onClick={() =>
            navigate(
              "/doctor-appointments"
            )
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

  const patient =
    appointment.patient || {};

  const assessment =
    appointment.assessment;

  const prediction =
    assessment?.prediction || {};

  return (
    <div className="doctor-detail-page">
      <div className="doctor-detail-container">

        {/* Header */}

        <div className="doctor-detail-header">

          <button
            onClick={() =>
              navigate(
                "/doctor-appointments"
              )
            }
          >
            ← Appointments
          </button>

          <div>
            <p>
              DERMADETECT AI
            </p>

            <h1>
              Patient Consultation
            </h1>
          </div>

        </div>

        {/* Patient information */}

        <section className="detail-card">

          <div className="section-heading">
            <h2>
              Patient Information
            </h2>
          </div>

          <div className="patient-detail-grid">

            <div>
              <span>
                Name
              </span>

              <strong>
                {patient.fullName ||
                  "Patient"}
              </strong>
            </div>

            <div>
              <span>
                Email
              </span>

              <strong>
                {patient.email ||
                  "Not available"}
              </strong>
            </div>

            <div>
              <span>
                Gender
              </span>

              <strong>
                {patient.gender ||
                  "Not specified"}
              </strong>
            </div>

            <div>
              <span>
                Age
              </span>

              <strong>
                {patient.age
                  ? `${patient.age} years`
                  : "Not specified"}
              </strong>
            </div>

          </div>

        </section>

        {/* Appointment */}

        <section className="detail-card">

          <div className="section-heading">
            <h2>
              Appointment
            </h2>
          </div>

          <div className="patient-detail-grid">

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
                Consultation mode
              </span>

              <strong>
                {appointment.mode ===
                "video"
                  ? "🎥 Video consultation"
                  : "💬 Text consultation"}
              </strong>
            </div>

            <div>
              <span>
                Status
              </span>

              <strong
                className={`status ${appointment.status}`}
              >
                {appointment.status}
              </strong>
            </div>

          </div>

          {appointment.reason && (
            <div className="message-box">
              <span>
                Consultation reason
              </span>

              <p>
                {appointment.reason}
              </p>
            </div>
          )}

          {appointment.patientMessage && (
            <div className="message-box">
              <span>
                Patient message
              </span>

              <p>
                {
                  appointment.patientMessage
                }
              </p>
            </div>
          )}

        </section>

        {/* Skin report */}

        <section className="detail-card report-card">

          <div className="section-heading">
            <div>
              <h2>
                Latest Skin Analysis Report
              </h2>

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
              <h3>
                No report attached
              </h3>

              <p>
                The patient did not have an
                analyzed skin report when the
                appointment was booked.
              </p>
            </div>
          ) : (
            <div className="report-content">

              {/* Image */}

              {assessment.image && (
                <div className="report-image-wrapper">
                  <img
                    src={
                      assessment.image
                    }
                    alt="Patient skin assessment"
                    className="report-image"
                  />
                </div>
              )}

              {/* Prediction */}

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
                    {prediction.confidence !=
                    null
                      ? `${(
                          prediction.confidence *
                          100
                        ).toFixed(1)}%`
                      : "Not available"}
                  </strong>
                </div>

                <div className="prediction-box">
                  <span>
                    Severity
                  </span>

                  <strong>
                    {prediction.severity ||
                      "Not available"}
                  </strong>
                </div>

                <div className="prediction-box">
                  <span>
                    Status
                  </span>

                  <strong>
                    {assessment.status}
                  </strong>
                </div>

              </div>

              {/* Description */}

              {prediction.description && (
                <div className="report-section">
                  <h3>
                    Description
                  </h3>

                  <p>
                    {
                      prediction.description
                    }
                  </p>
                </div>
              )}

              {/* Explanation */}

              {assessment.explanation && (
                <div className="report-section">
                  <h3>
                    Analysis explanation
                  </h3>

                  <p>
                    {
                      assessment.explanation
                    }
                  </p>
                </div>
              )}

              {/* Recommendation */}

              {(prediction.recommendation ||
                assessment.recommendation) && (
                <div className="report-section">
                  <h3>
                    Recommendation
                  </h3>

                  <p>
                    {prediction.recommendation ||
                      assessment.recommendation}
                  </p>
                </div>
              )}

              {/* Contagious */}

              {prediction.contagious && (
                <div className="report-section">
                  <h3>
                    Contagious
                  </h3>

                  <p>
                    {prediction.contagious}
                  </p>
                </div>
              )}

              {/* Assessment details */}

              <div className="report-section">
                <h3>
                  Patient-reported details
                </h3>

                <div className="assessment-details">

                  <div>
                    <span>
                      Location
                    </span>

                    <strong>
                      {
                        assessment.location
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Duration
                    </span>

                    <strong>
                      {
                        assessment.duration
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Itching
                    </span>

                    <strong>
                      {
                        assessment.itching
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Pain / Burning
                    </span>

                    <strong>
                      {
                        assessment.painBurning
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Changed / Spread
                    </span>

                    <strong>
                      {
                        assessment.changeSpread
                      }
                    </strong>
                  </div>

                </div>
              </div>

            </div>
          )}

        </section>

        {/* Doctor notes */}

        <section className="detail-card">

          <div className="section-heading">
            <h2>
              Doctor Notes
            </h2>
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

        {/* Actions */}

        <section className="detail-card">

          <div className="appointment-action-row">

            {appointment.status ===
              "pending" && (
              <>
                <button
                  className="accept-btn"
                  onClick={() =>
                    updateStatus(
                      "accepted"
                    )
                  }
                >
                  Accept Appointment
                </button>

                <button
                  className="reject-btn"
                  onClick={() =>
                    updateStatus(
                      "rejected"
                    )
                  }
                >
                  Reject Appointment
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
              >
                Mark Consultation Complete
              </button>
            )}

          </div>

        </section>

      </div>
    </div>
  );
}