import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../components/styles/doctorpages.css";
import "../components/styles/doctor-extra.css";

const pad = (n) => String(n).padStart(2, "0");

const toDateString = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const formatDay = (dateString) =>
  new Date(`${dateString}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function DoctorAvailability() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [slots, setSlots] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const today = toDateString(new Date());

  const [form, setForm] = useState({
    date: today,
    startTime: "10:00",
    endTime: "13:00",
    repeatDays: 1,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/doctors/profile/me");
      const data = response.data?.profile || null;

      setProfile(data);
      setIsAvailable(data?.isAvailable !== false);

      // only today + future slots
      setSlots(
        (data?.availabilitySlots || [])
          .filter((slot) => slot.date >= today)
          .map(({ date, startTime, endTime }) => ({
            date,
            startTime,
            endTime,
          }))
      );

      setDirty(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load doctor availability."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------
  // Group slots by date (sorted)
  // ---------------------------------------------
  const grouped = useMemo(() => {
    const map = {};

    slots.forEach((slot) => {
      if (!map[slot.date]) map[slot.date] = [];
      map[slot.date].push(slot);
    });

    return Object.keys(map)
      .sort()
      .map((date) => ({
        date,
        items: map[date].sort((a, b) => a.startTime.localeCompare(b.startTime)),
      }));
  }, [slots]);

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ---------------------------------------------
  // Add time frame (optionally repeat for N days)
  // ---------------------------------------------
  const addSlot = () => {
    setError("");
    setSuccess("");

    if (!form.date || !form.startTime || !form.endTime) {
      setError("Select date, start time and end time.");
      return;
    }

    if (form.date < today) {
      setError("You cannot add availability for a past date.");
      return;
    }

    if (form.startTime >= form.endTime) {
      setError("End time must be after start time.");
      return;
    }

    const repeat = Number(form.repeatDays) || 1;
    const next = [...slots];
    let skipped = 0;

    for (let i = 0; i < repeat; i++) {
      const d = new Date(`${form.date}T00:00:00`);
      d.setDate(d.getDate() + i);
      const date = toDateString(d);

      const overlaps = next.some(
        (s) =>
          s.date === date &&
          form.startTime < s.endTime &&
          form.endTime > s.startTime
      );

      if (overlaps) {
        skipped++;
        continue;
      }

      next.push({
        date,
        startTime: form.startTime,
        endTime: form.endTime,
      });
    }

    setSlots(next);
    setDirty(true);

    if (skipped > 0) {
      setError(`${skipped} day(s) skipped because the time frame overlaps.`);
    }
  };

  const removeSlot = (target) => {
    setSlots((prev) =>
      prev.filter(
        (s) =>
          !(
            s.date === target.date &&
            s.startTime === target.startTime &&
            s.endTime === target.endTime
          )
      )
    );
    setDirty(true);
    setSuccess("");
  };

  const removeDay = (date) => {
    setSlots((prev) => prev.filter((s) => s.date !== date));
    setDirty(true);
    setSuccess("");
  };

  // ---------------------------------------------
  // Save
  // ---------------------------------------------
  const saveAvailability = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.put("/api/doctors/availability/me", {
        isAvailable,
        slots,
      });

      const updated = response.data?.profile;

      if (updated) {
        setProfile(updated);
        setSlots(
          (updated.availabilitySlots || []).map(
            ({ date, startTime, endTime }) => ({ date, startTime, endTime })
          )
        );
      }

      setDirty(false);
      setSuccess("Availability saved successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save availability.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="doctor-page">
        <div className="doctor-container">
          <div className="doctor-loading">
            <div className="doctor-spinner"></div>
            <p>Loading availability...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-page">
      <div className="doctor-container">
        {/* HEADER */}
        <div className="doctor-page-header">
          <div>
            <span className="doctor-eyebrow">Doctor Settings</span>
            <h1>Doctor Availability</h1>
            <p>
              Add date-wise time frames. Patients can only book inside the time
              frames you add here.
            </p>
          </div>

          <button
            className="doctor-btn doctor-btn-secondary"
            onClick={() => navigate("/doctor-dashboard")}
          >
            ← Dashboard
          </button>
        </div>

        {error && <div className="doctor-alert doctor-alert-error">{error}</div>}

        {success && (
          <div className="doctor-alert doctor-alert-success">{success}</div>
        )}

        {/* STATUS */}
        {profile && (
          <div className="doctor-card availability-overview">
            <div>
              <span className="overview-label">Accepting consultations</span>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => {
                    setIsAvailable(e.target.checked);
                    setDirty(true);
                    setSuccess("");
                  }}
                />
                <span>
                  {isAvailable ? "Available for consultations" : "Currently unavailable"}
                </span>
              </label>
            </div>

            <div className="overview-item">
              <span>Consultation Fee</span>
              <strong>₹{profile.consultationFee || 0}</strong>
            </div>

            <div className="overview-item">
              <span>Upcoming days</span>
              <strong>{grouped.length}</strong>
            </div>
          </div>
        )}

        {/* ADD TIME FRAME */}
        <div className="doctor-card">
          <h2>Add time frame</h2>
          <p className="doctor-card-subtitle">
            You can add several time frames on the same day (e.g. morning and
            evening).
          </p>

          <div className="slot-form">
            <div className="slot-field">
              <label>Date</label>
              <input
                type="date"
                name="date"
                min={today}
                value={form.date}
                onChange={handleFormChange}
              />
            </div>

            <div className="slot-field">
              <label>From</label>
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleFormChange}
              />
            </div>

            <div className="slot-field">
              <label>To</label>
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleFormChange}
              />
            </div>

            <div className="slot-field">
              <label>Repeat for</label>
              <select
                name="repeatDays"
                value={form.repeatDays}
                onChange={handleFormChange}
              >
                <option value={1}>Only this day</option>
                <option value={7}>Next 7 days</option>
                <option value={14}>Next 14 days</option>
                <option value={30}>Next 30 days</option>
              </select>
            </div>

            <button
              type="button"
              className="doctor-btn doctor-btn-secondary"
              onClick={addSlot}
            >
              + Add
            </button>
          </div>
        </div>

        {/* SCHEDULE */}
        <div className="doctor-card">
          <div className="card-heading-row">
            <div>
              <h2>Upcoming Schedule</h2>
              <p className="doctor-card-subtitle">
                Today and future dates with your consultation hours.
              </p>
            </div>

            <button
              className="doctor-btn doctor-btn-primary"
              onClick={saveAvailability}
              disabled={saving || !dirty}
            >
              {saving ? "Saving..." : dirty ? "Save Changes" : "Saved"}
            </button>
          </div>

          {grouped.length === 0 ? (
            <div className="doctor-empty">
              <div className="doctor-empty-icon">🕐</div>
              <h3>No upcoming availability</h3>
              <p>Add a date and time frame above, then save.</p>
            </div>
          ) : (
            <div className="availability-list">
              {grouped.map((day) => (
                <div className="availability-day-card day-block" key={day.date}>
                  <div className="day-info">
                    <div className="day-icon">📅</div>
                    <div>
                      <strong>{formatDay(day.date)}</strong>
                      <span>{day.items.length} time frame(s)</span>
                    </div>
                  </div>

                  <div className="day-slots">
                    {day.items.map((slot, index) => (
                      <span className="slot-chip" key={index}>
                        🕐 {slot.startTime} — {slot.endTime}
                        <button
                          type="button"
                          title="Remove"
                          onClick={() => removeSlot(slot)}
                        >
                          ×
                        </button>
                      </span>
                    ))}

                    <button
                      type="button"
                      className="slot-clear"
                      onClick={() => removeDay(day.date)}
                    >
                      Clear day
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}