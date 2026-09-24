import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function MyAppointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/api/appointments/my"
      );

      setAppointments(
        response.data?.appointments || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load appointments"
      );
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmCancel) return;

    try {
      await api.patch(
        `/api/appointments/${id}/cancel`
      );

      fetchAppointments();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to cancel appointment"
      );
    }
  };

  if (loading) {
    return <div>Loading appointments...</div>;
  }

  return (
    <div className="appointments-page">

      <h1>My Appointments</h1>

      {error && (
        <p>{error}</p>
      )}

      {appointments.length === 0 ? (

        <div>
          <h3>No appointments yet</h3>

          <button
            onClick={() =>
              navigate("/doctors")
            }
          >
            Find a Doctor
          </button>
        </div>

      ) : (

        <div className="appointments-list">

          {appointments.map((appointment) => {

            const doctor =
              appointment.doctor || {};

            const assessment =
              appointment.assessment;

            return (
              <div
                key={appointment._id}
                className="appointment-card"
              >

                <h2>
                  Dr.{" "}
                  {doctor.fullName ||
                    "Doctor"}
                </h2>

                <p>
                  {appointment.date}
                </p>

                <p>
                  {appointment.startTime}
                  {" - "}
                  {appointment.endTime}
                </p>

                <p>
                  Mode:{" "}
                  {appointment.mode}
                </p>

                <strong>
                  Status:{" "}
                  {appointment.status}
                </strong>

                {assessment && (
                  <div>
                    <p>
                      AI Report:{" "}
                      {assessment.prediction
                        ?.disease ||
                        "Available"}
                    </p>

                    <p>
                      Severity:{" "}
                      {assessment.prediction
                        ?.severity ||
                        "—"}
                    </p>
                  </div>
                )}

                {["pending", "accepted"].includes(
                  appointment.status
                ) && (
                  <button
                    onClick={() =>
                      cancelAppointment(
                        appointment._id
                      )
                    }
                  >
                    Cancel Appointment
                  </button>
                )}

              </div>
            );

          })}

        </div>

      )}

    </div>
  );
}