import React, { useEffect, useState } from "react";
import "../components/styles/dashboard.css";
import { useAuth } from "../components/context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

import api from "../api/axios";

import Choose from "../pages/Choose";

/* ============================================================
   TITLE MAP
============================================================ */

const TITLE_MAP = {
  dashboard: "Dashboard",
  scan: "New Skin Scan",
  result: "Scan Result",
  diseaseInfo: "Disease Information",
  history: "Scan History",
  reports: "Reports",
  consult: "Consult a Dermatologist",
  appointments: "My Appointments",
  notifications: "Notifications",
  profile: "Profile",
  settings: "Settings",
};

/* ============================================================
   DISEASE INFORMATION
============================================================ */

const diseaseInfoSections = [
  {
    key: "what",
    label: "What is this disease?",
    text: "Psoriasis is a chronic skin condition where skin cells build up faster than normal, forming scaly, itchy patches.",
  },
  {
    key: "symptoms",
    label: "Symptoms",
    text: "Red patches with silvery scales, dry cracked skin that may bleed, itching or burning, thickened nails.",
  },
  {
    key: "causes",
    label: "Causes",
    text: "Believed to be linked to an overactive immune system; triggers include stress, infections, and skin injury.",
  },
  {
    key: "prevention",
    label: "Prevention",
    text: "Manage stress, avoid known triggers, keep skin moisturized, avoid smoking and excess alcohol.",
  },
  {
    key: "homecare",
    label: "Home Care Tips",
    text: "Use fragrance-free moisturizers daily, take lukewarm showers, and avoid scratching.",
  },
  {
    key: "treatment",
    label: "Treatment Options",
    text: "Treatment may include topical creams, light therapy, or medicines prescribed by a dermatologist.",
  },
  {
    key: "whentosee",
    label: "When to see a doctor",
    text: "If patches spread quickly, become painful, show signs of infection, or affect daily life, consult a dermatologist.",
  },
];

/* ============================================================
   EMPTY RESULT
============================================================ */

const emptyResult = {
  disease: "No scans yet",
  confidence: 0,
  severity: "Low",
  description: "Run your first scan to see a personalized result here.",
  contagious: "Not available",
  recommendation: "Run your first scan to get a recommendation.",
  date: "—",
};

/* ============================================================
   CONSULTATION CONSTANTS
============================================================ */

const MODE_LABELS = {
  video: "Video call",
  text: "Text chat",
  chat: "Text chat",
  "in-person": "In-person",
};

const MODE_ICONS = {
  video: "🎥",
  text: "💬",
  chat: "💬",
  "in-person": "🏥",
};

/* ============================================================
   HELPERS
============================================================ */

function severityBadgeClass(severity) {
  if (severity === "Low") return "badge badge-success";
  if (severity === "High") return "badge badge-danger";
  return "badge badge-warn";
}

function statusBadge(status) {
  if (status === "Healthy") {
    return <span className="badge badge-success">Healthy</span>;
  }

  return (
    <span className="badge badge-warn">
      Disease Detected
    </span>
  );
}

function formatDate(rawDate) {
  if (!rawDate) return "Not available";

  const d = new Date(rawDate);

  if (Number.isNaN(d.getTime())) {
    return "Not available";
  }

  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeConfidence(rawConfidence) {
  const n = Number(rawConfidence ?? 0);

  const safe = Number.isFinite(n) ? n : 0;

  const pct = safe > 1 ? safe : safe * 100;

  return Math.min(100, Math.max(0, pct));
}

/* ============================================================
   MAP ASSESSMENT
============================================================ */

function mapAssessmentToResult(assessment) {
  if (!assessment) return null;

  const prediction = assessment.prediction || {};

  const disease =
    prediction.disease || "Not available";

  return {
    id: assessment._id,

    disease,

    confidence: normalizeConfidence(
      prediction.confidence
    ),

    severity:
      prediction.severity || "Low",

    description:
      assessment.explanation ||
      prediction.description ||
      "No description available for this result.",

    contagious:
      prediction.contagious ||
      "Not available",

    recommendation:
      assessment.recommendation ||
      prediction.recommendation ||
      "Consult a dermatologist for a full evaluation.",

    date: formatDate(
      assessment.updatedAt ||
        assessment.createdAt
    ),

    image:
      assessment.image || null,

    status:
      disease.toLowerCase() === "healthy"
        ? "Healthy"
        : "Disease Detected",
  };
}

/* ============================================================
   APPOINTMENT HELPERS
============================================================ */

function getAppointmentStatus(appointment) {
  return (
    appointment.status ||
    appointment.appointmentStatus ||
    "pending"
  );
}

function getDoctorFromAppointment(appointment) {
  return (
    appointment.doctor ||
    appointment.doctorProfile?.user ||
    appointment.doctorProfile ||
    {}
  );
}

function getAppointmentDoctorName(appointment) {
  const doctor =
    getDoctorFromAppointment(appointment);

  return (
    doctor.fullName ||
    doctor.name ||
    appointment.doctorName ||
    "Doctor"
  );
}

function getAppointmentSpecialization(appointment) {
  const doctor =
    getDoctorFromAppointment(appointment);

  return (
    doctor.specialization ||
    appointment.specialization ||
    "Dermatologist"
  );
}

function getAppointmentDate(appointment) {
  return (
    appointment.date ||
    appointment.appointmentDate ||
    appointment.startDate ||
    null
  );
}

function getAppointmentStartTime(appointment) {
  return (
    appointment.startTime ||
    appointment.time ||
    appointment.slot?.startTime ||
    ""
  );
}

function getAppointmentEndTime(appointment) {
  return (
    appointment.endTime ||
    appointment.slot?.endTime ||
    ""
  );
}

function getAppointmentMode(appointment) {
  return (
    appointment.mode ||
    appointment.type ||
    "video"
  );
}

function formatAppointmentDate(date) {
  if (!date) return "Date not available";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return date;
  }

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function appointmentStatusClass(status) {
  const normalized =
    String(status).toLowerCase();

  if (
    normalized === "confirmed" ||
    normalized === "accepted" ||
    normalized === "approved"
  ) {
    return "badge badge-success";
  }

  if (
    normalized === "cancelled" ||
    normalized === "canceled" ||
    normalized === "rejected"
  ) {
    return "badge badge-danger";
  }

  if (
    normalized === "completed"
  ) {
    return "badge badge-success";
  }

  return "badge badge-warn";
}

function appointmentStatusLabel(status) {
  const normalized =
    String(status).toLowerCase();

  const labels = {
    pending: "Pending",
    confirmed: "Confirmed",
    accepted: "Accepted",
    approved: "Approved",
    cancelled: "Cancelled",
    canceled: "Cancelled",
    rejected: "Rejected",
    completed: "Completed",
  };

  return labels[normalized] || status;
}

/* ============================================================
   MAIN DASHBOARD
============================================================ */

export default function DermaDetectAI() {
  const routerLocation = useLocation();
  const navigate = useNavigate();

  const {
    logout,
  } = useAuth();

  const [activeView, setActiveView] =
    useState("dashboard");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  /* ----------------------------------------------------------
     CONSULT ASSESSMENT
  ---------------------------------------------------------- */

  const [
    consultAssessmentId,
    setConsultAssessmentId,
  ] = useState(null);

  /* ----------------------------------------------------------
     ROUTER STATE
  ---------------------------------------------------------- */

  useEffect(() => {
    const requestedView =
      routerLocation.state?.view;

    if (requestedView) {
      if (
        routerLocation.state?.assessmentId
      ) {
        setConsultAssessmentId(
          routerLocation.state.assessmentId
        );
      }

      goTo(requestedView);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routerLocation.state]);

  /* ----------------------------------------------------------
     DARK MODE
  ---------------------------------------------------------- */

  const [darkMode, setDarkMode] =
    useState(() => {
      if (
        typeof window === "undefined"
      ) {
        return false;
      }

      return (
        window.matchMedia &&
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches
      );
    });

  useEffect(() => {
    try {
      localStorage.setItem(
        "dermadetect-theme",
        darkMode ? "dark" : "light"
      );
    } catch (error) {
      console.error(error);
    }
  }, [darkMode]);

  /* ----------------------------------------------------------
     SETTINGS
  ---------------------------------------------------------- */

  const [notifScan, setNotifScan] =
    useState(true);

  const [notifFollowup, setNotifFollowup] =
    useState(true);

  const [language, setLanguage] =
    useState("English");

  /* ----------------------------------------------------------
     USER
  ---------------------------------------------------------- */

  const [user, setUser] =
    useState(null);

  /* ----------------------------------------------------------
     DASHBOARD STATS
  ---------------------------------------------------------- */

  const [stats, setStats] =
    useState({
      totalScans: 0,
      lastScanDate: "Not available",
      currentStatus: "Not available",
      reportsAvailable: 0,
    });

  /* ----------------------------------------------------------
     HISTORY
  ---------------------------------------------------------- */

  const [history, setHistory] =
    useState([]);

  /* ----------------------------------------------------------
     REPORTS
  ---------------------------------------------------------- */

  const [reports, setReports] =
    useState([]);

  /* ----------------------------------------------------------
     NOTIFICATIONS
  ---------------------------------------------------------- */

  const [notifications, setNotifications] =
    useState([]);

  /* ----------------------------------------------------------
     APPOINTMENTS
  ---------------------------------------------------------- */

  const [
    appointments,
    setAppointments,
  ] = useState([]);

  const [
    appointmentsLoading,
    setAppointmentsLoading,
  ] = useState(false);

  const [
    appointmentsError,
    setAppointmentsError,
  ] = useState("");

  /* ----------------------------------------------------------
     DASHBOARD LOADING
  ---------------------------------------------------------- */

  const [
    dashboardLoading,
    setDashboardLoading,
  ] = useState(true);

  const [
    dashboardError,
    setDashboardError,
  ] = useState("");

  /* ----------------------------------------------------------
     PROFILE
  ---------------------------------------------------------- */

  const [
    profile,
    setProfile,
  ] = useState({
    name: "",
    age: "",
    gender: "",
    email: "",
    phone: "",
  });

  const [
    savedProfile,
    setSavedProfile,
  ] = useState(profile);

  /* ----------------------------------------------------------
     HISTORY FILTER
  ---------------------------------------------------------- */

  const [
    historySearch,
    setHistorySearch,
  ] = useState("");

  const [
    historyFilter,
    setHistoryFilter,
  ] = useState("all");

  /* ----------------------------------------------------------
     DISEASE INFO
  ---------------------------------------------------------- */

  const [
    openSection,
    setOpenSection,
  ] = useState("what");

  /* ----------------------------------------------------------
     RESULT
  ---------------------------------------------------------- */

  const [
    selectedResult,
    setSelectedResult,
  ] = useState(null);

  /* ============================================================
     NAVIGATION
  ============================================================ */

  function goTo(view) {
    setActiveView(view);
    setSidebarOpen(false);

    /*
      Whenever appointments is opened,
      refresh appointment data.
    */

    if (view === "appointments") {
      loadAppointments();
    }
  }

  /* ============================================================
     LOAD APPOINTMENTS
  ============================================================ */

  async function loadAppointments() {
    try {
      setAppointmentsLoading(true);
      setAppointmentsError("");

      /*
       IMPORTANT:

       Your BookAppointment already uses:

       POST /api/appointments

       So here we use:

       GET /api/appointments

       Backend should return:

       {
         appointments: [...]
       }

       OR directly an array.
      */

      const response =
        await api.get(
          "/api/appointments"
        );

      const data =
        response.data;

      const fetchedAppointments =
        Array.isArray(data)
          ? data
          : data?.appointments ||
            data?.data ||
            [];

      setAppointments(
        fetchedAppointments
      );

    } catch (err) {
      console.error(
        "APPOINTMENTS FETCH ERROR:",
        err.response?.data ||
          err.message
      );

      setAppointmentsError(
        err.response?.data?.message ||
          "Unable to load your appointments."
      );
    } finally {
      setAppointmentsLoading(false);
    }
  }

  /* ============================================================
     CANCEL APPOINTMENT
  ============================================================ */

  async function handleCancelAppointment(
    appointment
  ) {
    const appointmentId =
      appointment._id ||
      appointment.id;

    if (!appointmentId) {
      alert(
        "Appointment ID not found."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this appointment?"
      );

    if (!confirmed) {
      return;
    }

    try {
      /*
        Expected backend:

        PATCH /api/appointments/:id/cancel
      */

      await api.patch(
        `/api/appointments/${appointmentId}/cancel`
      );

      alert(
        "Appointment cancelled successfully."
      );

      await loadAppointments();

    } catch (err) {
      console.error(
        "CANCEL APPOINTMENT ERROR:",
        err.response?.data ||
          err.message
      );

      alert(
        err.response?.data?.message ||
          "Unable to cancel appointment."
      );
    }
  }

  /* ============================================================
     INITIAL DASHBOARD DATA
  ============================================================ */

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setDashboardLoading(true);
        setDashboardError("");

        const [
          userRes,
          historyRes,
          reportsRes,
          notificationsRes,
        ] = await Promise.all([
          api.get(
            "/api/user/profile"
          ),

          api.get(
            "/api/assessment/history"
          ),

          api.get(
            "/api/reports"
          ),

          api.get(
            "/api/notifications"
          ),
        ]);

        /* USER */

        const fetchedUser =
          userRes.data?.user ||
          null;

        setUser(
          fetchedUser
        );

        if (fetchedUser) {
          const initialProfile = {
            name:
              fetchedUser.fullName ||
              "",

            age:
              fetchedUser.age ??
              "",

            gender:
              fetchedUser.gender ||
              "",

            email:
              fetchedUser.email ||
              "",

            phone:
              fetchedUser.phone ||
              "",
          };

          setProfile(
            initialProfile
          );

          setSavedProfile(
            initialProfile
          );
        }

        /* HISTORY */

        const rawHistory =
          historyRes.data?.history ||
          [];

        const sortedRaw =
          [...rawHistory].sort(
            (a, b) => {
              const aDate =
                new Date(
                  a.updatedAt ||
                    a.createdAt ||
                    0
                ).getTime();

              const bDate =
                new Date(
                  b.updatedAt ||
                    b.createdAt ||
                    0
                ).getTime();

              return (
                bDate - aDate
              );
            }
          );

        const mappedHistory =
          sortedRaw.map(
            mapAssessmentToResult
          );

        setHistory(
          mappedHistory
        );

        /* REPORTS */

        const fetchedReports =
          reportsRes.data?.reports ||
          [];

        setReports(
          fetchedReports
        );

        /* NOTIFICATIONS */

        const fetchedNotifications =
          notificationsRes.data
            ?.notifications ||
          [];

        setNotifications(
          fetchedNotifications
        );

        /* STATS */

        setStats({
          totalScans:
            mappedHistory.length,

          lastScanDate:
            mappedHistory[0]?.date ||
            "Not available",

          currentStatus:
            mappedHistory[0]?.status ||
            "Not available",

          reportsAvailable:
            fetchedReports.length,
        });

        /*
          Load appointments separately.

          If appointment endpoint doesn't exist yet,
          dashboard should still work.
        */

        try {
          await loadAppointments();
        } catch (appointmentError) {
          console.error(
            appointmentError
          );
        }

      } catch (err) {
        console.error(
          "Dashboard data fetch failed:",
          err.response?.data ||
            err.message
        );

        setDashboardError(
          err.response?.data?.message ||
            "Unable to load your dashboard data"
        );
      } finally {
        setDashboardLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  /* ============================================================
     RESULT DATA
  ============================================================ */

  const recentResult =
    history[0] ||
    null;

  const displayedResult =
    selectedResult ||
    recentResult ||
    emptyResult;

  /* ============================================================
     LOGOUT
  ============================================================ */

  const handleLogout =
    async () => {
      try {
        const response =
          await logout();

        console.log(
          "Logout response:",
          response
        );

        navigate("/login");

      } catch (err) {
        console.error(
          "Logout Error:",
          err
        );

        alert(
          "Logout failed"
        );
      }
    };

  /* ============================================================
     SAVE PROFILE
  ============================================================ */

  async function handleSaveProfile() {
    try {
      await api.put(
        "/api/user/profile",
        profile
      );

      setSavedProfile(
        profile
      );

      alert(
        "Profile updated successfully."
      );

    } catch (err) {
      console.error(
        "Profile save failed:",
        err.response?.data ||
          err.message
      );

      alert(
        err.response?.data?.message ||
          "Could not save profile changes."
      );
    }
  }

  /* ============================================================
     PASSWORD
  ============================================================ */

  function handleChangePassword() {
    alert(
      "Change password flow will be connected here."
    );
  }

  /* ============================================================
     REPORT ACTION
  ============================================================ */

  function handleReportAction(
    action,
    item
  ) {
    if (
      action ===
      "download-pdf"
    ) {
      alert(
        "PDF download endpoint will be connected here."
      );
    }

    if (
      action ===
      "print-report"
    ) {
      window.print();
    }

    if (
      action ===
      "share-report"
    ) {
      alert(
        "Share report feature will be connected here."
      );
    }
  }

  /* ============================================================
     VIEW HISTORY ITEM
  ============================================================ */

  function viewHistoryItem(
    item
  ) {
    setSelectedResult(
      item
    );

    goTo("result");
  }

  /* ============================================================
     FILTER HISTORY
  ============================================================ */

  const filteredHistory =
    history.filter(
      (h) => {
        const matchesSearch =
          (h.disease || "")
            .toLowerCase()
            .includes(
              historySearch
                .toLowerCase()
            );

        const matchesFilter =
          historyFilter ===
            "all" ||
          h.status ===
            historyFilter;

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );

  /* ============================================================
     USER INFO
  ============================================================ */

  const userFirstName =
    (
      user?.fullName ||
      "there"
    ).split(" ")[0];

  const avatarInitial =
    (
      user?.fullName ||
      "U"
    )
      .charAt(0)
      .toUpperCase();

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div
      className="dtc-app"
      data-theme={
        darkMode
          ? "dark"
          : "light"
      }
    >

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`sidebar ${
          sidebarOpen
            ? "open"
            : ""
        }`}
      >

        <div className="sidebar-brand">
          <span className="logo-dot"></span>
          Derma Detect AI
        </div>

        <ul className="nav-list">

          <li
            className={`nav-item ${
              activeView ===
              "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goTo("dashboard")
            }
          >
            <span className="nav-icon">
              🏠
            </span>
            Dashboard
          </li>

          <li
            className={`nav-item ${
              activeView === "scan"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goTo("scan")
            }
          >
            <span className="nav-icon">
              📷
            </span>
            New Scan
          </li>

          <li
            className={`nav-item ${
              activeView ===
              "history"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goTo("history")
            }
          >
            <span className="nav-icon">
              📊
            </span>
            Scan History
          </li>

          <li
            className={`nav-item ${
              activeView ===
              "reports"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goTo("reports")
            }
          >
            <span className="nav-icon">
              📄
            </span>
            Reports
          </li>

          {/* ===============================================
              NEW PATIENT APPOINTMENTS OPTION
          =============================================== */}

          <li
            className={`nav-item ${
              activeView ===
              "appointments"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goTo(
                "appointments"
              )
            }
          >
            <span className="nav-icon">
              📅
            </span>

            <span>
              My Appointments
            </span>

            {appointments.filter(
              (a) =>
                String(
                  getAppointmentStatus(
                    a
                  )
                ).toLowerCase() ===
                "pending"
            ).length >
              0 && (
              <span
                style={{
                  marginLeft:
                    "auto",
                  fontSize:
                    "11px",
                  background:
                    "var(--color-primary)",
                  color:
                    "#fff",
                  minWidth:
                    "20px",
                  height:
                    "20px",
                  borderRadius:
                    "50%",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                }}
              >
                {
                  appointments.filter(
                    (a) =>
                      String(
                        getAppointmentStatus(
                          a
                        )
                      ).toLowerCase() ===
                      "pending"
                  ).length
                }
              </span>
            )}
          </li>

          <li
            className={`nav-item ${
              activeView ===
              "consult"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goTo("consult")
            }
          >
            <span className="nav-icon">
              🩺
            </span>
            Consult Doctor
          </li>

          <li
            className={`nav-item ${
              activeView ===
              "notifications"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goTo(
                "notifications"
              )
            }
          >
            <span className="nav-icon">
              🔔
            </span>
            Notifications
          </li>

          <li
            className={`nav-item ${
              activeView ===
              "profile"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goTo("profile")
            }
          >
            <span className="nav-icon">
              👤
            </span>
            Profile
          </li>

          <li
            className={`nav-item ${
              activeView ===
              "settings"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goTo("settings")
            }
          >
            <span className="nav-icon">
              ⚙️
            </span>
            Settings
          </li>

        </ul>

        <div className="sidebar-footer">

          <div
            className="logout-btn"
            onClick={
              handleLogout
            }
          >
            🚪 Logout
          </div>

        </div>

      </aside>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <div className="main">

        {/* TOPBAR */}

        <div className="topbar">

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: 12,
            }}
          >

            <button
              className="menu-btn"
              onClick={() =>
                setSidebarOpen(
                  (s) => !s
                )
              }
            >
              ☰
            </button>

            <div className="topbar-title">
              {
                TITLE_MAP[
                  activeView
                ]
              }
            </div>

          </div>

          <div className="topbar-right">

            <div
              className="bell"
              onClick={() =>
                goTo(
                  "notifications"
                )
              }
            >
              <span className="dot"></span>
              🔔
            </div>

            <div
              className="avatar-chip"
              onClick={() =>
                goTo("profile")
              }
            >
              <div className="avatar-circle">
                {avatarInitial}
              </div>
            </div>

          </div>

        </div>

        {/* CONTENT */}

        <div className="content">

          {dashboardLoading && (
            <div
              className="card"
              style={{
                textAlign:
                  "center",
                padding: 40,
              }}
            >
              Loading your dashboard...
            </div>
          )}

          {!dashboardLoading &&
            dashboardError && (
              <div
                className="card"
                style={{
                  textAlign:
                    "center",
                  padding: 40,
                }}
              >
                {dashboardError}
              </div>
            )}

          {!dashboardLoading &&
            !dashboardError && (
              <>

                {/* DASHBOARD */}

                {activeView ===
                  "dashboard" && (
                  <DashboardView
                    userFirstName={
                      userFirstName
                    }
                    stats={
                      stats
                    }
                    recentResult={
                      recentResult ||
                      emptyResult
                    }
                    history={
                      history
                    }
                    appointments={
                      appointments
                    }
                    goTo={
                      goTo
                    }
                    onViewResult={
                      viewHistoryItem
                    }
                  />
                )}

                {/* SCAN */}

                {activeView ===
                  "scan" && (
                  <Choose />
                )}

                {/* RESULT */}

                {activeView ===
                  "result" && (
                  <ResultView
                    result={
                      displayedResult
                    }
                    goTo={
                      goTo
                    }
                  />
                )}

                {/* DISEASE INFO */}

                {activeView ===
                  "diseaseInfo" && (
                  <DiseaseInfoView
                    diseaseName={
                      displayedResult.disease
                    }
                    openSection={
                      openSection
                    }
                    setOpenSection={
                      setOpenSection
                    }
                  />
                )}

                {/* HISTORY */}

                {activeView ===
                  "history" && (
                  <HistoryView
                    rows={
                      filteredHistory
                    }
                    search={
                      historySearch
                    }
                    setSearch={
                      setHistorySearch
                    }
                    filter={
                      historyFilter
                    }
                    setFilter={
                      setHistoryFilter
                    }
                    onView={
                      viewHistoryItem
                    }
                  />
                )}

                {/* REPORTS */}

                {activeView ===
                  "reports" && (
                  <ReportsView
                    reports={
                      reports
                    }
                    onAction={
                      handleReportAction
                    }
                  />
                )}

                {/* CONSULT DOCTOR */}

                {activeView ===
                  "consult" && (
                  <ConsultView
                    assessmentId={
                      consultAssessmentId
                    }
                  />
                )}

                {/* MY APPOINTMENTS */}

                {activeView ===
                  "appointments" && (
                  <AppointmentsView
                    appointments={
                      appointments
                    }
                    loading={
                      appointmentsLoading
                    }
                    error={
                      appointmentsError
                    }
                    onRefresh={
                      loadAppointments
                    }
                    onCancel={
                      handleCancelAppointment
                    }
                    onGoDoctors={() =>
                      goTo(
                        "consult"
                      )
                    }
                  />
                )}

                {/* NOTIFICATIONS */}

                {activeView ===
                  "notifications" && (
                  <NotificationsView
                    items={
                      notifications
                    }
                  />
                )}

                {/* PROFILE */}

                {activeView ===
                  "profile" && (
                  <ProfileView
                    profile={
                      profile
                    }
                    setProfile={
                      setProfile
                    }
                    savedProfile={
                      savedProfile
                    }
                    onSave={
                      handleSaveProfile
                    }
                    onChangePassword={
                      handleChangePassword
                    }
                  />
                )}

                {/* SETTINGS */}

                {activeView ===
                  "settings" && (
                  <SettingsView
                    darkMode={
                      darkMode
                    }
                    setDarkMode={
                      setDarkMode
                    }
                    language={
                      language
                    }
                    setLanguage={
                      setLanguage
                    }
                    notifScan={
                      notifScan
                    }
                    setNotifScan={
                      setNotifScan
                    }
                    notifFollowup={
                      notifFollowup
                    }
                    setNotifFollowup={
                      setNotifFollowup
                    }
                  />
                )}

              </>
            )}

        </div>

      </div>

    </div>
  );
}

/* ============================================================
   DASHBOARD VIEW
============================================================ */

function DashboardView({
  userFirstName,
  stats,
  recentResult,
  history,
  appointments,
  goTo,
  onViewResult,
}) {
  const upcomingAppointment =
    appointments.find(
      (appointment) => {
        const status =
          String(
            getAppointmentStatus(
              appointment
            )
          ).toLowerCase();

        return (
          status !==
            "cancelled" &&
          status !==
            "canceled" &&
          status !==
            "rejected" &&
          status !==
            "completed"
        );
      }
    );

  return (
    <section className="view active">

      <div className="welcome">

        <div>
          <h1>
            Hello,{" "}
            {userFirstName} 👋
          </h1>

          <p>
            Here's a quick look at
            your skin health overview.
          </p>
        </div>

      </div>

      {/* STATS */}

      <div className="stats-grid">

        <StatCard
          icon="📷"
          iconClass="blue"
          value={
            stats.totalScans
          }
          label="Total Scans"
        />

        <StatCard
          icon="📅"
          iconClass="teal"
          value={
            stats.lastScanDate
          }
          label="Last Scan Date"
        />

        <StatCard
          icon="✅"
          iconClass="green"
          value={
            stats.currentStatus
          }
          label="Current Status"
        />

        <StatCard
          icon="📄"
          iconClass="mint"
          value={
            stats.reportsAvailable
          }
          label="Reports Available"
        />

      </div>

      {/* SCAN CTA */}

      <div className="cta-scan">

        <div>
          <h3>
            📷 Ready for your
            next check-up?
          </h3>

          <p>
            Scan your skin in seconds
            and get an instant
            AI-powered analysis.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() =>
            goTo("scan")
          }
        >
          Quick Scan
        </button>

      </div>

      {/* APPOINTMENT */}

      {upcomingAppointment && (
        <div
          className="card"
          style={{
            marginBottom: 20,
          }}
        >

          <div className="result-preview-row">

            <div
              className="section-title"
              style={{
                marginBottom: 0,
              }}
            >
              📅 Upcoming Appointment
            </div>

            <button
              className="btn btn-outline"
              onClick={() =>
                goTo(
                  "appointments"
                )
              }
            >
              View All
            </button>

          </div>

          <div className="result-item">
            <span className="k">
              Doctor
            </span>

            <span className="v">
              {
                getAppointmentDoctorName(
                  upcomingAppointment
                )
              }
            </span>
          </div>

          <div className="result-item">
            <span className="k">
              Date
            </span>

            <span className="v">
              {formatAppointmentDate(
                getAppointmentDate(
                  upcomingAppointment
                )
              )}
            </span>
          </div>

          <div className="result-item">
            <span className="k">
              Time
            </span>

            <span className="v">
              {
                getAppointmentStartTime(
                  upcomingAppointment
                )
              }
              {getAppointmentEndTime(
                upcomingAppointment
              )
                ? ` - ${getAppointmentEndTime(
                    upcomingAppointment
                  )}`
                : ""}
            </span>
          </div>

          <div className="result-item">
            <span className="k">
              Mode
            </span>

            <span className="v">
              {
                MODE_LABELS[
                  getAppointmentMode(
                    upcomingAppointment
                  )
                ] ||
                getAppointmentMode(
                  upcomingAppointment
                )
              }
            </span>
          </div>

          <div
            style={{
              marginTop: 12,
            }}
          >
            <span
              className={appointmentStatusClass(
                getAppointmentStatus(
                  upcomingAppointment
                )
              )}
            >
              {appointmentStatusLabel(
                getAppointmentStatus(
                  upcomingAppointment
                )
              )}
            </span>
          </div>

        </div>
      )}

      {/* GRID */}

      <div className="dash-grid">

        <div className="card">

          <div className="result-preview-row">

            <div
              className="section-title"
              style={{
                marginBottom: 0,
              }}
            >
              📈 Recent Scan Result
            </div>

            <span
              className={severityBadgeClass(
                recentResult.severity
              )}
            >
              {
                recentResult.severity
              }
            </span>

          </div>

          <div className="result-item">
            <span className="k">
              Disease
            </span>

            <span className="v">
              {
                recentResult.disease
              }
            </span>
          </div>

          <div className="result-item">
            <span className="k">
              Confidence
            </span>

            <span className="v">
              {recentResult.confidence.toFixed(
                0
              )}
              %
            </span>
          </div>

          <div className="result-item">
            <span className="k">
              Scanned on
            </span>

            <span className="v">
              {
                recentResult.date
              }
            </span>
          </div>

          <button
            className="btn btn-outline"
            style={{
              marginTop: 16,
            }}
            onClick={() =>
              onViewResult(
                recentResult
              )
            }
          >
            View Full Report
          </button>

        </div>

        <div className="card">

          <div className="section-title">
            📜 Recent History
          </div>

          {history.length ===
          0 ? (
            <p
              style={{
                color:
                  "var(--text-secondary)",
                fontSize:
                  13.5,
              }}
            >
              No scans yet — your
              history will show up
              here.
            </p>
          ) : (
            <ul className="history-mini">

              {history
                .slice(0, 4)
                .map((item) => (
                  <li
                    key={item.id}
                    onClick={() =>
                      onViewResult(
                        item
                      )
                    }
                    style={{
                      cursor:
                        "pointer",
                    }}
                  >

                    <span>

                      <span
                        className={`dot ${
                          item.status ===
                          "Healthy"
                            ? "dot-green"
                            : "dot-amber"
                        }`}
                      ></span>

                      {
                        item.disease
                      }

                    </span>

                    <span
                      style={{
                        color:
                          "var(--text-secondary)",
                        fontSize:
                          12.5,
                      }}
                    >
                      {
                        item.date
                      }
                    </span>

                  </li>
                ))}

            </ul>
          )}

          <button
            className="btn btn-outline"
            style={{
              marginTop: 14,
              width: "100%",
            }}
            onClick={() =>
              goTo("history")
            }
          >
            View All History
          </button>

        </div>

      </div>

    </section>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  icon,
  iconClass,
  value,
  label,
}) {
  return (
    <div className="stat-card">

      <div
        className={`stat-icon ${iconClass}`}
      >
        {icon}
      </div>

      <div>

        <div className="stat-value">
          {value}
        </div>

        <div className="stat-label">
          {label}
        </div>

      </div>

    </div>
  );
}

/* ============================================================
   RESULT VIEW
============================================================ */

function ResultView({
  result,
  goTo,
}) {
  return (
    <section className="view active">

      <div className="section-title">
        🤖 Scan Result
      </div>

      <div className="card mb">

        <div className="result-hero">

          <div className="result-photo">

            {result.image ? (
              <img
                src={
                  result.image
                }
                alt="Scanned"
              />
            ) : (
              "No image available"
            )}

          </div>

          <div className="result-main">

            <div className="result-disease">
              {
                result.disease
              }
            </div>

            <span
              className={severityBadgeClass(
                result.severity
              )}
            >
              Severity:{" "}
              {
                result.severity
              }
            </span>

            <div
              style={{
                marginTop: 14,
                fontSize: 13,
                color:
                  "var(--text-secondary)",
              }}
            >
              Confidence Score
            </div>

            <div className="confidence-bar-track">

              <div
                className="confidence-bar-fill"
                style={{
                  width: `${result.confidence}%`,
                }}
              ></div>

            </div>

            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {result.confidence.toFixed(
                0
              )}
              %
            </div>

            <div className="recommend-box">
              <b>
                Recommended Action:
              </b>{" "}
              {
                result.recommendation
              }
            </div>

          </div>

        </div>

        <div className="info-grid">

          <div className="info-box">

            <div className="lbl">
              Short Description
            </div>

            <div
              className="val"
              style={{
                fontWeight: 500,
              }}
            >
              {
                result.description
              }
            </div>

          </div>

          <div className="info-box">

            <div className="lbl">
              Is it Contagious?
            </div>

            <div className="val">
              {
                result.contagious
              }
            </div>

          </div>

          <div className="info-box">

            <div className="lbl">
              Scanned On
            </div>

            <div className="val">
              {
                result.date
              }
            </div>

          </div>

        </div>

        <div
          className="scan-actions"
          style={{
            justifyContent:
              "flex-start",
            marginTop: 22,
          }}
        >

          <button
            className="btn btn-primary"
            onClick={() =>
              goTo(
                "diseaseInfo"
              )
            }
          >
            📖 Learn About This Disease
          </button>

          <button
            className="btn btn-outline"
            onClick={() =>
              goTo(
                "reports"
              )
            }
          >
            📄 View / Download Report
          </button>

          <button
            className="btn btn-outline"
            onClick={() =>
              goTo(
                "consult"
              )
            }
          >
            🩺 Consult a Dermatologist
          </button>

        </div>

      </div>

    </section>
  );
}

/* ============================================================
   DISEASE INFO
============================================================ */

function DiseaseInfoView({
  diseaseName,
  openSection,
  setOpenSection,
}) {
  return (
    <section className="view active">

      <div className="section-title">
        📖 Disease Information —{" "}
        {diseaseName}
      </div>

      <div>

        {diseaseInfoSections.map(
          (sec) => (
            <div
              key={sec.key}
              className={`accordion ${
                openSection ===
                sec.key
                  ? "open"
                  : ""
              }`}
            >

              <div
                className="accordion-head"
                onClick={() =>
                  setOpenSection(
                    openSection ===
                      sec.key
                      ? null
                      : sec.key
                  )
                }
              >

                {sec.label}

                <span className="chev">
                  ▾
                </span>

              </div>

              <div className="accordion-body">
                {sec.text}
              </div>

            </div>
          )
        )}

      </div>

    </section>
  );
}

/* ============================================================
   HISTORY
============================================================ */

function HistoryView({
  rows,
  search,
  setSearch,
  filter,
  setFilter,
  onView,
}) {
  return (
    <section className="view active">

      <div className="section-title">
        📊 Scan History
      </div>

      <div className="card">

        <div className="table-toolbar">

          <div className="search-box">
            🔍{" "}

            <input
              type="text"
              placeholder="Search by disease..."
              value={
                search
              }
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          <select
            className="filter-select"
            value={
              filter
            }
            onChange={(e) =>
              setFilter(
                e.target.value
              )
            }
          >
            <option value="all">
              All Status
            </option>

            <option value="Healthy">
              Healthy
            </option>

            <option value="Disease Detected">
              Disease Detected
            </option>

          </select>

        </div>

        {rows.length ===
        0 ? (
          <p
            style={{
              color:
                "var(--text-secondary)",
              padding:
                "16px 4px",
            }}
          >
            No scans match this
            search/filter yet.
          </p>
        ) : (

          <table>

            <thead>

              <tr>
                <th>Date</th>
                <th>Disease</th>
                <th>Confidence</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>

            </thead>

            <tbody>

              {rows.map(
                (item) => (
                  <tr
                    key={
                      item.id
                    }
                  >

                    <td>
                      {
                        item.date
                      }
                    </td>

                    <td>
                      {
                        item.disease
                      }
                    </td>

                    <td>
                      {item.confidence.toFixed(
                        0
                      )}
                      %
                    </td>

                    <td>
                      {statusBadge(
                        item.status
                      )}
                    </td>

                    <td>

                      <div className="row-actions">

                        <button
                          className="icon-btn"
                          title="View Report"
                          onClick={() =>
                            onView(
                              item
                            )
                          }
                        >
                          👁
                        </button>

                        <button
                          className="icon-btn"
                          title="Download PDF"
                          onClick={() =>
                            alert(
                              "PDF download will be connected here."
                            )
                          }
                        >
                          ⬇
                        </button>

                      </div>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        )}

      </div>

    </section>
  );
}

/* ============================================================
   REPORTS
============================================================ */

function ReportsView({
  reports,
  onAction,
}) {
  return (
    <section className="view active">

      <div className="section-title">
        📄 Medical Reports
      </div>

      <div className="card">

        {reports.length ===
        0 ? (
          <p
            style={{
              color:
                "var(--text-secondary)",
            }}
          >
            No reports available
            yet.
          </p>
        ) : (

          reports.map(
            (r, i) => (
              <div
                className="report-card"
                key={
                  r.id ||
                  r._id ||
                  i
                }
              >

                <div className="report-left">

                  <div className="report-icon">
                    📄
                  </div>

                  <div>

                    <div className="report-title">
                      {
                        r.title
                      }
                    </div>

                    <div className="report-sub">
                      {
                        r.date
                      }
                    </div>

                  </div>

                </div>

                <div className="report-actions">

                  <button
                    className="btn btn-outline"
                    onClick={() =>
                      onAction(
                        "download-pdf",
                        r
                      )
                    }
                  >
                    ⬇ Download
                  </button>

                  <button
                    className="btn btn-outline"
                    onClick={() =>
                      onAction(
                        "print-report",
                        r
                      )
                    }
                  >
                    🖨 Print
                  </button>

                  <button
                    className="btn btn-outline"
                    onClick={() =>
                      onAction(
                        "share-report",
                        r
                      )
                    }
                  >
                    🔗 Share
                  </button>

                </div>

              </div>
            )
          )

        )}

      </div>

    </section>
  );
}

/* ============================================================
   MY APPOINTMENTS
============================================================ */

function AppointmentsView({
  appointments,
  loading,
  error,
  onRefresh,
  onCancel,
  onGoDoctors,
}) {
  const navigate =
    useNavigate();

  return (
    <section className="view active">

      {/* HEADER */}

      <div
        style={{
          display:
            "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          gap: 12,
          marginBottom: 18,
          flexWrap:
            "wrap",
        }}
      >

        <div>

          <div
            className="section-title"
            style={{
              marginBottom: 4,
            }}
          >
            📅 My Appointments
          </div>

          <p
            style={{
              color:
                "var(--text-secondary)",
              margin: 0,
            }}
          >
            Manage your dermatologist
            consultations.
          </p>

        </div>

        <div
          style={{
            display:
              "flex",
            gap: 10,
          }}
        >

          <button
            className="btn btn-outline"
            onClick={
              onRefresh
            }
          >
            ↻ Refresh
          </button>

          <button
            className="btn btn-primary"
            onClick={
              onGoDoctors
            }
          >
            + Book Consultation
          </button>

        </div>

      </div>

      {/* LOADING */}

      {loading && (
        <div
          className="card"
          style={{
            textAlign:
              "center",
            padding: 40,
          }}
        >
          Loading your
          appointments...
        </div>
      )}

      {/* ERROR */}

      {!loading &&
        error && (
          <div
            className="card"
            style={{
              textAlign:
                "center",
              padding: 30,
            }}
          >

            <div
              style={{
                fontSize:
                  "2rem",
                marginBottom:
                  10,
              }}
            >
              ⚠️
            </div>

            <p>
              {error}
            </p>

            <button
              className="btn btn-primary"
              onClick={
                onRefresh
              }
            >
              Try Again
            </button>

          </div>
        )}

      {/* EMPTY */}

      {!loading &&
        !error &&
        appointments.length ===
          0 && (
          <div
            className="card"
            style={{
              textAlign:
                "center",
              padding: 50,
            }}
          >

            <div
              style={{
                fontSize:
                  "3rem",
                marginBottom:
                  12,
              }}
            >
              📅
            </div>

            <h3>
              No appointments yet
            </h3>

            <p
              style={{
                color:
                  "var(--text-secondary)",
                marginBottom:
                  20,
              }}
            >
              You haven't booked
              a dermatologist
              consultation yet.
            </p>

            <button
              className="btn btn-primary"
              onClick={
                onGoDoctors
              }
            >
              Find a Dermatologist
            </button>

          </div>
        )}

      {/* APPOINTMENT LIST */}

      {!loading &&
        !error &&
        appointments.length >
          0 && (

          <div
            style={{
              display:
                "flex",
              flexDirection:
                "column",
              gap: 16,
            }}
          >

            {appointments.map(
              (
                appointment,
                index
              ) => {

                const appointmentId =
                  appointment._id ||
                  appointment.id ||
                  index;

                const status =
                  getAppointmentStatus(
                    appointment
                  );

                const doctorName =
                  getAppointmentDoctorName(
                    appointment
                  );

                const specialization =
                  getAppointmentSpecialization(
                    appointment
                  );

                const appointmentDate =
                  getAppointmentDate(
                    appointment
                  );

                const startTime =
                  getAppointmentStartTime(
                    appointment
                  );

                const endTime =
                  getAppointmentEndTime(
                    appointment
                  );

                const mode =
                  getAppointmentMode(
                    appointment
                  );

                const doctor =
                  getDoctorFromAppointment(
                    appointment
                  );

                const doctorId =
                  appointment
                    .doctorProfileId ||
                  appointment
                    .doctorProfile?._id ||
                  doctor._id ||
                  appointment.doctorId;

                const normalizedStatus =
                  String(
                    status
                  ).toLowerCase();

                const canCancel =
                  ![
                    "cancelled",
                    "canceled",
                    "completed",
                    "rejected",
                  ].includes(
                    normalizedStatus
                  );

                return (
                  <div
                    className="card"
                    key={
                      appointmentId
                    }
                  >

                    {/* TOP */}

                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        gap: 16,
                        alignItems:
                          "flex-start",
                        flexWrap:
                          "wrap",
                      }}
                    >

                      <div
                        style={{
                          display:
                            "flex",
                          gap: 14,
                          alignItems:
                            "center",
                        }}
                      >

                        {/* DOCTOR AVATAR */}

                        <div
                          style={{
                            width:
                              56,
                            height:
                              56,
                            borderRadius:
                              "50%",
                            background:
                              "var(--bg-section)",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            fontSize:
                              "1.2rem",
                            fontWeight:
                              700,
                            overflow:
                              "hidden",
                            flexShrink:
                              0,
                          }}
                        >

                          {doctor.profileImage ? (
                            <img
                              src={
                                doctor.profileImage
                              }
                              alt={
                                doctorName
                              }
                              style={{
                                width:
                                  "100%",
                                height:
                                  "100%",
                                objectFit:
                                  "cover",
                              }}
                            />
                          ) : (
                            doctorName
                              .replace(
                                "Dr. ",
                                ""
                              )
                              .charAt(
                                0
                              )
                              .toUpperCase()
                          )}

                        </div>

                        <div>

                          <h3
                            style={{
                              margin:
                                0,
                              marginBottom:
                                4,
                            }}
                          >
                            {doctorName}
                          </h3>

                          <p
                            style={{
                              margin:
                                0,
                              color:
                                "var(--text-secondary)",
                              fontSize:
                                13,
                            }}
                          >
                            {
                              specialization
                            }
                          </p>

                        </div>

                      </div>

                      <span
                        className={appointmentStatusClass(
                          status
                        )}
                      >
                        {appointmentStatusLabel(
                          status
                        )}
                      </span>

                    </div>

                    {/* DETAILS */}

                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: 14,
                        marginTop:
                          22,
                        paddingTop:
                          18,
                        borderTop:
                          "1px solid var(--border-color)",
                      }}
                    >

                      <AppointmentDetail
                        icon="📅"
                        label="Date"
                        value={formatAppointmentDate(
                          appointmentDate
                        )}
                      />

                      <AppointmentDetail
                        icon="⏰"
                        label="Time"
                        value={
                          startTime
                            ? `${startTime}${
                                endTime
                                  ? ` - ${endTime}`
                                  : ""
                              }`
                            : "Not specified"
                        }
                      />

                      <AppointmentDetail
                        icon={
                          MODE_ICONS[
                            mode
                          ] ||
                          "💬"
                        }
                        label="Consultation"
                        value={
                          MODE_LABELS[
                            mode
                          ] ||
                          mode
                        }
                      />

                      <AppointmentDetail
                        icon="💰"
                        label="Fee"
                        value={
                          appointment.fee ||
                          appointment.consultationFee
                            ? `₹${
                                appointment.fee ||
                                appointment.consultationFee
                              }`
                            : "Not specified"
                        }
                      />

                    </div>

                    {/* REASON */}

                    {(appointment.reason ||
                      appointment.patientMessage) && (
                      <div
                        style={{
                          marginTop:
                            18,
                          padding:
                            14,
                          borderRadius:
                            10,
                          background:
                            "var(--bg-section)",
                        }}
                      >

                        {appointment.reason && (
                          <div
                            style={{
                              marginBottom:
                                appointment.patientMessage
                                  ? 8
                                  : 0,
                            }}
                          >
                            <strong>
                              Reason:
                            </strong>{" "}
                            {
                              appointment.reason
                            }
                          </div>
                        )}

                        {appointment.patientMessage && (
                          <div>
                            <strong>
                              Message:
                            </strong>{" "}
                            {
                              appointment.patientMessage
                            }
                          </div>
                        )}

                      </div>
                    )}

                    {/* REPORT */}

                    {appointment.assessmentId && (
                      <div
                        style={{
                          marginTop:
                            14,
                          fontSize:
                            13,
                          color:
                            "var(--text-secondary)",
                        }}
                      >
                        📄 AI skin assessment
                        attached to this
                        consultation.
                      </div>
                    )}

                    {/* ACTIONS */}

                    <div
                      style={{
                        display:
                          "flex",
                        gap: 10,
                        marginTop:
                          20,
                        flexWrap:
                          "wrap",
                      }}
                    >

                      {doctorId && (
                        <button
                          className="btn btn-outline"
                          onClick={() =>
                            navigate(
                              `/doctors/${doctorId}`
                            )
                          }
                        >
                          👨‍⚕️ View Doctor
                        </button>
                      )}

                      {mode ===
                        "video" &&
                        normalizedStatus ===
                          "confirmed" && (
                          <button
                            className="btn btn-primary"
                            onClick={() =>
                              alert(
                                "Video consultation will open here."
                              )
                            }
                          >
                            🎥 Join Video Call
                          </button>
                        )}

                      {(mode ===
                        "text" ||
                        mode ===
                          "chat") &&
                        normalizedStatus ===
                          "confirmed" && (
                          <button
                            className="btn btn-primary"
                            onClick={() =>
                              alert(
                                "Doctor chat will open here."
                              )
                            }
                          >
                            💬 Open Chat
                          </button>
                        )}

                      {canCancel && (
                        <button
                          className="btn btn-outline"
                          onClick={() =>
                            onCancel(
                              appointment
                            )
                          }
                          style={{
                            color:
                              "#dc2626",
                            borderColor:
                              "#dc2626",
                          }}
                        >
                          Cancel Appointment
                        </button>
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

    </section>
  );
}

/* ============================================================
   APPOINTMENT DETAIL
============================================================ */

function AppointmentDetail({
  icon,
  label,
  value,
}) {
  return (
    <div>

      <div
        style={{
          color:
            "var(--text-secondary)",
          fontSize:
            12,
          marginBottom:
            5,
        }}
      >
        {icon}{" "}
        {label}
      </div>

      <strong
        style={{
          fontSize:
            14,
        }}
      >
        {value}
      </strong>

    </div>
  );
}

/* ============================================================
   CONSULT DOCTOR
============================================================ */

function ConsultView({
  assessmentId,
}) {
  const navigate =
    useNavigate();

  const [doctors, setDoctors] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [activeFilter, setActiveFilter] =
    useState("All doctors");

  useEffect(() => {
    loadDoctors();
  }, []);

  async function loadDoctors() {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(
          "/api/doctors"
        );

      const fetchedDoctors =
        response.data?.doctors ||
        response.data?.data ||
        [];

      setDoctors(
        fetchedDoctors
      );

    } catch (err) {
      console.error(
        "DOCTORS FETCH ERROR:",
        err.response?.data ||
          err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to load doctors."
      );
    } finally {
      setLoading(false);
    }
  }

  const visibleDoctors =
    activeFilter ===
    "Available now"
      ? doctors.filter(
          (doctor) =>
            doctor.isAvailable ||
            doctor.status ===
              "available"
        )
      : doctors;

  if (loading) {
    return (
      <section className="view active">

        <div className="section-title">
          🩺 Find a Dermatologist
        </div>

        <div
          className="card"
          style={{
            textAlign:
              "center",
            padding: 40,
          }}
        >
          Loading doctors...
        </div>

      </section>
    );
  }

  return (
    <section className="view active">

      <div className="section-title">
        🩺 Find a Dermatologist
      </div>

      <p
        style={{
          color:
            "var(--text-secondary)",
          marginTop: -6,
          marginBottom: 16,
        }}
      >
        Choose a dermatologist
        for your consultation.
      </p>

      <div className="filters">

        {[
          "All doctors",
          "Available now",
        ].map((filter) => (
          <div
            key={filter}
            className={`filter-chip ${
              activeFilter ===
              filter
                ? "is-active"
                : ""
            }`}
            onClick={() =>
              setActiveFilter(
                filter
              )
            }
          >
            {filter}
          </div>
        ))}

      </div>

      {error && (
        <div
          className="card"
          style={{
            marginBottom:
              16,
          }}
        >
          <p>
            {error}
          </p>

          <button
            className="btn btn-primary"
            onClick={
              loadDoctors
            }
          >
            Retry
          </button>
        </div>
      )}

      {!error &&
        visibleDoctors.length ===
          0 && (
          <div
            className="card"
            style={{
              textAlign:
                "center",
              padding: 40,
            }}
          >
            No doctors available
            right now.
          </div>
        )}

      {visibleDoctors.map(
        (doctor) => {

          const user =
            doctor.user ||
            {};

          const name =
            user.fullName ||
            doctor.fullName ||
            doctor.name ||
            "Doctor";

          const specialization =
            doctor.specialization ||
            "Dermatologist";

          const qualification =
            doctor.qualification ||
            "";

          const experience =
            doctor.experience;

          const modes =
            doctor.consultationModes ||
            [];

          const profileImage =
            doctor.profileImage;

          return (
            <div
              className="doctor-card"
              key={
                doctor._id ||
                doctor.id
              }
              onClick={() =>
                navigate(
                  `/doctors/${
                    doctor._id ||
                    doctor.id
                  }`
                )
              }
            >

              <div className="doctor-card__avatar">

                {profileImage ? (
                  <img
                    src={
                      profileImage
                    }
                    alt={name}
                    style={{
                      width:
                        "100%",
                      height:
                        "100%",
                      objectFit:
                        "cover",
                      borderRadius:
                        "50%",
                    }}
                  />
                ) : (
                  name
                    .charAt(0)
                    .toUpperCase()
                )}

              </div>

              <div className="doctor-card__body">

                <div className="doctor-card__name">
                  Dr.{" "}
                  {name.replace(
                    /^Dr\.\s*/i,
                    ""
                  )}
                </div>

                <div className="doctor-card__role">
                  {specialization}

                  {qualification
                    ? ` · ${qualification}`
                    : ""}

                  {experience !=
                    null
                    ? ` · ${experience} yrs experience`
                    : ""}
                </div>

                <div className="doctor-card__meta">

                  {doctor.rating && (
                    <span>
                      ⭐{" "}
                      {
                        doctor.rating
                      }
                    </span>
                  )}

                  {doctor.city && (
                    <span>
                      📍{" "}
                      {
                        doctor.city
                      }
                    </span>
                  )}

                </div>

                {doctor.isAvailable ? (
                  <span className="status-dot">
                    Available
                  </span>
                ) : (
                  <span
                    className="status-dot"
                    style={{
                      color:
                        "var(--text-secondary)",
                    }}
                  >
                    Currently unavailable
                  </span>
                )}

                <div className="mode-row">

                  {modes.map(
                    (mode) => (
                      <span
                        className="mode-tag"
                        key={
                          mode
                        }
                      >
                        {
                          MODE_LABELS[
                            mode
                          ] ||
                          mode
                        }
                      </span>
                    )
                  )}

                </div>

                <div
                  style={{
                    marginTop:
                      12,
                  }}
                >
                  <button
                    className="btn btn-primary"
                    onClick={(
                      e
                    ) => {
                      e.stopPropagation();

                      navigate(
                        `/doctors/${
                          doctor._id ||
                          doctor.id
                        }/book`,
                        {
                          state: {
                            assessmentId,
                          },
                        }
                      );
                    }}
                  >
                    Book Consultation
                  </button>
                </div>

              </div>

            </div>
          );
        }
      )}

    </section>
  );
}

/* ============================================================
   NOTIFICATIONS
============================================================ */

function NotificationsView({
  items,
}) {
  return (
    <section className="view active">

      <div className="section-title">
        🔔 Notifications
      </div>

      <div className="card">

        {items.length ===
        0 ? (
          <p
            style={{
              color:
                "var(--text-secondary)",
            }}
          >
            You're all caught up —
            no notifications.
          </p>
        ) : (

          items.map(
            (n, i) => (
              <div
                className={`notif-item ${
                  n.unread
                    ? "unread"
                    : ""
                }`}
                key={
                  n.id ||
                  n._id ||
                  i
                }
              >

                <div
                  className="notif-icon"
                  style={{
                    background:
                      "var(--bg-main)",
                  }}
                >
                  {
                    n.icon ||
                    "🔔"
                  }
                </div>

                <div>

                  <div className="notif-title">
                    {
                      n.title
                    }
                  </div>

                  <div className="notif-time">
                    {
                      n.time
                    }
                  </div>

                </div>

              </div>
            )
          )

        )}

      </div>

    </section>
  );
}

/* ============================================================
   PROFILE
============================================================ */

function ProfileView({
  profile,
  setProfile,
  savedProfile,
  onSave,
  onChangePassword,
}) {
  function update(
    field,
    value
  ) {
    setProfile(
      (p) => ({
        ...p,
        [field]:
          value,
      })
    );
  }

  return (
    <section className="view active">

      <div className="section-title">
        👤 Profile
      </div>

      <div className="card">

        <div className="profile-head">

          <div className="profile-avatar">
            {(
              savedProfile.name ||
              "U"
            )
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>

            <div className="profile-name">
              {
                savedProfile.name ||
                "Not available"
              }
            </div>

            <div className="profile-email">
              {
                savedProfile.email ||
                "Not available"
              }
            </div>

          </div>

        </div>

        <div className="form-grid">

          <div className="field">

            <label>
              Full Name
            </label>

            <input
              type="text"
              value={
                profile.name
              }
              onChange={(e) =>
                update(
                  "name",
                  e.target.value
                )
              }
            />

          </div>

          <div className="field">

            <label>
              Age
            </label>

            <input
              type="number"
              value={
                profile.age
              }
              onChange={(e) =>
                update(
                  "age",
                  e.target.value
                )
              }
            />

          </div>

          <div className="field">

            <label>
              Gender
            </label>

            <select
              value={
                profile.gender
              }
              onChange={(e) =>
                update(
                  "gender",
                  e.target.value
                )
              }
            >

              <option value="">
                Select
              </option>

              <option>
                Male
              </option>

              <option>
                Female
              </option>

              <option>
                Other
              </option>

            </select>

          </div>

          <div className="field">

            <label>
              Email
            </label>

            <input
              type="email"
              value={
                profile.email
              }
              onChange={(e) =>
                update(
                  "email",
                  e.target.value
                )
              }
            />

          </div>

          <div className="field">

            <label>
              Phone
            </label>

            <input
              type="tel"
              value={
                profile.phone
              }
              onChange={(e) =>
                update(
                  "phone",
                  e.target.value
                )
              }
            />

          </div>

        </div>

        <div
          style={{
            marginTop:
              20,
            display:
              "flex",
            gap: 12,
            flexWrap:
              "wrap",
          }}
        >

          <button
            className="btn btn-primary"
            onClick={
              onSave
            }
          >
            Save Changes
          </button>

          <button
            className="btn btn-outline"
            onClick={
              onChangePassword
            }
          >
            Change Password
          </button>

        </div>

      </div>

    </section>
  );
}

/* ============================================================
   SETTINGS
============================================================ */

function SettingsView({
  darkMode,
  setDarkMode,
  language,
  setLanguage,
  notifScan,
  setNotifScan,
  notifFollowup,
  setNotifFollowup,
}) {
  return (
    <section className="view active">

      <div className="section-title">
        ⚙ Settings
      </div>

      <div className="card">

        <div className="settings-row">

          <div>

            <div className="settings-label">
              Dark Mode
            </div>

            <div className="settings-sub">
              Switch between light
              and dark theme
            </div>

          </div>

          <div
            className={`toggle ${
              darkMode
                ? "on"
                : ""
            }`}
            onClick={() =>
              setDarkMode(
                (d) => !d
              )
            }
          >
            <div className="knob"></div>
          </div>

        </div>

        <div className="settings-row">

          <div>

            <div className="settings-label">
              Language
            </div>

            <div className="settings-sub">
              Choose your preferred
              language
            </div>

          </div>

          <select
            className="filter-select"
            value={
              language
            }
            onChange={(e) =>
              setLanguage(
                e.target.value
              )
            }
          >

            <option>
              English
            </option>

            <option>
              हिन्दी
            </option>

          </select>

        </div>

        <div className="settings-row">

          <div>

            <div className="settings-label">
              Scan Completed Alerts
            </div>

            <div className="settings-sub">
              Get notified when a
              scan result is ready
            </div>

          </div>

          <div
            className={`toggle ${
              notifScan
                ? "on"
                : ""
            }`}
            onClick={() =>
              setNotifScan(
                (v) => !v
              )
            }
          >
            <div className="knob"></div>
          </div>

        </div>

        <div className="settings-row">

          <div>

            <div className="settings-label">
              Follow-up Reminders
            </div>

            <div className="settings-sub">
              Reminders for
              recommended doctor
              visits
            </div>

          </div>

          <div
            className={`toggle ${
              notifFollowup
                ? "on"
                : ""
            }`}
            onClick={() =>
              setNotifFollowup(
                (v) => !v
              )
            }
          >
            <div className="knob"></div>
          </div>

        </div>

      </div>

    </section>
  );
}