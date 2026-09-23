import { useLocation, Link } from "react-router-dom";
import "./styles.css";

export default function AppointmentConfirmation() {
  const { state } = useLocation();
  const mode = state?.mode ?? "video";
  const slot = state?.slot ?? "4:30 PM";

  const modeLabel = { video: "Video call", chat: "Text chat", "in-person": "In-person" }[mode];

  return (
    <>
      <div className="topbar">
        <div className="topbar__brand">DermaDetect</div>
        <Link className="topbar__back" to="/">Close</Link>
      </div>

      <div className="page" style={{ textAlign: "center", maxWidth: 480 }}>
        <div className="confirm-icon">✓</div>
        <h1 className="page__title">Appointment booked</h1>
        <p className="page__subtitle">
          A confirmation has been sent to your email. You'll get a reminder 15 minutes before the call.
        </p>

        <div className="panel" style={{ textAlign: "left", marginBottom: 24 }}>
          <div className="summary-row"><span>Doctor</span><span>Dr. Ananya Sharma</span></div>
          <div className="summary-row"><span>Type</span><span>{modeLabel}</span></div>
          <div className="summary-row"><span>Date &amp; time</span><span>Today, {slot}</span></div>
          <div className="summary-row"><span>Fee</span><span>₹499 · Paid</span></div>
          <div className="summary-row"><span>Linked report</span><span>Skin analysis, 23 Sep</span></div>
        </div>

        <a href="#" className="btn btn-primary btn-block" style={{ marginBottom: 10 }}>
          Add to calendar
        </a>
        <Link to="/appointments" className="btn btn-outline btn-block">
          View my appointments
        </Link>
      </div>
    </>
  );
}