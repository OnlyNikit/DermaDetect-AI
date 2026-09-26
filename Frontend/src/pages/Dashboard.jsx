import React, { useEffect, useState } from "react";
import "../components/styles/dashboard.css";

import { useAuth } from "../components/context/AuthContext";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import api from "../api/axios";
import Choose from "../pages/Choose";
import DoctorList from "../pages/Doctorlist";
import DoctorDetails from "../pages/DoctorDetails";
import BookAppointment from "../pages/BookAppointment";

/* ============================================================
   CONSTANTS
============================================================ */

const TITLE_MAP = {
  dashboard: "Dashboard",
  scan: "New Skin Scan",
  result: "Scan Result",
  diseaseInfo: "Disease Information",
  history: "Scan History",
  reports: "Medical Reports",
  consult: "Consult a Dermatologist",
  appointments: "My Appointments",
  notifications: "Notifications",
  profile: "Profile",
  settings: "Settings",
};

const MODE_LABELS = {
  video: "Video Call",
  text: "Text Chat",
  chat: "Text Chat",
  "in-person": "In-Person",
};

const MODE_ICONS = {
  video: "🎥",
  text: "💬",
  chat: "💬",
  "in-person": "🏥",
};

const VALID_VIEWS = new Set(Object.keys(TITLE_MAP));

/* ============================================================
   DISEASE INFO
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
    text: "Topical creams, light therapy, and medicines prescribed by a dermatologist may be used depending on severity.",
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
  id: null,
  disease: "No scans yet",
  confidence: 0,
  severity: "Low",
  description: "Run your first scan to see a personalized result here.",
  contagious: "Not available",
  recommendation: "Run your first scan to get a recommendation.",
  date: "—",
  image: null,
  status: "Not available",
};

/* ============================================================
   HELPERS
============================================================ */

function severityBadgeClass(severity) {
  if (severity === "Low") {
    return "badge badge-success";
  }

  if (severity === "High") {
    return "badge badge-danger";
  }

  return "badge badge-warn";
}

function statusBadge(status) {
  if (status === "Healthy") {
    return <span className="badge badge-success">Healthy</span>;
  }

  return <span className="badge badge-warn">Disease Detected</span>;
}

function formatDate(rawDate) {
  if (!rawDate) {
    return "Not available";
  }

  const date = new Date(rawDate);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAppointmentDate(rawDate) {
  if (!rawDate) {
    return "Date not available";
  }

  const date = new Date(rawDate);

  if (Number.isNaN(date.getTime())) {
    return rawDate;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function normalizeConfidence(value) {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) {
    return 0;
  }

  const percentage = number > 1 ? number : number * 100;

  return Math.min(100, Math.max(0, percentage));
}

function mapAssessmentToResult(assessment) {
  if (!assessment) {
    return null;
  }

  const prediction = assessment.prediction || {};

  const disease = prediction.disease || "Not available";

  return {
    id: assessment._id,

    disease,

    confidence: normalizeConfidence(prediction.confidence),

    severity: prediction.severity || "Low",

    description:
      assessment.explanation ||
      prediction.description ||
      "No description available.",

    contagious: prediction.contagious || "Not available",

    recommendation:
      assessment.recommendation ||
      prediction.recommendation ||
      "Consult a dermatologist for a full evaluation.",

    date: formatDate(assessment.updatedAt || assessment.createdAt),

    image: assessment.image || null,

    status:
      disease.toLowerCase() === "healthy" ? "Healthy" : "Disease Detected",
  };
}

/* ============================================================
   APPOINTMENT HELPERS
============================================================ */

function getAppointmentDoctor(appointment) {
  return appointment?.doctor || appointment?.doctorProfile?.user || {};
}

function getAppointmentDoctorName(appointment) {
  const doctor = getAppointmentDoctor(appointment);

  return doctor.fullName || doctor.name || "Doctor";
}

function getAppointmentSpecialization(appointment) {
  const doctor = getAppointmentDoctor(appointment);

  return (
    doctor.specialization ||
    appointment?.doctorProfile?.specialization ||
    "Dermatologist"
  );
}

function getAppointmentStatus(appointment) {
  return appointment?.status || "pending";
}

function appointmentStatusClass(status) {
  const normalized = String(status).toLowerCase();

  if (
    normalized === "accepted" ||
    normalized === "confirmed" ||
    normalized === "completed"
  ) {
    return "badge badge-success";
  }

  if (
    normalized === "rejected" ||
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    return "badge badge-danger";
  }

  return "badge badge-warn";
}

function appointmentStatusLabel(status) {
  const normalized = String(status).toLowerCase();

  const labels = {
    pending: "Pending",
    accepted: "Accepted",
    confirmed: "Confirmed",
    rejected: "Rejected",
    cancelled: "Cancelled",
    canceled: "Cancelled",
    completed: "Completed",
  };

  return labels[normalized] || status || "Pending";
}

/* ============================================================
   MAIN DASHBOARD
============================================================ */

export default function DermaDetectAI() {
  const routerLocation = useLocation();

  const navigate = useNavigate();

  const { logout } = useAuth();

  /* ==========================================================
     VIEW / URL-BACKED NAVIGATION
     -----------------------------------------------------------
     The active tab lives in the URL (?view=...). Every time we
     switch tabs we push a new history entry, so the browser's
     back/forward buttons move between tabs correctly (e.g. if
     "Consult Doctor" is open and the user presses back, they
     land back on the previous tab instead of leaving the page).
  ========================================================== */

  const [searchParams, setSearchParams] = useSearchParams();

  const initialView = searchParams.get("view");

  const [activeView, setActiveView] = useState(
    VALID_VIEWS.has(initialView) ? initialView : "dashboard",
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [consultAssessmentId, setConsultAssessmentId] = useState(null);

  /* ==========================================================
     CONSULT FLOW (all handled inside the dashboard, no route
     navigation: list -> details -> book)
  ========================================================== */

  const [consultStep, setConsultStep] = useState("list"); // "list" | "details" | "book"

  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  /* ==========================================================
     DATA
  ========================================================== */

  const [user, setUser] = useState(null);

  const [history, setHistory] = useState([]);

  const [reports, setReports] = useState([]);

  const [notifications, setNotifications] = useState([]);

  const [appointments, setAppointments] = useState([]);

  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  const [appointmentsError, setAppointmentsError] = useState("");

  const [dashboardLoading, setDashboardLoading] = useState(true);

  const [dashboardError, setDashboardError] = useState("");

  const [stats, setStats] = useState({
    totalScans: 0,
    lastScanDate: "Not available",
    currentStatus: "Not available",
    reportsAvailable: 0,
  });

  /* ==========================================================
     PROFILE
  ========================================================== */

  const [profile, setProfile] = useState({
    name: "",
    age: "",
    gender: "",
    email: "",
    phone: "",
  });

  const [savedProfile, setSavedProfile] = useState(profile);

  /* ==========================================================
     HISTORY
  ========================================================== */

  const [historySearch, setHistorySearch] = useState("");

  const [historyFilter, setHistoryFilter] = useState("all");

  /* ==========================================================
     RESULT
  ========================================================== */

  const [selectedResult, setSelectedResult] = useState(null);

  /* ==========================================================
     DISEASE INFO
  ========================================================== */

  const [openSection, setOpenSection] = useState("what");

  /* ==========================================================
     SETTINGS
  ========================================================== */

  const [darkMode, setDarkMode] = useState(false);

  const [language, setLanguage] = useState("English");

  const [notifScan, setNotifScan] = useState(true);

  const [notifFollowup, setNotifFollowup] = useState(true);

  /* ==========================================================
     NAVIGATION
     goTo pushes a new URL (?view=...). The searchParams effect
     below is the single source of truth that updates
     activeView — this way both clicking a nav item AND using
     the browser's back/forward buttons go through the same
     code path and stay in sync.
  ========================================================== */

  function goTo(view) {
    setSidebarOpen(false);

    const next = new URLSearchParams(searchParams);

    next.set("view", view);

    setSearchParams(next);
  }

  useEffect(() => {
    const view = searchParams.get("view");

    setActiveView(VALID_VIEWS.has(view) ? view : "dashboard");
  }, [searchParams]);

  // Reload appointments whenever the user lands on that tab,
  // whether by clicking the nav item or by navigating
  // back/forward in browser history.
  useEffect(() => {
    if (activeView === "appointments") {
      loadAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView]);

  // Whenever the user (re)enters the "consult" tab — via the nav
  // item, or via a "Consult Doctor" button elsewhere — start the
  // flow fresh from the doctor list.
  useEffect(() => {
    if (activeView === "consult") {
      setConsultStep("list");
      setSelectedDoctorId(null);
    }
  }, [activeView]);

  /* ==========================================================
     ROUTER STATE (deep-links from other pages, e.g. after a
     booking flow redirects back here with a target tab)
  ========================================================== */

  useEffect(() => {
    const requestedView = routerLocation.state?.view;

    const assessmentId = routerLocation.state?.assessmentId;

    if (assessmentId) {
      setConsultAssessmentId(assessmentId);
    }

    if (requestedView && VALID_VIEWS.has(requestedView)) {
      const next = new URLSearchParams(searchParams);

      next.set("view", requestedView);

      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routerLocation.state]);

  /* ==========================================================
     LOAD DASHBOARD
  ========================================================== */

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setDashboardLoading(true);
      setDashboardError("");

      const results = await Promise.allSettled([
        api.get("/api/user/profile"),

        api.get("/api/assessment/history"),

        api.get("/api/reports"),

        api.get("/api/notifications"),
      ]);

      /* USER */

      if (results[0].status === "fulfilled") {
        const fetchedUser = results[0].value.data?.user || null;

        setUser(fetchedUser);

        if (fetchedUser) {
          const profileData = {
            name: fetchedUser.fullName || "",

            age: fetchedUser.age ?? "",

            gender: fetchedUser.gender || "",

            email: fetchedUser.email || "",

            phone: fetchedUser.phone || "",
          };

          setProfile(profileData);

          setSavedProfile(profileData);
        }
      }

      /* HISTORY */

      let mappedHistory = [];

      if (results[1].status === "fulfilled") {
        const rawHistory = results[1].value.data?.history || [];

        const sortedHistory = [...rawHistory].sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();

          const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();

          return dateB - dateA;
        });

        mappedHistory = sortedHistory.map(mapAssessmentToResult);

        setHistory(mappedHistory);
      }

      /* REPORTS */

      let fetchedReports = [];

      if (results[2].status === "fulfilled") {
        fetchedReports = results[2].value.data?.reports || [];

        setReports(fetchedReports);
      }

      /* NOTIFICATIONS */

      if (results[3].status === "fulfilled") {
        setNotifications(results[3].value.data?.notifications || []);
      }

      setStats({
        totalScans: mappedHistory.length,

        lastScanDate: mappedHistory[0]?.date || "Not available",

        currentStatus: mappedHistory[0]?.status || "Not available",

        reportsAvailable: fetchedReports.length,
      });
    } catch (error) {
      console.error("DASHBOARD ERROR:", error);

      setDashboardError("Unable to load dashboard data.");
    } finally {
      setDashboardLoading(false);
    }
  }

  /* ==========================================================
     LOAD APPOINTMENTS
  ========================================================== */

  async function loadAppointments() {
    try {
      setAppointmentsLoading(true);

      setAppointmentsError("");

      const response = await api.get("/api/appointments/my");

      setAppointments(response.data?.appointments || []);
    } catch (error) {
      console.error(
        "APPOINTMENTS ERROR:",
        error.response?.data || error.message,
      );

      setAppointmentsError(
        error.response?.data?.message || "Unable to load your appointments.",
      );
    } finally {
      setAppointmentsLoading(false);
    }
  }

  /* ==========================================================
     CANCEL APPOINTMENT
  ========================================================== */

  async function handleCancelAppointment(appointment) {
    const appointmentId = appointment?._id;

    if (!appointmentId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.patch(`/api/appointments/${appointmentId}/cancel`);

      await loadAppointments();
    } catch (error) {
      console.error(
        "CANCEL APPOINTMENT ERROR:",
        error.response?.data || error.message,
      );

      alert(error.response?.data?.message || "Unable to cancel appointment.");
    }
  }

  /* ==========================================================
     LOGOUT
  ========================================================== */

  async function handleLogout() {
    try {
      await logout();

      navigate("/login");
    } catch (error) {
      console.error("LOGOUT ERROR:", error);

      alert("Logout failed.");
    }
  }

  /* ==========================================================
     PROFILE
  ========================================================== */

  async function handleSaveProfile() {
    try {
      await api.put("/api/user/profile", profile);

      setSavedProfile(profile);

      alert("Profile updated successfully.");
    } catch (error) {
      console.error("PROFILE UPDATE ERROR:", error);

      alert(error.response?.data?.message || "Could not save profile.");
    }
  }

  function handleChangePassword() {
    alert("Change password flow can be connected here.");
  }

  /* ==========================================================
     REPORT ACTION
  ========================================================== */

  function handleReportAction(action) {
    if (action === "download-pdf") {
      alert("PDF download API can be connected here.");
    }

    if (action === "print-report") {
      window.print();
    }

    if (action === "share-report") {
      alert("Report sharing can be connected here.");
    }
  }

  /* ==========================================================
     HISTORY
  ========================================================== */

  function viewHistoryItem(item) {
    setSelectedResult(item);

    goTo("result");
  }

  const filteredHistory = history.filter((item) => {
    const matchesSearch = (item.disease || "")
      .toLowerCase()
      .includes(historySearch.toLowerCase());

    const matchesFilter =
      historyFilter === "all" || item.status === historyFilter;

    return matchesSearch && matchesFilter;
  });

  /* ==========================================================
     CURRENT RESULT
  ========================================================== */

  const recentResult = history[0] || null;

  const displayedResult = selectedResult || recentResult || emptyResult;

  const userFirstName = (user?.fullName || "there").split(" ")[0];

  const avatarInitial = (user?.fullName || "U").charAt(0).toUpperCase();

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="dtc-app" data-theme={darkMode ? "dark" : "light"}>
      {/* ======================================================
          MOBILE SIDEBAR OVERLAY
          Tapping anywhere outside the sidebar box closes it.
      ====================================================== */}

      <div
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <span className="logo-dot"></span>
          Derma Detect AI
        </div>

        <ul className="nav-list">
          {[
            ["dashboard", "🏠", "Dashboard"],

            ["scan", "📷", "New Scan"],

            ["history", "📊", "Scan History"],

            ["reports", "📄", "Reports"],

            ["consult", "🩺", "Consult Doctor"],

            ["appointments", "📅", "My Appointments"],

            ["notifications", "🔔", "Notifications"],

            ["profile", "👤", "Profile"],

            ["settings", "⚙️", "Settings"],
          ].map(([key, icon, label]) => (
            <li
              key={key}
              className={`nav-item ${activeView === key ? "active" : ""}`}
              onClick={() => goTo(key)}
            >
              <span className="nav-icon">{icon}</span>

              {label}
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <div className="logout-btn" onClick={handleLogout}>
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
          <div className="topbar-left">
            <button
              className="menu-btn"
              onClick={() => setSidebarOpen((value) => !value)}
              aria-label="Toggle menu"
            >
              ☰
            </button>

            <div className="topbar-title">{TITLE_MAP[activeView]}</div>
          </div>

          <div className="topbar-right">
            <div className="bell" onClick={() => goTo("notifications")}>
              <span className="dot"></span>
              🔔
            </div>

            <div className="avatar-chip" onClick={() => goTo("profile")}>
              <div className="avatar-circle">{avatarInitial}</div>
            </div>
          </div>
        </div>

        {/* CONTENT */}

        <div className="content">
          {dashboardLoading && (
            <div className="card state-card">Loading your dashboard...</div>
          )}

          {!dashboardLoading && dashboardError && (
            <div className="card state-card">{dashboardError}</div>
          )}

          {!dashboardLoading && !dashboardError && (
            <>
              {activeView === "dashboard" && (
                <DashboardView
                  userFirstName={userFirstName}
                  stats={stats}
                  recentResult={recentResult || emptyResult}
                  history={history}
                  goTo={goTo}
                  onViewResult={viewHistoryItem}
                />
              )}

              {activeView === "scan" && <Choose />}

              {activeView === "result" && (
                <ResultView result={displayedResult} goTo={goTo} />
              )}

              {activeView === "diseaseInfo" && (
                <DiseaseInfoView
                  diseaseName={displayedResult.disease}
                  openSection={openSection}
                  setOpenSection={setOpenSection}
                />
              )}

              {activeView === "history" && (
                <HistoryView
                  rows={filteredHistory}
                  search={historySearch}
                  setSearch={setHistorySearch}
                  filter={historyFilter}
                  setFilter={setHistoryFilter}
                  onView={viewHistoryItem}
                />
              )}

              {activeView === "reports" && (
                <ReportsView reports={reports} onAction={handleReportAction} />
              )}

              {/* =========================================
                  CONSULT FLOW — all inside the dashboard.
                  list -> details -> book, no route changes.
              ========================================= */}

              {activeView === "consult" && consultStep === "list" && (
                <DoctorList
                  onBack={() => goTo("dashboard")}
                  onSelectDoctor={(doctorId) => {
                    setSelectedDoctorId(doctorId);
                    setConsultStep("details");
                  }}
                />
              )}

              {activeView === "consult" && consultStep === "details" && (
                <DoctorDetails
                  doctorId={selectedDoctorId}
                  onBack={() => setConsultStep("list")}
                  onBook={() => setConsultStep("book")}
                />
              )}

              {activeView === "consult" && consultStep === "book" && (
                <BookAppointment
                  doctorId={selectedDoctorId}
                  assessmentId={consultAssessmentId}
                  onBack={() => setConsultStep("details")}
                  onBooked={() => {
                    setConsultStep("list");
                    goTo("appointments");
                  }}
                />
              )}

              {activeView === "appointments" && (
                <AppointmentsView
                  appointments={appointments}
                  loading={appointmentsLoading}
                  error={appointmentsError}
                  onRefresh={loadAppointments}
                  onCancel={handleCancelAppointment}
                  onGoDoctors={() => goTo("consult")}
                />
              )}

              {activeView === "notifications" && (
                <NotificationsView items={notifications} />
              )}

              {activeView === "profile" && (
                <ProfileView
                  profile={profile}
                  setProfile={setProfile}
                  savedProfile={savedProfile}
                  onSave={handleSaveProfile}
                  onChangePassword={handleChangePassword}
                />
              )}

              {activeView === "settings" && (
                <SettingsView
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                  language={language}
                  setLanguage={setLanguage}
                  notifScan={notifScan}
                  setNotifScan={setNotifScan}
                  notifFollowup={notifFollowup}
                  setNotifFollowup={setNotifFollowup}
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
  goTo,
  onViewResult,
}) {
  return (
    <section className="view active">
      <div className="welcome">
        <div>
          <h1>Hello, {userFirstName} 👋</h1>

          <p>Here's a quick look at your skin health overview.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon="📷"
          iconClass="blue"
          value={stats.totalScans}
          label="Total Scans"
        />

        <StatCard
          icon="📅"
          iconClass="teal"
          value={stats.lastScanDate}
          label="Last Scan Date"
        />

        <StatCard
          icon="✅"
          iconClass="green"
          value={stats.currentStatus}
          label="Current Status"
        />

        <StatCard
          icon="📄"
          iconClass="mint"
          value={stats.reportsAvailable}
          label="Reports Available"
        />
      </div>

      <div className="cta-scan">
        <div>
          <h3>📷 Ready for your next check-up?</h3>

          <p>
            Scan your skin in seconds and get an instant AI-powered analysis.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={() => goTo("scan")}>
          Quick Scan
        </button>
      </div>

      <div className="dash-grid">
        {/* RESULT */}

        <div className="card">
          <div className="result-preview-row">
            <div className="section-title no-margin">
              📈 Recent Scan Result
            </div>

            <span className={severityBadgeClass(recentResult.severity)}>
              {recentResult.severity}
            </span>
          </div>

          <div className="result-item">
            <span className="k">Disease</span>

            <span className="v">{recentResult.disease}</span>
          </div>

          <div className="result-item">
            <span className="k">Confidence</span>

            <span className="v">
              {Number(recentResult.confidence || 0).toFixed(0)}%
            </span>
          </div>

          <div className="result-item">
            <span className="k">Scanned on</span>

            <span className="v">{recentResult.date}</span>
          </div>

          <button
            className="btn btn-outline btn-block mt-16"
            onClick={() => onViewResult(recentResult)}
          >
            View Full Report
          </button>
        </div>

        {/* HISTORY */}

        <div className="card">
          <div className="section-title">📜 Recent History</div>

          {history.length === 0 ? (
            <p className="muted-text">No scans yet.</p>
          ) : (
            <ul className="history-mini">
              {history.slice(0, 4).map((item) => (
                <li
                  key={item.id}
                  onClick={() => onViewResult(item)}
                  className="clickable"
                >
                  <span>
                    <span
                      className={`dot ${
                        item.status === "Healthy" ? "dot-green" : "dot-amber"
                      }`}
                    ></span>

                    {item.disease}
                  </span>

                  <span className="muted-text small-text">{item.date}</span>
                </li>
              ))}
            </ul>
          )}

          <button
            className="btn btn-outline btn-block mt-14"
            onClick={() => goTo("history")}
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

function StatCard({ icon, iconClass, value, label }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconClass}`}>{icon}</div>

      <div>
        <div className="stat-value">{value}</div>

        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

/* ============================================================
   RESULT VIEW
============================================================ */

function ResultView({ result, goTo }) {
  return (
    <section className="view active">
      <div className="section-title">🤖 Scan Result</div>

      <div className="card mb">
        <div className="result-hero">
          <div className="result-photo">
            {result.image ? (
              <img src={result.image} alt="Scanned" />
            ) : (
              "No image available"
            )}
          </div>

          <div className="result-main">
            <div className="result-disease">{result.disease}</div>

            <span className={severityBadgeClass(result.severity)}>
              Severity: {result.severity}
            </span>

            <div className="confidence-label">Confidence Score</div>

            <div className="confidence-bar-track">
              <div
                className="confidence-bar-fill"
                style={{
                  width: `${result.confidence}%`,
                }}
              ></div>
            </div>

            <div className="confidence-value">
              {Number(result.confidence || 0).toFixed(0)}%
            </div>

            <div className="recommend-box">
              <b>Recommended Action:</b> {result.recommendation}
            </div>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-box">
            <div className="lbl">Short Description</div>

            <div className="val val-normal">{result.description}</div>
          </div>

          <div className="info-box">
            <div className="lbl">Is it Contagious?</div>

            <div className="val">{result.contagious}</div>
          </div>

          <div className="info-box">
            <div className="lbl">Scanned On</div>

            <div className="val">{result.date}</div>
          </div>
        </div>

        <div className="scan-actions scan-actions-start">
          <button
            className="btn btn-primary"
            onClick={() => goTo("diseaseInfo")}
          >
            📖 Learn About This Disease
          </button>

          <button className="btn btn-outline" onClick={() => goTo("reports")}>
            📄 View Report
          </button>

          <button className="btn btn-outline" onClick={() => goTo("consult")}>
            🩺 Consult Doctor
          </button>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   DISEASE INFO
============================================================ */

function DiseaseInfoView({ diseaseName, openSection, setOpenSection }) {
  return (
    <section className="view active">
      <div className="section-title">
        📖 Disease Information — {diseaseName}
      </div>

      {diseaseInfoSections.map((section) => (
        <div
          key={section.key}
          className={`accordion ${openSection === section.key ? "open" : ""}`}
        >
          <div
            className="accordion-head"
            onClick={() =>
              setOpenSection(openSection === section.key ? null : section.key)
            }
          >
            {section.label}

            <span className="chev">▾</span>
          </div>

          <div className="accordion-body">{section.text}</div>
        </div>
      ))}
    </section>
  );
}

/* ============================================================
   HISTORY
============================================================ */

function HistoryView({ rows, search, setSearch, filter, setFilter, onView }) {
  return (
    <section className="view active">
      <div className="section-title">📊 Scan History</div>

      <div className="card">
        <div className="table-toolbar">
          <div className="search-box">
            🔍
            <input
              type="text"
              placeholder="Search by disease..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>

            <option value="Healthy">Healthy</option>

            <option value="Disease Detected">Disease Detected</option>
          </select>
        </div>

        {rows.length === 0 ? (
          <p className="muted-text table-empty">No scans found.</p>
        ) : (
          <div className="table-responsive">
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
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td>

                    <td>{item.disease}</td>

                    <td>{Number(item.confidence || 0).toFixed(0)}%</td>

                    <td>{statusBadge(item.status)}</td>

                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-btn"
                          title="View Report"
                          onClick={() => onView(item)}
                        >
                          👁
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

/* ============================================================
   REPORTS
============================================================ */

function ReportsView({ reports, onAction }) {
  return (
    <section className="view active">
      <div className="section-title">📄 Medical Reports</div>

      <div className="card">
        {reports.length === 0 ? (
          <p className="muted-text">No reports available yet.</p>
        ) : (
          reports.map((report, index) => (
            <div className="report-card" key={report._id || report.id || index}>
              <div className="report-left">
                <div className="report-icon">📄</div>

                <div>
                  <div className="report-title">{report.title}</div>

                  <div className="report-sub">{report.date}</div>
                </div>
              </div>

              <div className="report-actions">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => onAction("download-pdf")}
                >
                  ⬇ Download
                </button>

                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => onAction("print-report")}
                >
                  🖨 Print
                </button>

                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => onAction("share-report")}
                >
                  🔗 Share
                </button>
              </div>
            </div>
          ))
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
  return (
    <section className="view active">
      {/* HEADER */}

      <div className="appointments-header">
        <div>
          <div className="section-title no-margin">📅 My Appointments</div>

          <p className="muted-text">
            View and manage your dermatologist consultations.
          </p>
        </div>

        <div className="appointments-header-actions">
          <button className="btn btn-outline btn-sm" onClick={onRefresh}>
            🔄 Refresh
          </button>

          <button className="btn btn-primary btn-sm" onClick={onGoDoctors}>
            + Book Consultation
          </button>
        </div>
      </div>

      {/* LOADING */}

      {loading && <div className="card state-card">Loading appointments...</div>}

      {/* ERROR */}

      {!loading && error && (
        <div className="card">
          <p>{error}</p>

          <button className="btn btn-primary mt-14" onClick={onRefresh}>
            Try Again
          </button>
        </div>
      )}

      {/* EMPTY */}

      {!loading && !error && appointments.length === 0 && (
        <div className="card state-card">
          <div className="state-card-icon">📅</div>

          <h3>No appointments yet</h3>

          <p className="muted-text">
            You have not booked a dermatologist consultation yet.
          </p>

          <button className="btn btn-primary mt-14" onClick={onGoDoctors}>
            Find a Doctor
          </button>
        </div>
      )}

      {/* APPOINTMENTS */}

      {!loading && !error && appointments.length > 0 && (
        <div className="appointments-list">
          {appointments.map((appointment) => {
            const doctor = getAppointmentDoctor(appointment);

            const status = getAppointmentStatus(appointment);

            const specialization = getAppointmentSpecialization(appointment);

            const date = appointment.date;

            const mode = appointment.mode || "video";

            const canCancel = ["pending", "accepted"].includes(
              String(status).toLowerCase(),
            );

            return (
              <div className="card" key={appointment._id}>
                {/* TOP */}

                <div className="appointment-top">
                  <div className="appointment-top-left">
                    <div className="doctor-card__avatar appointment-avatar">
                      {doctor.fullName?.charAt(0).toUpperCase() || "D"}
                    </div>

                    <div>
                      <div className="appointment-doctor-name">
                        Dr.{" "}
                        {getAppointmentDoctorName(appointment).replace(
                          /^Dr\.\s*/i,
                          "",
                        )}
                      </div>

                      <div className="appointment-doctor-spec">
                        {specialization}
                      </div>
                    </div>
                  </div>

                  <span className={appointmentStatusClass(status)}>
                    {appointmentStatusLabel(status)}
                  </span>
                </div>

                {/* DETAILS */}

                <div className="appointment-details">
                  <AppointmentDetail
                    icon="📅"
                    label="Date"
                    value={formatAppointmentDate(date)}
                  />

                  <AppointmentDetail
                    icon="⏰"
                    label="Time"
                    value={`${appointment.startTime || ""} - ${
                      appointment.endTime || ""
                    }`}
                  />

                  <AppointmentDetail
                    icon={MODE_ICONS[mode] || "💬"}
                    label="Consultation"
                    value={MODE_LABELS[mode] || mode}
                  />

                  <AppointmentDetail
                    icon="💰"
                    label="Status"
                    value={appointmentStatusLabel(status)}
                  />
                </div>

                {/* REPORT */}

                {appointment.assessment && (
                  <div className="appointment-linked-report">
                    <div className="appointment-linked-report-title">
                      📄 Linked Skin Report
                    </div>

                    <div className="muted-text small-text">
                      {appointment.assessment?.prediction?.disease ||
                        "Skin assessment"}

                      {" · "}

                      {appointment.assessment?.prediction?.severity ||
                        "Not available"}
                    </div>
                  </div>
                )}

                {/* ACTIONS */}

                <div className="appointment-actions">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => alert(`Appointment ID: ${appointment._id}`)}
                  >
                    View Details
                  </button>

                  {canCancel && (
                    <button
                      className="btn btn-outline btn-sm btn-danger-outline"
                      onClick={() => onCancel(appointment)}
                    >
                      Cancel Appointment
                    </button>
                  )}

                  {String(status).toLowerCase() === "accepted" &&
                    mode === "video" && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          alert("Video consultation will open here.")
                        }
                      >
                        🎥 Join Video Call
                      </button>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ============================================================
   APPOINTMENT DETAIL
============================================================ */

function AppointmentDetail({ icon, label, value }) {
  return (
    <div>
      <div className="appointment-detail-label">
        {icon} {label}
      </div>

      <strong className="appointment-detail-value">{value}</strong>
    </div>
  );
}

/* ============================================================
   NOTIFICATIONS
============================================================ */

function NotificationsView({ items }) {
  return (
    <section className="view active">
      <div className="section-title">🔔 Notifications</div>

      <div className="card">
        {items.length === 0 ? (
          <p className="muted-text">You're all caught up.</p>
        ) : (
          items.map((item, index) => (
            <div
              className={`notif-item ${item.unread ? "unread" : ""}`}
              key={item._id || item.id || index}
            >
              <div className="notif-icon">{item.icon || "🔔"}</div>

              <div>
                <div className="notif-title">{item.title}</div>

                <div className="notif-time">{item.time}</div>
              </div>
            </div>
          ))
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
  function update(field, value) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <section className="view active">
      <div className="section-title">👤 Profile</div>

      <div className="card">
        <div className="profile-head">
          <div className="profile-avatar">
            {(savedProfile.name || "U").charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="profile-name">
              {savedProfile.name || "Not available"}
            </div>

            <div className="profile-email">
              {savedProfile.email || "Not available"}
            </div>
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label>Full Name</label>

            <input
              type="text"
              value={profile.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          <div className="field">
            <label>Age</label>

            <input
              type="number"
              value={profile.age}
              onChange={(e) => update("age", e.target.value)}
            />
          </div>

          <div className="field">
            <label>Gender</label>

            <select
              value={profile.gender}
              onChange={(e) => update("gender", e.target.value)}
            >
              <option value="">Select</option>

              <option>Male</option>

              <option>Female</option>

              <option>Other</option>
            </select>
          </div>

          <div className="field">
            <label>Email</label>

            <input
              type="email"
              value={profile.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>

          <div className="field">
            <label>Phone</label>

            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn btn-primary" onClick={onSave}>
            Save Changes
          </button>

          <button className="btn btn-outline" onClick={onChangePassword}>
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
      <div className="section-title">⚙ Settings</div>

      <div className="card">
        <div className="settings-row">
          <div>
            <div className="settings-label">Dark Mode</div>

            <div className="settings-sub">
              Switch between light and dark theme
            </div>
          </div>

          <div
            className={`toggle ${darkMode ? "on" : ""}`}
            onClick={() => setDarkMode((value) => !value)}
          >
            <div className="knob"></div>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-label">Language</div>

            <div className="settings-sub">Choose your preferred language</div>
          </div>

          <select
            className="filter-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option>English</option>

            <option>हिन्दी</option>
          </select>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-label">Scan Completed Alerts</div>

            <div className="settings-sub">
              Get notified when a scan result is ready
            </div>
          </div>

          <div
            className={`toggle ${notifScan ? "on" : ""}`}
            onClick={() => setNotifScan((value) => !value)}
          >
            <div className="knob"></div>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-label">Follow-up Reminders</div>

            <div className="settings-sub">
              Reminders for recommended doctor visits
            </div>
          </div>

          <div
            className={`toggle ${notifFollowup ? "on" : ""}`}
            onClick={() => setNotifFollowup((value) => !value)}
          >
            <div className="knob"></div>
          </div>
        </div>
      </div>
    </section>
  );
}