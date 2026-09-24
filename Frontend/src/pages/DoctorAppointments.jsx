import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";

import "../components/styles/doctor-appointments.css";

export default function DoctorAppointments() {
  const navigate = useNavigate();

  const [
    appointments,
    setAppointments,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(
          "/api/appointments/doctor"
        );

      setAppointments(
        response.data?.appointments || []
      );
    } catch (err) {
      console.error(
        "GET DOCTOR APPOINTMENTS ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load appointments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (
    appointmentId,
    status
  ) => {
    try {
      await api.patch(
        `/api/appointments/${appointmentId}/status`,
        {
          status,
        }
      );

      fetchAppointments();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to update appointment"
      );
    }
  };

  return (
    <div className="doctor-appointments-page">
      <div className="doctor-appointments-container">

        {/* Header */}

        <div className="doctor-appointments-header">
          <button
            onClick={() =>
              navigate("/doctor-dashboard")
            }
          >
            ← Dashboard
          </button>

          <div>
            <p>
              DERMADETECT AI
            </p>

            <h1>
              Patient Appointments
            </h1>

            <span>
              Review consultation requests
              and patient reports.
            </span>
          </div>
        </div>

        {/* Loading */}

        {loading && (
          <div className="appointment-state">
            Loading appointments...
          </div>
        )}

        {/* Error */}

        {!loading && error && (
          <div className="appointment-state error">
            <h3>
              Unable to load appointments
            </h3>

            <p>{error}</p>

            <button
              onClick={fetchAppointments}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}

        {!loading &&
          !error &&
          appointments.length === 0 && (
            <div className="appointment-state">
              <h3>
                No appointments yet
              </h3>

              <p>
                Patient consultation requests
                will appear here.
              </p>
            </div>
          )}

        {/* Appointment list */}

        {!loading &&
          !error &&
          appointments.length > 0 && (
            <div className="appointment-list">

              {appointments.map(
                (appointment) => {
                  const patient =
                    appointment.patient ||
                    {};

                  const assessment =
                    appointment.assessment;

                  return (
                    <div
                      className="appointment-card"
                      key={
                        appointment._id
                      }
                    >

                      {/* Patient */}

                      <div className="appointment-main">

                        <div className="patient-avatar">
                          {(
                            patient.fullName ||
                            "P"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <h2>
                            {
                              patient.fullName ||
                              "Patient"
                            }
                          </h2>

                          <p>
                            {patient.email}
                          </p>

                          <span>
                            {patient.gender
                              ? `${patient.gender}`
                              : ""}

                            {patient.age
                              ? ` • ${patient.age} years`
                              : ""}
                          </span>
                        </div>

                      </div>

                      {/* Appointment info */}

                      <div className="appointment-info">

                        <div>
                          <span>
                            Date
                          </span>

                          <strong>
                            {
                              appointment.date
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            Time
                          </span>

                          <strong>
                            {
                              appointment.startTime
                            }{" "}
                            -
                            {
                              appointment.endTime
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            Mode
                          </span>

                          <strong>
                            {appointment.mode ===
                            "video"
                              ? "🎥 Video"
                              : "💬 Text"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Status
                          </span>

                          <strong
                            className={`status ${appointment.status}`}
                          >
                            {
                              appointment.status
                            }
                          </strong>
                        </div>

                      </div>

                      {/* Report */}

                      <div className="report-preview">

                        <div>
                          <span>
                            Latest Skin Report
                          </span>

                          {assessment ? (
                            <strong>
                              {assessment
                                .prediction
                                ?.disease ||
                                "Analyzed"}
                            </strong>
                          ) : (
                            <strong>
                              No report attached
                            </strong>
                          )}
                        </div>

                        {assessment && (
                          <div>
                            <span>
                              Severity
                            </span>

                            <strong>
                              {assessment
                                .prediction
                                ?.severity ||
                                "Not available"}
                            </strong>
                          </div>
                        )}

                      </div>

                      {/* Actions */}

                      <div className="appointment-actions">

                        {appointment.status ===
                          "pending" && (
                          <>
                            <button
                              className="accept-btn"
                              onClick={() =>
                                updateStatus(
                                  appointment._id,
                                  "accepted"
                                )
                              }
                            >
                              Accept
                            </button>

                            <button
                              className="reject-btn"
                              onClick={() =>
                                updateStatus(
                                  appointment._id,
                                  "rejected"
                                )
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}

                        <button
                          className="view-btn"
                          onClick={() =>
                            navigate(
                              `/doctor-appointments/${appointment._id}`
                            )
                          }
                        >
                          View Consultation →
                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}
      </div>
    </div>
  );
}