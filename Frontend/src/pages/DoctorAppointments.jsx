import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useToast } from "../components/context/ToastContext.jsx";

import "../components/styles/doctor-appointments.css";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
  { key: "completed", label: "Completed" },
];

// Poll the backend every 10s for new appointments, without
// showing a loading spinner or disturbing whatever the doctor
// is doing (typing in search, etc).
const POLL_INTERVAL_MS = 10000;

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Tracks appointment ids we've already shown, so we can detect
  // genuinely *new* ones on each poll and toast about them.
  const knownIdsRef = useRef(new Set());

  // =====================================================
  // FETCH (initial load — shows spinner/error UI)
  // =====================================================

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/api/appointments/doctor"
      );

      const list = response.data?.appointments || [];

      knownIdsRef.current = new Set(
        list.map((appointment) => appointment._id)
      );

      setAppointments(list);
    } catch (err) {
      console.error(
        "GET DOCTOR APPOINTMENTS ERROR:",
        err
      );

      const message =
        err.response?.data?.message ||
        "Unable to load appointments";

      setError(message);

      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SILENT REFRESH (used by polling — no spinner, no error
  // banner, just quietly swaps in the latest data and lets
  // the doctor know if something new showed up)
  // =====================================================

  const refreshSilently = useCallback(async () => {
    try {
      const response = await api.get(
        "/api/appointments/doctor"
      );

      const list = response.data?.appointments || [];

      const previousIds = knownIdsRef.current;

      const newOnes = list.filter(
        (appointment) => !previousIds.has(appointment._id)
      );

      knownIdsRef.current = new Set(
        list.map((appointment) => appointment._id)
      );

      setAppointments(list);

      if (previousIds.size > 0 && newOnes.length > 0) {
        const patientName =
          newOnes[0]?.patient?.fullName || "A patient";

        showToast(
          newOnes.length === 1
            ? `New appointment request from ${patientName}`
            : `${newOnes.length} new appointment requests`,
          "info"
        );
      }
    } catch (err) {
      // Silent refresh failures are not shown to the doctor —
      // they'll see the real error next time they manually
      // retry, and we don't want a background poll to spam
      // toasts every 10 seconds if the network hiccups.
      console.error(
        "SILENT APPOINTMENTS REFRESH ERROR:",
        err
      );
    }
  }, [showToast]);

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =====================================================
  // POLLING
  // -----------------------------------------------------
  // Runs in the background every POLL_INTERVAL_MS. Paused
  // while the tab isn't visible so we don't hammer the API
  // when the doctor has switched away.
  // =====================================================

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshSilently();
      }
    }, POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Catch up immediately when the doctor comes back to
        // this tab, instead of waiting for the next tick.
        refreshSilently();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      clearInterval(interval);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [refreshSilently]);

  // =====================================================
  // ACCEPT / REJECT
  // =====================================================

  const updateStatus = async (
    appointmentId,
    status
  ) => {
    const actionPath =
      status === "accepted"
        ? "accept"
        : status === "rejected"
        ? "reject"
        : null;

    if (!actionPath) {
      console.error(
        "Unsupported status:",
        status
      );

      showToast(
        "Unsupported appointment status",
        "error"
      );

      return;
    }

    try {
      setActionLoadingId(appointmentId);

      await api.patch(
        `/api/appointments/${appointmentId}/${actionPath}`
      );

      // Refresh appointments (silent — we already know the
      // outcome, we're just syncing the list)
      await refreshSilently();

      // Success toast
      if (status === "accepted") {
        showToast(
          "Appointment accepted successfully",
          "success"
        );
      } else {
        showToast(
          "Appointment rejected successfully",
          "success"
        );
      }
    } catch (err) {
      console.error(
        `APPOINTMENT ${actionPath.toUpperCase()} ERROR:`,
        err.response?.data || err.message
      );

      showToast(
        err.response?.data?.message ||
          "Unable to update appointment",
        "error"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // =====================================================
  // NEWEST FIRST + SEARCH + CATEGORY FILTER
  // =====================================================

  const getAppointmentTimestamp = (appointment) => {
    if (appointment.createdAt) {
      const created = new Date(appointment.createdAt).getTime();
      if (!Number.isNaN(created)) {
        return created;
      }
    }

    const combined = new Date(
      `${appointment.date || ""}T${appointment.startTime || "00:00"}`
    ).getTime();

    return Number.isNaN(combined) ? 0 : combined;
  };

  const visibleAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...appointments]
      .filter((appointment) => {
        const status = String(
          appointment.status || "pending"
        ).toLowerCase();

        const matchesStatus =
          statusFilter === "all" ||
          status === statusFilter;

        if (!matchesStatus) {
          return false;
        }

        if (!query) {
          return true;
        }

        const patient = appointment.patient || {};

        const searchableText = [
          patient.fullName,
          patient.email,
          appointment.assessment?.prediction?.disease,
          appointment.reason,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      })
      .sort(
        (a, b) =>
          getAppointmentTimestamp(b) -
          getAppointmentTimestamp(a)
      );
  }, [appointments, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = {
      all: appointments.length,
      pending: 0,
      accepted: 0,
      rejected: 0,
      completed: 0,
    };

    appointments.forEach((appointment) => {
      const status = String(
        appointment.status || "pending"
      ).toLowerCase();

      if (counts[status] !== undefined) {
        counts[status] += 1;
      }
    });

    return counts;
  }, [appointments]);

  return (
    <div className="doctor-appointments-page">
      <div className="doctor-appointments-container">

        {/* ================= HEADER ================= */}

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

        {/* ================= SEARCH + FILTERS ================= */}

        {!loading && !error && appointments.length > 0 && (
          <div className="appointment-toolbar">

            <div className="appointment-search">
              🔍
              <input
                type="text"
                placeholder="Search by patient name, email, condition..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="appointment-tabs">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`appointment-tab ${
                    statusFilter === tab.key ? "active" : ""
                  }`}
                  onClick={() => setStatusFilter(tab.key)}
                >
                  {tab.label}
                  <span className="appointment-tab-count">
                    {statusCounts[tab.key] ?? 0}
                  </span>
                </button>
              ))}
            </div>

          </div>
        )}

        {/* ================= LOADING ================= */}

        {loading && (
          <div className="appointment-state">
            Loading appointments...
          </div>
        )}

        {/* ================= ERROR ================= */}

        {!loading && error && (
          <div className="appointment-state error">

            <h3>
              Unable to load appointments
            </h3>

            <p>
              {error}
            </p>

            <button
              onClick={fetchAppointments}
            >
              Try Again
            </button>

          </div>
        )}

        {/* ================= EMPTY (no appointments at all) ================= */}

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

        {/* ================= EMPTY (filters matched nothing) ================= */}

        {!loading &&
          !error &&
          appointments.length > 0 &&
          visibleAppointments.length === 0 && (
            <div className="appointment-state">

              <h3>
                No matching appointments
              </h3>

              <p>
                Try a different search term or category.
              </p>

            </div>
          )}

        {/* ================= APPOINTMENT LIST ================= */}

        {!loading &&
          !error &&
          visibleAppointments.length > 0 && (

            <div className="appointment-list">

              {visibleAppointments.map(
                (appointment) => {

                  const patient =
                    appointment.patient || {};

                  const assessment =
                    appointment.assessment;

                  const isActing =
                    actionLoadingId ===
                    appointment._id;

                  return (
                    <div
                      className="appointment-card"
                      key={appointment._id}
                    >

                      {/* ================= PATIENT ================= */}

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

                      {/* ================= APPOINTMENT INFO ================= */}

                      <div className="appointment-info">

                        <div>

                          <span>
                            Date
                          </span>

                          <strong>
                            {appointment.date}
                          </strong>

                        </div>

                        <div>

                          <span>
                            Time
                          </span>

                          <strong>
                            {appointment.startTime}{" "}
                            -{" "}
                            {appointment.endTime}
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
                            {appointment.status}
                          </strong>

                        </div>

                      </div>

                      {/* ================= REPORT ================= */}

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

                      {/* ================= ACTIONS ================= */}

                      <div className="appointment-actions">

                        {appointment.status ===
                          "pending" && (
                          <>
                            <button
                              className="accept-btn"
                              disabled={isActing}
                              onClick={() =>
                                updateStatus(
                                  appointment._id,
                                  "accepted"
                                )
                              }
                            >
                              {isActing
                                ? "Please wait..."
                                : "Accept"}
                            </button>

                            <button
                              className="reject-btn"
                              disabled={isActing}
                              onClick={() =>
                                updateStatus(
                                  appointment._id,
                                  "rejected"
                                )
                              }
                            >
                              {isActing
                                ? "Please wait..."
                                : "Reject"}
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