import { useLocation, Link } from "react-router-dom";
import "../components/styles/appointmentconfirmation.css";
import { useToast } from "../components/context/ToastContext";

export default function AppointmentConfirmation() {
  const { state } = useLocation();
  const { showToast } = useToast();

  const appointment = state?.appointment;

  // --------------------------------------------------
  // FALLBACK VALUES
  // --------------------------------------------------

  const mode =
    appointment?.mode ||
    state?.mode ||
    "video";

  const modeLabel = {
    video: "Video call",
    text: "Text chat",
    "in-person": "In-person",
  }[mode] || mode;

  const doctor = appointment?.doctor;
  const doctorProfile =
    appointment?.doctorProfile;

  const assessment =
    appointment?.assessment;

  const doctorName =
    doctor?.fullName ||
    "Doctor";

  const date =
    appointment?.date ||
    state?.date ||
    "Not specified";

  const startTime =
    appointment?.startTime ||
    state?.startTime ||
    "";

  const endTime =
    appointment?.endTime ||
    state?.endTime ||
    "";

  const time =
    startTime && endTime
      ? `${startTime} - ${endTime}`
      : startTime || "Not specified";

  const fee =
    doctorProfile?.consultationFee ??
    state?.fee ??
    0;

  const disease =
    assessment?.prediction?.disease ||
    "No report attached";

  const severity =
    assessment?.prediction?.severity ||
    "";

  const assessmentDate =
    assessment?.createdAt
      ? new Date(
          assessment.createdAt
        ).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "";

  // --------------------------------------------------
  // CALENDAR
  // --------------------------------------------------

  const handleAddToCalendar = () => {
    showToast(
      "Calendar integration will be available soon.",
      "info"
    );
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <>
      {/* TOP BAR */}

      <div className="topbar">
        <div className="topbar__brand">
          DermaDetect
        </div>

        <Link
          className="topbar__back"
          to="/"
        >
          Close
        </Link>
      </div>

      {/* PAGE */}

      <div
        className="page"
        style={{
          textAlign: "center",
          maxWidth: 480,
        }}
      >

        {/* SUCCESS ICON */}

        <div className="confirm-icon">
          ✓
        </div>

        <h1 className="page__title">
          Appointment booked
        </h1>

        <p className="page__subtitle">
          Your consultation request has been
          successfully sent to the doctor.
        </p>

        {/* APPOINTMENT SUMMARY */}

        <div
          className="panel"
          style={{
            textAlign: "left",
            marginBottom: 24,
          }}
        >

          {/* Doctor */}

          <div className="summary-row">
            <span>
              Doctor
            </span>

            <span>
              Dr. {doctorName}
            </span>
          </div>

          {/* Specialization */}

          {doctorProfile?.specialization && (
            <div className="summary-row">
              <span>
                Specialization
              </span>

              <span>
                {doctorProfile.specialization}
              </span>
            </div>
          )}

          {/* Mode */}

          <div className="summary-row">
            <span>
              Type
            </span>

            <span>
              {modeLabel}
            </span>
          </div>

          {/* Date */}

          <div className="summary-row">
            <span>
              Date
            </span>

            <span>
              {date}
            </span>
          </div>

          {/* Time */}

          <div className="summary-row">
            <span>
              Time
            </span>

            <span>
              {time}
            </span>
          </div>

          {/* Fee */}

          <div className="summary-row">
            <span>
              Consultation fee
            </span>

            <span>
              ₹{fee}
            </span>
          </div>

          {/* STATUS */}

          <div className="summary-row">
            <span>
              Status
            </span>

            <span>
              {appointment?.status ||
                "pending"}
            </span>
          </div>

          {/* REPORT */}

          <div className="summary-row">
            <span>
              Linked report
            </span>

            <span>
              {assessment ? (
                <>
                  {disease}

                  {severity && (
                    <>
                      {" · "}
                      {severity}
                    </>
                  )}

                  {assessmentDate && (
                    <>
                      {" · "}
                      {assessmentDate}
                    </>
                  )}
                </>
              ) : (
                "No report attached"
              )}
            </span>
          </div>

        </div>

        {/* INFO */}

        <div
          style={{
            marginBottom: 20,
            fontSize: 14,
            opacity: 0.8,
          }}
        >
          <p>
            Your appointment request has been
            sent to the doctor.
          </p>

          {appointment?.status ===
            "pending" && (
            <p>
              The consultation will become
              active after the doctor accepts
              your request.
            </p>
          )}
        </div>

        {/* BUTTONS */}

        <button
          type="button"
          className="btn btn-primary btn-block"
          style={{
            marginBottom: 10,
          }}
          onClick={
            handleAddToCalendar
          }
        >
          Add to calendar
        </button>

        <Link
          to="/my-appointments"
          className="btn btn-outline btn-block"
        >
          View my appointments
        </Link>

      </div>
    </>
  );
}