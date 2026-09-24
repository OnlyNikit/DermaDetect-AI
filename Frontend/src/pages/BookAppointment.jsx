import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import "../components/styles/bookAppointment.css";

export default function BookAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [assessments, setAssessments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    assessmentId: "",
    mode: "",
    date: "",
    startTime: "",
    endTime: "",
    reason: "",
    patientMessage: "",
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [doctorResponse, assessmentResponse] =
        await Promise.all([
          api.get(`/api/doctors/${id}`),
          api.get("/api/assessment"),
        ]);

      setDoctor(doctorResponse.data?.doctor || null);

      setAssessments(
        assessmentResponse.data?.assessments || []
      );
    } catch (err) {
      console.error(
        "BOOK PAGE ERROR:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to load booking information"
      );
    } finally {
      setLoading(false);
    }
  };

  const enabledSlots = useMemo(() => {
    return (doctor?.availability || []).filter(
      (slot) => slot.enabled
    );
  }, [doctor]);

  const selectedDayAvailability = useMemo(() => {
    if (!form.date) return null;

    const date = new Date(
      `${form.date}T00:00:00`
    );

    const dayName = date.toLocaleDateString("en-US", {
      weekday: "long",
    });

    return (
      enabledSlots.find(
        (slot) => slot.day === dayName
      ) || null
    );
  }, [form.date, enabledSlots]);

  const availableDates = useMemo(() => {
    const dates = [];

    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);

      date.setDate(today.getDate() + i);

      const dayName = date.toLocaleDateString(
        "en-US",
        {
          weekday: "long",
        }
      );

      const available = enabledSlots.some(
        (slot) => slot.day === dayName
      );

      if (available) {
        dates.push(
          date.toISOString().split("T")[0]
        );
      }
    }

    return dates;
  }, [enabledSlots]);

  const isDateAvailable = (dateString) => {
    return availableDates.includes(dateString);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "date") {
      setForm((prev) => ({
        ...prev,
        date: value,
        startTime: "",
        endTime: "",
      }));
    }
  };

  const handleStartTimeChange = (e) => {
    const startTime = e.target.value;

    setForm((prev) => ({
      ...prev,
      startTime,
    }));

    if (
      selectedDayAvailability &&
      startTime
    ) {
      setForm((prev) => ({
        ...prev,
        startTime,
        endTime:
          prev.endTime &&
          prev.endTime > startTime
            ? prev.endTime
            : "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!doctor) {
      setError("Doctor information is unavailable.");
      return;
    }

    if (!doctor.isAvailable) {
      setError(
        "This doctor is currently unavailable."
      );
      return;
    }

    if (!form.mode) {
      setError(
        "Please select consultation mode."
      );
      return;
    }

    if (!form.date) {
      setError(
        "Please select an appointment date."
      );
      return;
    }

    if (!isDateAvailable(form.date)) {
      setError(
        "Doctor is not available on the selected date."
      );
      return;
    }

    if (!form.startTime || !form.endTime) {
      setError(
        "Please select start and end time."
      );
      return;
    }

    if (
      form.startTime >= form.endTime
    ) {
      setError(
        "End time must be after start time."
      );
      return;
    }

    if (selectedDayAvailability) {
      if (
        form.startTime <
          selectedDayAvailability.startTime ||
        form.endTime >
          selectedDayAvailability.endTime
      ) {
        setError(
          `Please select a time between ${selectedDayAvailability.startTime} and ${selectedDayAvailability.endTime}.`
        );
        return;
      }
    }

    try {
      setBooking(true);

      const response = await api.post(
        "/api/appointments",
        {
          doctorProfileId: id,

          assessmentId:
            form.assessmentId || undefined,

          mode: form.mode,

          date: form.date,

          startTime: form.startTime,

          endTime: form.endTime,

          reason: form.reason.trim(),

          patientMessage:
            form.patientMessage.trim(),
        }
      );

      const appointment =
        response.data?.appointment;

      setSuccess(
        response.data?.message ||
          "Appointment request sent successfully."
      );

      setTimeout(() => {
        navigate("/appointment-confirmation", {
          state: {
            appointment,
            doctor,
          },
        });
      }, 800);

    } catch (err) {
      console.error(
        "BOOK APPOINTMENT ERROR:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to book appointment."
      );
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-page">
        <div className="booking-state">
          <div className="booking-loader"></div>
          <p>Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="booking-page">
        <div className="booking-state">
          <h3>Doctor not found</h3>

          <p>
            {error ||
              "The requested doctor profile could not be found."}
          </p>

          <button
            onClick={() => navigate("/doctors")}
          >
            ← Back to Doctors
          </button>
        </div>
      </div>
    );
  }

  const user = doctor.user || {};

  return (
    <div className="booking-page">

      <div className="booking-container">

        {/* BACK */}
        <button
          className="booking-back-btn"
          onClick={() =>
            navigate(
              `/doctors/${doctor._id}`
            )
          }
        >
          ← Back to Doctor
        </button>

        {/* HEADER */}
        <div className="booking-page-header">

          <div>
            <span className="booking-eyebrow">
              Consultation
            </span>

            <h1>
              Book an appointment
            </h1>

            <p>
              Choose a suitable time and share
              your skin assessment with the doctor.
            </p>
          </div>

        </div>

        {/* MAIN */}
        <div className="booking-layout">

          {/* LEFT */}
          <div className="booking-main">

            {/* DOCTOR CARD */}
            <div className="booking-card doctor-booking-card">

              <div className="booking-doctor-info">

                <div className="booking-avatar">

                  {doctor.profileImage ? (
                    <img
                      src={doctor.profileImage}
                      alt={
                        user.fullName ||
                        "Doctor"
                      }
                    />
                  ) : (
                    <span>
                      {(user.fullName ||
                        "D")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}

                </div>

                <div>
                  <div className="booking-doctor-name-row">

                    <h2>
                      Dr.{" "}
                      {user.fullName ||
                        "Doctor"}
                    </h2>

                    <span className="mini-verified">
                      ✓ Verified
                    </span>

                  </div>

                  <p>
                    {doctor.specialization ||
                      "Dermatologist"}
                  </p>

                  <span>
                    📍 {doctor.city ||
                      "Location not specified"}
                  </span>
                </div>

              </div>

              <div className="booking-doctor-stats">

                <div>
                  <span>Experience</span>
                  <strong>
                    {doctor.experience ||
                      0} years
                  </strong>
                </div>

                <div>
                  <span>Fee</span>
                  <strong>
                    ₹
                    {doctor.consultationFee ||
                      0}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong className="green-text">
                    Available
                  </strong>
                </div>

              </div>

            </div>

            {/* FORM */}
            <form
              className="booking-card booking-form"
              onSubmit={handleSubmit}
            >

              {/* REPORT */}
              <div className="booking-section">

                <div className="booking-section-heading">
                  <span>01</span>

                  <div>
                    <h2>
                      Attach AI Skin Assessment
                    </h2>

                    <p>
                      Share your DermaDetect
                      assessment with the doctor.
                    </p>
                  </div>
                </div>

                <div className="booking-field">

                  <label>
                    Select assessment
                  </label>

                  <select
                    name="assessmentId"
                    value={
                      form.assessmentId
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="">
                      Don't attach a report
                    </option>

                    {assessments.map(
                      (assessment) => (
                        <option
                          key={
                            assessment._id
                          }
                          value={
                            assessment._id
                          }
                        >
                          {assessment
                            .prediction
                            ?.disease ||
                            "Skin Assessment"}{" "}
                          •{" "}
                          {assessment
                            .prediction
                            ?.severity ||
                            "Unknown severity"}
                        </option>
                      )
                    )}
                  </select>

                  <small>
                    The selected assessment will
                    be linked to this appointment
                    and can be viewed by the doctor.
                  </small>

                </div>

                {assessments.length === 0 && (
                  <div className="no-report-box">
                    <span>📄</span>

                    <div>
                      <strong>
                        No AI assessment found
                      </strong>

                      <p>
                        You can book without a
                        report or create a skin
                        assessment first.
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* MODE */}
              <div className="booking-section">

                <div className="booking-section-heading">
                  <span>02</span>

                  <div>
                    <h2>
                      Consultation Mode
                    </h2>

                    <p>
                      Select how you want to
                      consult the doctor.
                    </p>
                  </div>
                </div>

                <div className="mode-selection">

                  {doctor.consultationModes?.includes(
                    "video"
                  ) && (
                    <label
                      className={`mode-option ${
                        form.mode === "video"
                          ? "selected"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="mode"
                        value="video"
                        checked={
                          form.mode ===
                          "video"
                        }
                        onChange={
                          handleChange
                        }
                      />

                      <span className="mode-option-icon">
                        🎥
                      </span>

                      <span>
                        <strong>
                          Video Consultation
                        </strong>

                        <small>
                          Online video call
                        </small>
                      </span>
                    </label>
                  )}

                  {doctor.consultationModes?.includes(
                    "text"
                  ) && (
                    <label
                      className={`mode-option ${
                        form.mode === "text"
                          ? "selected"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="mode"
                        value="text"
                        checked={
                          form.mode ===
                          "text"
                        }
                        onChange={
                          handleChange
                        }
                      />

                      <span className="mode-option-icon">
                        💬
                      </span>

                      <span>
                        <strong>
                          Text Consultation
                        </strong>

                        <small>
                          Chat with doctor
                        </small>
                      </span>
                    </label>
                  )}

                </div>

              </div>

              {/* DATE */}
              <div className="booking-section">

                <div className="booking-section-heading">
                  <span>03</span>

                  <div>
                    <h2>
                      Select Date & Time
                    </h2>

                    <p>
                      Choose from the doctor's
                      available schedule.
                    </p>
                  </div>
                </div>

                {enabledSlots.length === 0 ? (
                  <div className="no-report-box">
                    <span>🕐</span>

                    <div>
                      <strong>
                        No availability added
                      </strong>

                      <p>
                        This doctor has not added
                        consultation hours yet.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="booking-field">

                      <label>
                        Appointment date
                      </label>

                      <input
                        type="date"
                        name="date"
                        value={
                          form.date
                        }
                        min={
                          new Date()
                            .toISOString()
                            .split(
                              "T"
                            )[0]
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                      <small>
                        Available days are based
                        on the doctor's schedule.
                      </small>

                    </div>

                    {form.date && (
                      <div className="selected-day-info">

                        {selectedDayAvailability ? (
                          <>
                            <span>✓</span>

                            <div>
                              <strong>
                                {
                                  selectedDayAvailability.day
                                }
                              </strong>

                              <p>
                                Available from{" "}
                                {
                                  selectedDayAvailability.startTime
                                }{" "}
                                to{" "}
                                {
                                  selectedDayAvailability.endTime
                                }
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <span>!</span>

                            <div>
                              <strong>
                                Doctor unavailable
                              </strong>

                              <p>
                                Please choose
                                another date.
                              </p>
                            </div>
                          </>
                        )}

                      </div>
                    )}

                    {selectedDayAvailability && (
                      <div className="booking-time-grid">

                        <div className="booking-field">
                          <label>
                            Start time
                          </label>

                          <input
                            type="time"
                            name="startTime"
                            value={
                              form.startTime
                            }
                            min={
                              selectedDayAvailability.startTime
                            }
                            max={
                              selectedDayAvailability.endTime
                            }
                            onChange={
                              handleStartTimeChange
                            }
                            required
                          />
                        </div>

                        <div className="booking-field">
                          <label>
                            End time
                          </label>

                          <input
                            type="time"
                            name="endTime"
                            value={
                              form.endTime
                            }
                            min={
                              form.startTime ||
                              selectedDayAvailability.startTime
                            }
                            max={
                              selectedDayAvailability.endTime
                            }
                            onChange={
                              handleChange
                            }
                            required
                          />
                        </div>

                      </div>
                    )}
                  </>
                )}

              </div>

              {/* REASON */}
              <div className="booking-section">

                <div className="booking-section-heading">
                  <span>04</span>

                  <div>
                    <h2>
                      Consultation Details
                    </h2>

                    <p>
                      Tell the doctor what you
                      need help with.
                    </p>
                  </div>
                </div>

                <div className="booking-field">

                  <label>
                    Reason for consultation
                  </label>

                  <input
                    type="text"
                    name="reason"
                    placeholder="e.g. Acne, skin irritation, pigmentation..."
                    value={form.reason}
                    onChange={handleChange}
                    maxLength={200}
                  />

                </div>

                <div className="booking-field">

                  <label>
                    Message for doctor
                  </label>

                  <textarea
                    name="patientMessage"
                    rows="5"
                    placeholder="Describe your symptoms or anything you want the doctor to know..."
                    value={
                      form.patientMessage
                    }
                    onChange={
                      handleChange
                    }
                    maxLength={1000}
                  />

                  <small>
                    {form.patientMessage.length}
                    /1000 characters
                  </small>

                </div>

              </div>

              {/* ERROR */}
              {error && (
                <div className="booking-alert booking-alert-error">
                  <span>!</span>
                  <p>{error}</p>
                </div>
              )}

              {/* SUCCESS */}
              {success && (
                <div className="booking-alert booking-alert-success">
                  <span>✓</span>
                  <p>{success}</p>
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                className="booking-submit-btn"
                disabled={
                  booking ||
                  !doctor.isAvailable ||
                  enabledSlots.length === 0
                }
              >
                {booking ? (
                  <>
                    <span className="button-spinner"></span>
                    Sending Request...
                  </>
                ) : (
                  <>
                    Book Consultation →
                  </>
                )}
              </button>

            </form>

          </div>

          {/* RIGHT */}
          <aside className="booking-sidebar">

            {/* SUMMARY */}
            <div className="booking-card summary-card">

              <h3>
                Appointment Summary
              </h3>

              <div className="summary-doctor">

                <div className="summary-avatar">

                  {doctor.profileImage ? (
                    <img
                      src={
                        doctor.profileImage
                      }
                      alt={
                        user.fullName ||
                        "Doctor"
                      }
                    />
                  ) : (
                    <span>
                      {(user.fullName ||
                        "D")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}

                </div>

                <div>
                  <strong>
                    Dr.{" "}
                    {user.fullName ||
                      "Doctor"}
                  </strong>

                  <small>
                    {doctor.specialization}
                  </small>
                </div>

              </div>

              <div className="summary-list">

                <div>
                  <span>Mode</span>

                  <strong>
                    {form.mode === "video"
                      ? "🎥 Video"
                      : form.mode === "text"
                      ? "💬 Text"
                      : "Not selected"}
                  </strong>
                </div>

                <div>
                  <span>Date</span>

                  <strong>
                    {form.date ||
                      "Not selected"}
                  </strong>
                </div>

                <div>
                  <span>Time</span>

                  <strong>
                    {form.startTime &&
                    form.endTime
                      ? `${form.startTime} - ${form.endTime}`
                      : "Not selected"}
                  </strong>
                </div>

                <div>
                  <span>AI Report</span>

                  <strong>
                    {form.assessmentId
                      ? "Attached"
                      : "Not attached"}
                  </strong>
                </div>

                <div className="summary-total">
                  <span>
                    Consultation fee
                  </span>

                  <strong>
                    ₹
                    {doctor.consultationFee ||
                      0}
                  </strong>
                </div>

              </div>

            </div>

            {/* AVAILABILITY */}
            <div className="booking-card sidebar-availability">

              <h3>
                Doctor's Availability
              </h3>

              {enabledSlots.length > 0 ? (
                enabledSlots.map(
                  (slot, index) => (
                    <div
                      className="sidebar-slot"
                      key={index}
                    >
                      <span>
                        {slot.day}
                      </span>

                      <strong>
                        {slot.startTime} –{" "}
                        {slot.endTime}
                      </strong>
                    </div>
                  )
                )
              ) : (
                <p>
                  No availability added.
                </p>
              )}

            </div>

            {/* REPORT INFO */}
            <div className="booking-card privacy-card">

              <div className="privacy-icon">
                🔒
              </div>

              <div>
                <h3>
                  Your information
                </h3>

                <p>
                  Only the assessment you
                  select will be linked to this
                  appointment for the doctor
                  to review.
                </p>
              </div>

            </div>

          </aside>

        </div>

      </div>
    </div>
  );
}