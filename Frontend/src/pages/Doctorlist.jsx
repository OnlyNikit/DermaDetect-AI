import { useState } from "react";
import { Link } from "react-router-dom";
import "./styles.css";

const doctors = [
  {
    id: "ananya-sharma",
    initials: "AS",
    name: "Dr. Ananya Sharma",
    role: "Dermatologist · MD, 8 yrs experience",
    rating: "4.8",
    distanceKm: 2.4,
    status: "available",
    nextSlot: null,
    modes: ["Video", "Chat", "In-person"],
  },
  {
    id: "rohit-khanna",
    initials: "RK",
    name: "Dr. Rohit Khanna",
    role: "Dermatologist · MBBS, DVD, 5 yrs experience",
    rating: "4.6",
    distanceKm: 4.1,
    status: "busy",
    nextSlot: "Today 6:00 PM",
    modes: ["Video", "Chat"],
  },
  {
    id: "priya-mehta",
    initials: "PM",
    name: "Dr. Priya Mehta",
    role: "Dermatologist · MD, 12 yrs experience",
    rating: "4.9",
    distanceKm: 6.8,
    status: "available",
    nextSlot: null,
    modes: ["In-person"],
  },
];

const FILTERS = ["Nearby", "Available now", "All doctors"];

function DoctorCard({ doctor }) {
  return (
    <Link to={`/consult/${doctor.id}`} className="doctor-card" style={{ display: "flex" }}>
      <div className="doctor-card__avatar">{doctor.initials}</div>
      <div className="doctor-card__body">
        <div className="doctor-card__name">{doctor.name}</div>
        <div className="doctor-card__role">{doctor.role}</div>
        <div className="doctor-card__meta">
          <span>⭐ {doctor.rating}</span>
          <span>📍 {doctor.distanceKm} km away</span>
        </div>
        {doctor.status === "available" ? (
          <span className="status-dot">Available now</span>
        ) : (
          <span className="status-dot" style={{ color: "var(--text-secondary)" }}>
            Next slot: {doctor.nextSlot}
          </span>
        )}
        <div className="mode-row">
          {doctor.modes.map((m) => (
            <span className="mode-tag" key={m}>{m}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export default function DoctorList() {
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);

  const visibleDoctors =
    activeFilter === "Available now"
      ? doctors.filter((d) => d.status === "available")
      : activeFilter === "Nearby"
      ? [...doctors].sort((a, b) => a.distanceKm - b.distanceKm)
      : doctors;

  return (
    <>
      <div className="topbar">
        <div className="topbar__brand">DermaDetect</div>
        <Link className="topbar__back" to="/report">← Back to report</Link>
      </div>

      <div className="page">
        <div className="page__eyebrow">Consultation</div>
        <h1 className="page__title">Find a dermatologist</h1>
        <p className="page__subtitle">
          Based on your latest skin assessment, here are specialists you can consult.
        </p>

        <div className="location-row">
          📍 Lucknow, Uttar Pradesh
          <a href="#" style={{ marginLeft: "auto", color: "var(--color-primary)", fontWeight: 500 }}>
            Change
          </a>
        </div>

        <div className="filters">
          {FILTERS.map((f) => (
            <div
              key={f}
              className={`filter-chip${activeFilter === f ? " is-active" : ""}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </div>
          ))}
        </div>

        {visibleDoctors.map((d) => (
          <DoctorCard doctor={d} key={d.id} />
        ))}
      </div>
    </>
  );
}