import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

const MODES = [
  { id: "video", icon: "🎥", label: "Video call" },
  { id: "chat", icon: "💬", label: "Text chat" },
  { id: "in-person", icon: "🏥", label: "In-person" },
];

const SLOT_GROUPS = [
  {
    label: "Today, 23 Sep",
    slots: [
      { time: "4:30 PM", full: false },
      { time: "5:00 PM", full: false },
      { time: "5:30 PM", full: true },
      { time: "6:00 PM", full: false },
      { time: "6:30 PM", full: false },
      { time: "7:00 PM", full: true },
    ],
  },
  {
    label: "Tomorrow, 24 Sep",
    slots: [
      { time: "10:00 AM", full: false },
      { time: "10:30 AM", full: false },
      { time: "11:00 AM", full: false },
    ],
  },
];

export default function DoctorProfile() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState("video");
  const [selectedSlot, setSelectedSlot] = useState("4:30 PM");

  function handleBook() {
    navigate("/consult/confirmation", { state: { mode: selectedMode, slot: selectedSlot } });
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar__brand">DermaDetect</div>
        <a className="topbar__back" href="/consult">← All doctors</a>
      </div>

      <div className="page">
        <div className="panel" style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <div className="doctor-card__avatar" style={{ width: 72, height: 72, fontSize: "1.3rem" }}>
            AS
          </div>
          <div>
            <div className="doctor-card__name" style={{ fontSize: "1.15rem" }}>
              Dr. Ananya Sharma
            </div>
            <div className="doctor-card__role">Dermatologist · MD, 8 yrs experience</div>
            <div className="doctor-card__meta">
              <span>⭐ 4.8 (210 reviews)</span>
              <span>📍 2.4 km · Hazratganj Clinic</span>
            </div>
            <span className="status-dot">Available now</span>
          </div>
        </div>

        <h2 className="page__title" style={{ fontSize: "1.1rem" }}>
          Choose consultation type
        </h2>
        <div className="mode-select">
          {MODES.map((m) => (
            <div
              key={m.id}
              className={`mode-option${selectedMode === m.id ? " is-selected" : ""}`}
              onClick={() => setSelectedMode(m.id)}
            >
              <span className="mode-option__icon">{m.icon}</span>
              {m.label}
            </div>
          ))}
        </div>

        {SLOT_GROUPS.map((group) => (
          <div className="slot-group" key={group.label}>
            <div className="slot-group__label">{group.label}</div>
            <div className="slot-grid">
              {group.slots.map((s) => (
                <div
                  key={s.time}
                  className={`slot${s.full ? " is-full" : ""}${
                    !s.full && selectedSlot === s.time ? " is-selected" : ""
                  }`}
                  onClick={() => !s.full && setSelectedSlot(s.time)}
                >
                  {s.time}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="panel" style={{ margin: "20px 0", background: "var(--bg-section)", boxShadow: "none" }}>
          <div className="summary-row">
            <span>Consultation fee</span>
            <span>₹499</span>
          </div>
          <div className="summary-row">
            <span>Report shared with doctor</span>
            <span>Skin analysis, 23 Sep</span>
          </div>
        </div>

        <button className="btn btn-primary btn-block" onClick={handleBook}>
          Book appointment — {selectedSlot} {SLOT_GROUPS[0].label.split(",")[0].toLowerCase()}
        </button>
      </div>
    </>
  );
}