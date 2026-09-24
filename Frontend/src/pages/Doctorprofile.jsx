import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import "./styles.css";

const MODES = [
  {
    id: "video",
    icon: "🎥",
    label: "Video call",
  },
  {
    id: "text",
    icon: "💬",
    label: "Text chat",
  },
];

const SLOT_GROUPS = [
  {
    label: "Today",
    date: new Date().toISOString().split("T")[0],

    slots: [
      {
        startTime: "16:30",
        endTime: "17:00",
        label: "4:30 PM",
      },
      {
        startTime: "17:00",
        endTime: "17:30",
        label: "5:00 PM",
      },
      {
        startTime: "18:00",
        endTime: "18:30",
        label: "6:00 PM",
      },
      {
        startTime: "18:30",
        endTime: "19:00",
        label: "6:30 PM",
      },
    ],
  },
];

export default function DoctorProfile() {
  const navigate = useNavigate();
  const { doctorId } = useParams();

  const [selectedMode, setSelectedMode] =
    useState("video");

  const [selectedSlot, setSelectedSlot] =
    useState(null);

  const [reason, setReason] =
    useState("");

  const [patientMessage, setPatientMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleBook = async () => {
    try {
      setError("");

      if (!doctorId) {
        setError(
          "Doctor information is missing"
        );
        return;
      }

      if (!selectedSlot) {
        setError(
          "Please select an appointment slot"
        );
        return;
      }

      setLoading(true);

      // ------------------------------------------------
      // Backend automatically attaches latest report.
      // assessmentId is NOT required here.
      // ------------------------------------------------

      const response =
        await api.post(
          "/api/appointments",
          {
            doctorProfileId: doctorId,

            mode: selectedMode,

            date:
              SLOT_GROUPS[0].date,

            startTime:
              selectedSlot.startTime,

            endTime:
              selectedSlot.endTime,

            reason,

            patientMessage,
          }
        );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to book appointment"
        );
      }

      navigate(
        "/consult/confirmation",
        {
          state: {
            appointment:
              response.data.appointment,
          },
        }
      );
    } catch (err) {
      console.error(
        "BOOK APPOINTMENT ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to book appointment"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar__brand">
          DermaDetect
        </div>

        <button
          className="topbar__back"
          onClick={() =>
            navigate("/consult")
          }
        >
          ← All doctors
        </button>
      </div>

      <div className="page">
        <div className="panel">
          <h2>
            Book Dermatologist Consultation
          </h2>

          <p className="page__subtitle">
            Select your consultation mode and
            preferred time.
          </p>
        </div>

        {/* Consultation mode */}

        <h2
          className="page__title"
          style={{
            fontSize: "1.1rem",
            marginTop: 24,
          }}
        >
          Choose consultation type
        </h2>

        <div className="mode-select">
          {MODES.map((mode) => (
            <button
              type="button"
              key={mode.id}
              className={`mode-option ${
                selectedMode === mode.id
                  ? "is-selected"
                  : ""
              }`}
              onClick={() =>
                setSelectedMode(mode.id)
              }
            >
              <span className="mode-option__icon">
                {mode.icon}
              </span>

              {mode.label}
            </button>
          ))}
        </div>

        {/* Slots */}

        <h2
          className="page__title"
          style={{
            fontSize: "1.1rem",
          }}
        >
          Select appointment time
        </h2>

        {SLOT_GROUPS.map((group) => (
          <div
            className="slot-group"
            key={group.date}
          >
            <div className="slot-group__label">
              {group.label}
            </div>

            <div className="slot-grid">
              {group.slots.map((slot) => {
                const selected =
                  selectedSlot?.startTime ===
                  slot.startTime;

                return (
                  <button
                    type="button"
                    key={slot.startTime}
                    className={`slot ${
                      selected
                        ? "is-selected"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedSlot(slot)
                    }
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Reason */}

        <div className="panel">
          <h3>Consultation details</h3>

          <label>
            Reason for consultation
          </label>

          <input
            type="text"
            value={reason}
            onChange={(e) =>
              setReason(e.target.value)
            }
            placeholder="e.g. Skin irritation"
            style={{
              width: "100%",
              padding: 12,
              marginTop: 8,
              marginBottom: 16,
            }}
          />

          <label>
            Message for doctor
          </label>

          <textarea
            value={patientMessage}
            onChange={(e) =>
              setPatientMessage(
                e.target.value
              )
            }
            placeholder="Tell the doctor anything important..."
            rows={4}
            style={{
              width: "100%",
              padding: 12,
              marginTop: 8,
              resize: "vertical",
            }}
          />
        </div>

        {/* Report information */}

        <div
          className="panel"
          style={{
            marginTop: 20,
            background:
              "var(--bg-section)",
          }}
        >
          <strong>
            🩺 Latest skin report
          </strong>

          <p
            style={{
              marginBottom: 0,
              color:
                "var(--text-secondary)",
            }}
          >
            Your latest analyzed skin report
            will automatically be shared with
            the doctor for this consultation.
          </p>
        </div>

        {/* Error */}

        {error && (
          <div
            style={{
              color: "#b42318",
              background: "#fef3f2",
              padding: 12,
              borderRadius: 8,
              marginTop: 16,
            }}
          >
            {error}
          </div>
        )}

        {/* Book */}

        <button
          className="btn btn-primary btn-block"
          style={{
            marginTop: 20,
          }}
          disabled={
            loading || !selectedSlot
          }
          onClick={handleBook}
        >
          {loading
            ? "Booking..."
            : selectedSlot
            ? `Book appointment — ${selectedSlot.label}`
            : "Select a time slot"}
        </button>
      </div>
    </>
  );
}