import { useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../api/axios";

import "../components/styles/bookAppointment.css";
// import "../components/styles/doctor-extra.css";

import { useToast } from "../components/context/ToastContext";

const pad = (n) =>
  String(n).padStart(2, "0");

const todayString = () => {
  const d = new Date();

  return `${d.getFullYear()}-${pad(
    d.getMonth() + 1
  )}-${pad(d.getDate())}`;
};

const formatDay = (dateString) =>
  new Date(
    `${dateString}T00:00:00`
  ).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

export default function BookAppointment({
  doctorId: doctorIdProp,
  assessmentId: assessmentIdProp,
  onBack,
  onBooked,
}) {
  const { doctorId: doctorIdParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { showToast } = useToast();

  const doctorId = doctorIdProp || doctorIdParam;

  const passedAssessmentId =
    assessmentIdProp ||
    location.state?.assessmentId ||
    "";

  const [doctor, setDoctor] =
    useState(null);

  const [assessments, setAssessments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [booking, setBooking] =
    useState(false);

  const [form, setForm] = useState({
    assessmentId: passedAssessmentId,
    mode: "",
    date: "",
    startTime: "",
    endTime: "",
    reason: "",
    patientMessage: "",
  });

  // =====================================================
  // LOAD DOCTOR + ASSESSMENTS
  // =====================================================

  useEffect(() => {
    if (!doctorId) {
      showToast(
        "Doctor ID is missing.",
        "error"
      );

      setLoading(false);
      return;
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        doctorResponse,
        assessmentResponse,
      ] = await Promise.all([
        api.get(
          `/api/doctors/${doctorId}`
        ),
        api.get(
          "/api/assessment/history"
        ),
      ]);

      const doctorData =
        doctorResponse.data?.doctor ||
        doctorResponse.data?.doctorProfile ||
        null;

      const assessmentData =
        assessmentResponse.data?.history ||
        assessmentResponse.data?.assessments ||
        [];

      const analyzed =
        Array.isArray(assessmentData)
          ? assessmentData.filter(
              (a) => a.status === "analyzed"
            )
          : [];

      setDoctor(doctorData);
      setAssessments(analyzed);

      // Latest assessment automatically selected
      if (
        !passedAssessmentId &&
        analyzed.length > 0
      ) {
        const latest = [...analyzed].sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        )[0];

        setForm((prev) => ({
          ...prev,
          assessmentId: latest._id,
        }));
      }
    } catch (err) {
      console.error(
        "BOOK PAGE ERROR:",
        err.response?.data ||
          err.message
      );

      showToast(
        err.response?.data?.message ||
          "Unable to load booking information.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FUTURE AVAILABILITY
  // =====================================================

  const futureSlots = useMemo(() => {
    const today = todayString();

    const now = new Date();

    const nowTime = `${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}`;

    return (
      doctor?.availabilitySlots || []
    ).filter((slot) => {
      if (slot.date < today)
        return false;

      if (
        slot.date === today &&
        slot.endTime <= nowTime
      ) {
        return false;
      }

      return true;
    });
  }, [doctor]);

  // =====================================================
  // AVAILABLE DATES
  // =====================================================

  const availableDates = useMemo(() => {
    const map = {};

    futureSlots.forEach((slot) => {
      if (!map[slot.date]) {
        map[slot.date] = [];
      }

      map[slot.date].push(slot);
    });

    return Object.keys(map)
      .sort()
      .map((date) => ({
        date,
        slots: map[date].sort(
          (a, b) =>
            a.startTime.localeCompare(
              b.startTime
            )
        ),
      }));
  }, [futureSlots]);

  // =====================================================
  // SELECTED DAY
  // =====================================================

  const selectedDay = useMemo(
    () =>
      availableDates.find(
        (d) =>
          d.date === form.date
      ) || null,
    [
      availableDates,
      form.date,
    ]
  );

  // =====================================================
  // ACTIVE TIME RANGE
  // =====================================================

  const activeRange = useMemo(() => {
    if (!selectedDay || !form.startTime) {
      return null;
    }

    return (
      selectedDay.slots.find(
        (slot) =>
          form.startTime >= slot.startTime &&
          form.startTime < slot.endTime
      ) || null
    );
  }, [selectedDay, form.startTime]);

  // =====================================================
  // FORM HANDLERS
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const selectDate = (date) => {
    setForm((prev) => ({
      ...prev,
      date,
      startTime: "",
      endTime: "",
    }));
  };

  const selectRange = (slot) => {
    setForm((prev) => ({
      ...prev,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));
  };

  const isInsideSlot = () =>
    selectedDay?.slots.some(
      (slot) =>
        form.startTime >=
          slot.startTime &&
        form.endTime <=
          slot.endTime
    );

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    navigate(`/doctors/${doctorId}`);
  };

  // =====================================================
  // BOOK APPOINTMENT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // -------------------------
    // VALIDATION
    // -------------------------

    if (!doctor) {
      showToast(
        "Doctor information is unavailable.",
        "error"
      );
      return;
    }

    if (!doctor.isAvailable) {
      showToast(
        "This doctor is currently unavailable.",
        "warning"
      );
      return;
    }

    if (!form.mode) {
      showToast(
        "Please select consultation mode.",
        "warning"
      );
      return;
    }

    if (
      !form.date ||
      !selectedDay
    ) {
      showToast(
        "Please select an available date.",
        "warning"
      );
      return;
    }

    if (
      !form.startTime ||
      !form.endTime
    ) {
      showToast(
        "Please select start and end time.",
        "warning"
      );
      return;
    }

    if (
      form.startTime >=
      form.endTime
    ) {
      showToast(
        "End time must be after start time.",
        "warning"
      );
      return;
    }

    if (!isInsideSlot()) {
      const ranges =
        selectedDay.slots
          .map(
            (s) =>
              `${s.startTime}-${s.endTime}`
          )
          .join(", ");

      showToast(
        `Please select a time inside the doctor's hours: ${ranges}`,
        "warning"
      );

      return;
    }

    // -------------------------
    // API
    // -------------------------

    try {
      setBooking(true);

      const response =
        await api.post(
          "/api/appointments",
          {
            doctorProfileId:
              doctorId,

            assessmentId:
              form.assessmentId ||
              undefined,

            mode: form.mode,

            date: form.date,

            startTime:
              form.startTime,

            endTime:
              form.endTime,

            reason:
              form.reason.trim(),

            patientMessage:
              form.patientMessage.trim(),
          }
        );

      const appointment =
        response.data?.appointment;

      showToast(
        response.data?.message ||
          "Appointment request sent successfully.",
        "success"
      );

      setTimeout(() => {
        if (onBooked) {
          onBooked({ appointment, doctor });
          return;
        }

        navigate(
          "/appointment-confirmation",
          {
            state: {
              appointment,
              doctor,
            },
          }
        );
      }, 700);
    } catch (err) {
      console.error(
        "BOOK APPOINTMENT ERROR:",
        err.response?.data ||
          err.message
      );

      showToast(
        err.response?.data?.message ||
          "Unable to book appointment.",
        "error"
      );
    } finally {
      setBooking(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="booking-page">
        <div className="booking-state">
          <div className="booking-loader"></div>

          <p>
            Loading appointment details...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // DOCTOR NOT FOUND
  // =====================================================

  if (!doctor) {
    return (
      <div className="booking-page">
        <div className="booking-state">

          <h3>
            Doctor not found
          </h3>

          <p>
            The requested doctor profile
            could not be found.
          </p>

          <button
            onClick={handleBack}
          >
            ← Back
          </button>

        </div>
      </div>
    );
  }

  // =====================================================
  // DOCTOR DATA
  // =====================================================

  const user =
    doctor.user || {};

  const Avatar = () =>
    doctor.profileImage ? (
      <img
        src={doctor.profileImage}
        alt={
          user.fullName ||
          "Doctor"
        }
      />
    ) : (
      <span>
        {(
          user.fullName ||
          "D"
        )
          .charAt(0)
          .toUpperCase()}
      </span>
    );

  const modeOptions = [
    {
      value: "video",
      icon: "🎥",
      title:
        "Video Consultation",
      sub: "Online video call",
    },
    {
      value: "text",
      icon: "💬",
      title:
        "Text Consultation",
      sub: "Chat with doctor",
    },
    {
      value: "in-person",
      icon: "🏥",
      title:
        "In-person Consultation",
      sub: "Visit clinic",
    },
  ].filter((m) =>
    doctor.consultationModes?.includes(
      m.value
    )
  );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="booking-page">

      <div className="booking-container">

        {/* BACK */}

        <button
          className="booking-back-btn"
          onClick={handleBack}
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
              Choose a suitable time and
              share your skin assessment
              with the doctor.
            </p>
          </div>

        </div>

        <div className="booking-layout">

          {/* =================================================
              MAIN
          ================================================= */}

          <div className="booking-main">

            {/* DOCTOR CARD */}

            <div className="booking-card doctor-booking-card">

              <div className="booking-doctor-info">

                <div className="booking-avatar">
                  <Avatar />
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
                    📍{" "}
                    {doctor.city ||
                      "Location not specified"}
                  </span>

                </div>

              </div>

              <div className="booking-doctor-stats">

                <div>
                  <span>
                    Experience
                  </span>

                  <strong>
                    {doctor.experience ||
                      0}{" "}
                    years
                  </strong>
                </div>

                <div>
                  <span>
                    Fee
                  </span>

                  <strong>
                    ₹
                    {doctor.consultationFee ||
                      0}
                  </strong>
                </div>

                <div>
                  <span>
                    Status
                  </span>

                  <strong
                    className={
                      doctor.isAvailable
                        ? "green-text"
                        : ""
                    }
                  >
                    {doctor.isAvailable
                      ? "Available"
                      : "Unavailable"}
                  </strong>
                </div>

              </div>

            </div>

            {/* FORM */}

            <form
              className="booking-card booking-form"
              onSubmit={
                handleSubmit
              }
            >

              {/* 01 */}

              <div className="booking-section">

                <div className="booking-section-heading">

                  <span>
                    01
                  </span>

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
                            "Unknown severity"}{" "}
                          •{" "}
                          {assessment.createdAt
                            ? new Date(
                                assessment.createdAt
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : ""}
                        </option>
                      )
                    )}

                  </select>

                  <small>
                    The selected assessment,
                    along with your profile
                    details, will be visible
                    to the doctor.
                  </small>

                </div>

                {assessments.length ===
                  0 && (
                  <div className="no-report-box">

                    <span>
                      📄
                    </span>

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

              {/* 02 */}

              <div className="booking-section">

                <div className="booking-section-heading">

                  <span>
                    02
                  </span>

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

                  {modeOptions.map(
                    (m) => (
                      <label
                        key={m.value}
                        className={`mode-option ${
                          form.mode ===
                          m.value
                            ? "selected"
                            : ""
                        }`}
                      >

                        <input
                          type="radio"
                          name="mode"
                          value={m.value}
                          checked={
                            form.mode ===
                            m.value
                          }
                          onChange={
                            handleChange
                          }
                        />

                        <span className="mode-option-icon">
                          {m.icon}
                        </span>

                        <span>
                          <strong>
                            {m.title}
                          </strong>

                          <small>
                            {m.sub}
                          </small>
                        </span>

                      </label>
                    )
                  )}

                </div>

                {modeOptions.length ===
                  0 && (
                  <div className="no-report-box">
                    <span>
                      ⚠️
                    </span>

                    <div>
                      <strong>
                        No consultation mode
                        available
                      </strong>

                      <p>
                        This doctor has not
                        enabled any consultation
                        mode yet.
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* 03 */}

              <div className="booking-section">

                <div className="booking-section-heading">

                  <span>
                    03
                  </span>

                  <div>
                    <h2>
                      Select Date & Time
                    </h2>

                    <p>
                      Only dates and hours
                      added by the doctor
                      are shown.
                    </p>
                  </div>

                </div>

                {availableDates.length ===
                0 ? (
                  <div className="no-report-box">

                    <span>
                      🕐
                    </span>

                    <div>
                      <strong>
                        No upcoming
                        availability
                      </strong>

                      <p>
                        This doctor has not
                        added consultation
                        hours yet.
                      </p>
                    </div>

                  </div>
                ) : (
                  <>
                    <div className="booking-field">

                      <label>
                        Available dates
                      </label>

                      <div className="date-chip-row">

                        {availableDates.map(
                          (d) => (
                            <button
                              type="button"
                              key={
                                d.date
                              }
                              className={`date-chip ${
                                form.date ===
                                d.date
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() =>
                                selectDate(
                                  d.date
                                )
                              }
                            >
                              {formatDay(
                                d.date
                              )}
                            </button>
                          )
                        )}

                      </div>

                    </div>

                    {selectedDay && (
                      <>

                        <div className="booking-field">

                          <label>
                            Doctor's time
                            frames on this day
                          </label>

                          <div className="date-chip-row">

                            {selectedDay.slots.map(
                              (
                                slot,
                                i
                              ) => (
                                <button
                                  type="button"
                                  key={i}
                                  className={`date-chip ${
                                    form.startTime ===
                                      slot.startTime &&
                                    form.endTime ===
                                      slot.endTime
                                      ? "active"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    selectRange(
                                      slot
                                    )
                                  }
                                >
                                  {
                                    slot.startTime
                                  }{" "}
                                  –{" "}
                                  {
                                    slot.endTime
                                  }
                                </button>
                              )
                            )}

                          </div>

                          <small>
                            Pick a time frame,
                            then narrow down
                            your exact start and
                            end time if you want
                            a shorter slot.
                          </small>

                        </div>

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
                              onChange={
                                handleChange
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
                                undefined
                              }
                              max={
                                activeRange?.endTime
                              }
                              onChange={
                                handleChange
                              }
                              required
                            />

                          </div>

                        </div>

                      </>
                    )}
                  </>
                )}

              </div>

              {/* 04 */}

              <div className="booking-section">

                <div className="booking-section-heading">

                  <span>
                    04
                  </span>

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
                    value={
                      form.reason
                    }
                    onChange={
                      handleChange
                    }
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
                    {
                      form.patientMessage
                        .length
                    }
                    /1000 characters
                  </small>

                </div>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                className="booking-submit-btn"
                disabled={
                  booking ||
                  !doctor.isAvailable ||
                  availableDates.length ===
                    0
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

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="booking-sidebar">

            {/* SUMMARY */}

            <div className="booking-card summary-card">

              <h3>
                Appointment Summary
              </h3>

              <div className="summary-doctor">

                <div className="summary-avatar">
                  <Avatar />
                </div>

                <div>

                  <strong>
                    Dr.{" "}
                    {user.fullName ||
                      "Doctor"}
                  </strong>

                  <small>
                    {doctor.specialization ||
                      "Dermatologist"}
                  </small>

                </div>

              </div>

              <div className="summary-list">

                <div>
                  <span>
                    Mode
                  </span>

                  <strong>
                    {form.mode ===
                    "video"
                      ? "🎥 Video"
                      : form.mode ===
                        "text"
                      ? "💬 Text"
                      : form.mode ===
                        "in-person"
                      ? "🏥 In-person"
                      : "Not selected"}
                  </strong>
                </div>

                <div>
                  <span>
                    Date
                  </span>

                  <strong>
                    {form.date ||
                      "Not selected"}
                  </strong>
                </div>

                <div>
                  <span>
                    Time
                  </span>

                  <strong>
                    {form.startTime &&
                    form.endTime
                      ? `${form.startTime} - ${form.endTime}`
                      : "Not selected"}
                  </strong>
                </div>

                <div>
                  <span>
                    AI Report
                  </span>

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
                Doctor's Upcoming
                Availability
              </h3>

              {availableDates.length >
              0 ? (
                availableDates
                  .slice(0, 10)
                  .map((d) => (
                    <div
                      className="sidebar-slot"
                      key={d.date}
                    >
                      <span>
                        {formatDay(
                          d.date
                        )}
                      </span>

                      <strong>
                        {d.slots
                          .map(
                            (s) =>
                              `${s.startTime}–${s.endTime}`
                          )
                          .join(
                            ", "
                          )}
                      </strong>
                    </div>
                  ))
              ) : (
                <p>
                  No availability added.
                </p>
              )}

            </div>

            {/* PRIVACY */}

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
                  select is shared with the
                  doctor, along with your basic
                  profile details (name, age,
                  gender).
                </p>

              </div>

            </div>

          </aside>

        </div>

      </div>

    </div>
  );
}