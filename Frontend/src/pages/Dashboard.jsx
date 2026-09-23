import React, { useState, useRef, useEffect } from "react";
import "../components/styles/dashboard.css";
import { useAuth } from "../components/context/AuthContext";
import { useLocation } from "react-router-dom";

import api from "../api/axios";

// Adjust this import to wherever ScanPage.jsx actually lives in your project
import ScanPage from "./ScanPage";
import Choose from "../pages/Choose";

/* ======================================================================
   DERMA DETECT AI — Patient Dashboard (React)
   Now wired to the backend. Wherever a specific endpoint name/shape needs
   confirming, look for comment blocks tagged:  BACKEND HOOK
   ====================================================================== */

const TITLE_MAP = {
  dashboard: "Dashboard",
  scan: "New Skin Scan",
  result: "Scan Result",
  diseaseInfo: "Disease Information",
  history: "Scan History",
  reports: "Medical Reports",
  consult: "Consult a Dermatologist", // NEW
  notifications: "Notifications",
  profile: "Profile",
  settings: "Settings",
};

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
    text: "Use fragrance-free moisturizers daily, take lukewarm (not hot) showers, avoid scratching.",
  },
  {
    key: "treatment",
    label: "Treatment Options",
    text: "Topical creams, light therapy, and in moderate-to-severe cases, oral or injectable medication prescribed by a dermatologist.",
  },
  {
    key: "whentosee",
    label: "When to see a doctor",
    text: "If patches spread quickly, become painful, show signs of infection, or affect daily life — book a dermatologist visit.",
  },
];

const emptyResult = {
  disease: "No scans yet",
  confidence: 0,
  severity: "Low",
  description: "Run your first scan to see a personalized result here.",
  contagious: "Not available",
  recommendation: "Run your first scan to get a recommendation.",
  date: "—",
};

// ---------- NEW: mock doctor data for the Consult view ----------
// BACKEND HOOK: replace with GET /api/doctors (filtered by city/availability)
const mockDoctors = [
  {
    id: "ananya-sharma",
    initials: "AS",
    name: "Dr. Ananya Sharma",
    role: "Dermatologist · MD, 8 yrs experience",
    rating: "4.8",
    distanceKm: 2.4,
    status: "available",
    nextSlot: null,
    fee: 499,
    modes: ["video", "chat", "in-person"],
    slotGroups: [
      {
        label: "Today",
        slots: [
          { time: "4:30 PM", full: false },
          { time: "5:00 PM", full: false },
          { time: "5:30 PM", full: true },
          { time: "6:00 PM", full: false },
        ],
      },
      {
        label: "Tomorrow",
        slots: [
          { time: "10:00 AM", full: false },
          { time: "10:30 AM", full: false },
        ],
      },
    ],
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
    fee: 399,
    modes: ["video", "chat"],
    slotGroups: [
      {
        label: "Today",
        slots: [
          { time: "6:00 PM", full: false },
          { time: "6:30 PM", full: false },
        ],
      },
    ],
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
    fee: 699,
    modes: ["in-person"],
    slotGroups: [
      {
        label: "Tomorrow",
        slots: [
          { time: "11:00 AM", full: false },
          { time: "11:30 AM", full: false },
        ],
      },
    ],
  },
];

const MODE_LABELS = { video: "Video call", chat: "Text chat", "in-person": "In-person" };
const MODE_ICONS = { video: "🎥", chat: "💬", "in-person": "🏥" };

function severityBadgeClass(severity) {
  if (severity === "Low") return "badge badge-success";
  if (severity === "High") return "badge badge-danger";
  return "badge badge-warn";
}

function statusBadge(status) {
  return status === "Healthy" ? (
    <span className="badge badge-success">Healthy</span>
  ) : (
    <span className="badge badge-warn">Disease Detected</span>
  );
}

function formatDate(rawDate) {
  if (!rawDate) return "Not available";
  const d = new Date(rawDate);
  if (Number.isNaN(d.getTime())) return "Not available";
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

// Shared mapping from a raw assessment (as returned by /assessment/*)
// into the shape the dashboard views render.
function mapAssessmentToResult(assessment) {
  if (!assessment) return null;

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
      "No description available for this result.",
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

export default function DermaDetectAI() {
  const routerLocation = useLocation();
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
   const {  logout } = useAuth();

  // Lets other pages (e.g. SkinAnalysisResult) deep-link into a view:
  // navigate("/dashboard", { state: { view: "consult", assessmentId } })
  const [consultAssessmentId, setConsultAssessmentId] = useState(null);
  useEffect(() => {
    const requestedView = routerLocation.state?.view;
    if (requestedView) {
      if (routerLocation.state?.assessmentId) {
        setConsultAssessmentId(routerLocation.state.assessmentId);
      }
      goTo(requestedView);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routerLocation.state]);

  /* -------- Dark mode (functional) -------- */
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    );
  });

  useEffect(() => {
    /* ============ BACKEND HOOK: PERSIST THEME PREFERENCE ============
       Optionally save the user's theme choice, e.g.
       api.patch('/settings', { darkMode })
       or localStorage.setItem('theme', darkMode ? 'dark' : 'light')
    */
  }, [darkMode]);

  /* -------- Settings toggles -------- */
  const [notifScan, setNotifScan] = useState(true);
  const [notifFollowup, setNotifFollowup] = useState(true);
  const [language, setLanguage] = useState("English");

  /* -------- Real data from the backend -------- */
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalScans: 0,
    lastScanDate: "Not available",
    currentStatus: "Not available",
    reportsAvailable: 0,
  });
  const [history, setHistory] = useState([]); // mapped result objects, most recent first
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  /* -------- Profile form -------- */
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    gender: "",
    email: "",
    phone: "",
  });
  const [savedProfile, setSavedProfile] = useState(profile);

  /* -------- History search / filter -------- */
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState("all");

  /* -------- Disease info accordion -------- */
  const [openSection, setOpenSection] = useState("what");

  /* -------- Which result is shown on the "result" view --------
     Defaults to the most recent scan; clicking a specific history row
     shows that one instead. */
  const [selectedResult, setSelectedResult] = useState(null);

  function goTo(view) {
    setActiveView(view);
    setSidebarOpen(false);
  }

  /* ============================================================
     BACKEND HOOK: INITIAL DASHBOARD DATA LOAD
     Adjust these endpoint paths / response shapes to match your API.
     Expected shapes:
       GET /user/profile        -> { user: { fullName, age, gender, email, phone } }
       GET /assessment/history  -> { history: [ assessmentObj, ... ] }   (same shape as
                                     the assessment object used on the result page:
                                     prediction{ disease, confidence, severity },
                                     image, createdAt/updatedAt, explanation, etc.)
       GET /reports             -> { reports: [ { title, date }, ... ] }
       GET /notifications       -> { notifications: [ { title, time, unread, icon }, ... ] }
     ============================================================ */
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setDashboardLoading(true);
        setDashboardError("");

        const [userRes, historyRes, reportsRes, notificationsRes] =
          await Promise.all([
            api.get("/api/user/profile"),
            api.get("/api/assessment/history"),
            api.get("/api/reports"),
            api.get("/api/notifications"),
          ]);

        const fetchedUser = userRes.data?.user || null;
        setUser(fetchedUser);

        if (fetchedUser) {
          const initialProfile = {
            name: fetchedUser.fullName || "",
            age: fetchedUser.age ?? "",
            gender: fetchedUser.gender || "",
            email: fetchedUser.email || "",
            phone: fetchedUser.phone || "",
          };
          setProfile(initialProfile);
          setSavedProfile(initialProfile);
        }

        const rawHistory = historyRes.data?.history || [];
        // newest first, in case the API doesn't already sort them
        const sortedRaw = [...rawHistory].sort((a, b) => {
          const aDate = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const bDate = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return bDate - aDate;
        });
        const mappedHistory = sortedRaw.map(mapAssessmentToResult);
        setHistory(mappedHistory);

        const fetchedReports = reportsRes.data?.reports || [];
        setReports(fetchedReports);

        const fetchedNotifications = notificationsRes.data?.notifications || [];
        setNotifications(fetchedNotifications);

        setStats({
          totalScans: mappedHistory.length,
          lastScanDate: mappedHistory[0]?.date || "Not available",
          currentStatus: mappedHistory[0]?.status || "Not available",
          reportsAvailable: fetchedReports.length,
        });
      } catch (err) {
        console.error(
          "Dashboard data fetch failed:",
          err.response?.data || err.message,
        );
        setDashboardError(
          err.response?.data?.message || "Unable to load your dashboard data",
        );
      } finally {
        setDashboardLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const recentResult = history[0] || null;
  const displayedResult = selectedResult || recentResult || emptyResult;
  const handleLogout = async () => {
    try {
      const response = await logout();
      console.log("Logout response:", response);

      toast.success(response.message);

      navigate("/login");
    } catch (err) {
      console.error("Logout Error:", err);
      console.error("Response:", err.response);
      toast.error("Logout failed");
    }
  };

  async function handleSaveProfile() {
    /* ============ BACKEND HOOK: SAVE PROFILE ============ */
    try {
      await api.put("/user/profile", profile);
      setSavedProfile(profile);
    } catch (err) {
      console.error("Profile save failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Could not save profile changes.");
    }
  }

  function handleChangePassword() {
    /* ============ BACKEND HOOK: CHANGE PASSWORD ============
       Open a modal / route that calls something like
       api.post('/user/change-password', { ... })
    */
    alert(
      "Backend not connected yet: this should open the change-password flow.",
    );
  }

  function handleReportAction(action, item) {
    if (action === "download-pdf") {
      /* ============ BACKEND HOOK: DOWNLOAD PDF ============
         window.location = `/api/reports/${item.date}/download`;
      */
      alert("Backend not connected yet: this should download the PDF report.");
    }
    if (action === "print-report") {
      alert(
        "Backend not connected yet: this should open the print dialog for the report.",
      );
    }
    if (action === "share-report") {
      alert("Backend not connected yet: this should share the report link.");
    }
  }

  function viewHistoryItem(item) {
    setSelectedResult(item);
    goTo("result");
  }

  const filteredHistory = history.filter((h) => {
    const matchesSearch = (h.disease || "")
      .toLowerCase()
      .includes(historySearch.toLowerCase());
    const matchesFilter = historyFilter === "all" || h.status === historyFilter;
    return matchesSearch && matchesFilter;
  });

  const userFirstName = (user?.fullName || "there").split(" ")[0];
  const avatarInitial = (user?.fullName || "U").charAt(0).toUpperCase();

  return (
    <div className="dtc-app" data-theme={darkMode ? "dark" : "light"}>
      {/* ================= SIDEBAR ================= */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <span className="logo-dot"></span> Derma Detect AI
        </div>
        <ul className="nav-list">
          {[
            ["dashboard", "🏠", "Dashboard"],
            ["scan", "📷", "New Scan"],
            ["history", "📊", "Scan History"],
            ["reports", "📄", "Reports"],
            ["consult", "🩺", "Consult Doctor"], // NEW sidebar option
            ["notifications", "🔔", "Notifications"],
            ["profile", "👤", "Profile"],
            ["settings", "⚙️", "Settings"],
          ].map(([key, icon, label]) => (
            <li
              key={key}
              className={`nav-item ${activeView === key ? "active" : ""}`}
              onClick={() => goTo(key)}
            >
              <span className="nav-icon">{icon}</span> {label}
            </li>
          ))}
        </ul>
        <div className="sidebar-footer">
          <div className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </div>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="main">
        <div className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="menu-btn"
              onClick={() => setSidebarOpen((s) => !s)}
            >
              ☰
            </button>
            <div className="topbar-title">{TITLE_MAP[activeView]}</div>
          </div>
          <div className="topbar-right">
            <div className="bell" onClick={() => goTo("notifications")}>
              <span className="dot"></span>🔔
            </div>
            <div className="avatar-chip" onClick={() => goTo("profile")}>
              <div className="avatar-circle">{avatarInitial}</div>
            </div>
          </div>
        </div>

        <div className="content">
          {dashboardLoading && (
            <div className="card" style={{ textAlign: "center", padding: 40 }}>
              Loading your dashboard...
            </div>
          )}

          {!dashboardLoading && dashboardError && (
            <div className="card" style={{ textAlign: "center", padding: 40 }}>
              {dashboardError}
            </div>
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

              {/* Sidebar/topbar stay in place; only the content area swaps to
                  your standalone ScanPage (with its own camera flow). */}
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

              {/* NEW: Consult a Dermatologist */}
              {activeView === "consult" && (
                <ConsultView assessmentId={consultAssessmentId} />
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

/* ======================================================================
   SUB-VIEWS
   ====================================================================== */

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
        <div className="card">
          <div className="result-preview-row">
            <div className="section-title" style={{ marginBottom: 0 }}>
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
            <span className="v">{recentResult.confidence.toFixed(0)}%</span>
          </div>
          <div className="result-item">
            <span className="k">Scanned on</span>
            <span className="v">{recentResult.date}</span>
          </div>
          <button
            className="btn btn-outline"
            style={{ marginTop: 16 }}
            onClick={() => onViewResult(recentResult)}
          >
            View Full Report
          </button>
        </div>

        <div className="card">
          <div className="section-title">📜 Recent History</div>
          {history.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: 13.5 }}>
              No scans yet — your history will show up here.
            </p>
          ) : (
            <ul className="history-mini">
              {history.slice(0, 4).map((item) => (
                <li
                  key={item.id}
                  onClick={() => onViewResult(item)}
                  style={{ cursor: "pointer" }}
                >
                  <span>
                    <span
                      className={`dot ${item.status === "Healthy" ? "dot-green" : "dot-amber"}`}
                    ></span>
                    {item.disease}
                  </span>
                  <span
                    style={{ color: "var(--text-secondary)", fontSize: 12.5 }}
                  >
                    {item.date}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <button
            className="btn btn-outline"
            style={{ marginTop: 14, width: "100%" }}
            onClick={() => goTo("history")}
          >
            View All History
          </button>
        </div>
      </div>
    </section>
  );
}

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
            <div
              style={{
                marginTop: 14,
                fontSize: 13,
                color: "var(--text-secondary)",
              }}
            >
              Confidence Score
            </div>
            <div className="confidence-bar-track">
              <div
                className="confidence-bar-fill"
                style={{ width: `${result.confidence}%` }}
              ></div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              {result.confidence.toFixed(0)}%
            </div>

            <div className="recommend-box">
              <b>Recommended Action:</b> {result.recommendation}
            </div>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-box">
            <div className="lbl">Short Description</div>
            <div className="val" style={{ fontWeight: 500 }}>
              {result.description}
            </div>
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

        <div
          className="scan-actions"
          style={{ justifyContent: "flex-start", marginTop: 22 }}
        >
          <button
            className="btn btn-primary"
            onClick={() => goTo("diseaseInfo")}
          >
            📖 Learn About This Disease
          </button>
          <button className="btn btn-outline" onClick={() => goTo("reports")}>
            📄 View / Download Report
          </button>
          {/* NEW: quick path from a result straight into booking */}
          <button className="btn btn-outline" onClick={() => goTo("consult")}>
            🩺 Consult a Dermatologist
          </button>
        </div>
      </div>
    </section>
  );
}

function DiseaseInfoView({ diseaseName, openSection, setOpenSection }) {
  return (
    <section className="view active">
      <div className="section-title">
        📖 Disease Information — {diseaseName}
      </div>
      <div>
        {diseaseInfoSections.map((sec) => (
          <div
            key={sec.key}
            className={`accordion ${openSection === sec.key ? "open" : ""}`}
          >
            <div
              className="accordion-head"
              onClick={() =>
                setOpenSection(openSection === sec.key ? null : sec.key)
              }
            >
              {sec.label} <span className="chev">▾</span>
            </div>
            <div className="accordion-body">{sec.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HistoryView({ rows, search, setSearch, filter, setFilter, onView }) {
  return (
    <section className="view active">
      <div className="section-title">📊 Scan History</div>
      <div className="card">
        <div className="table-toolbar">
          <div className="search-box">
            🔍{" "}
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
          <p style={{ color: "var(--text-secondary)", padding: "16px 4px" }}>
            No scans match this search/filter yet.
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
              {rows.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td>{item.disease}</td>
                  <td>{item.confidence.toFixed(0)}%</td>
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
                      <button
                        className="icon-btn"
                        title="Download PDF"
                        onClick={() =>
                          alert(
                            "Backend not connected yet: this should download the PDF report.",
                          )
                        }
                      >
                        ⬇
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function ReportsView({ reports, onAction }) {
  return (
    <section className="view active">
      <div className="section-title">📄 Medical Reports</div>
      <div className="card">
        {reports.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>
            No reports available yet.
          </p>
        ) : (
          reports.map((r, i) => (
            <div className="report-card" key={r.id || i}>
              <div className="report-left">
                <div className="report-icon">📄</div>
                <div>
                  <div className="report-title">{r.title}</div>
                  <div className="report-sub">{r.date}</div>
                </div>
              </div>
              <div className="report-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => onAction("download-pdf", r)}
                >
                  ⬇ Download
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => onAction("print-report", r)}
                >
                  🖨 Print
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => onAction("share-report", r)}
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

/* ======================================================================
   NEW: CONSULT A DERMATOLOGIST — sidebar-driven, 3-step flow
   Step 1: doctor list + filters
   Step 2: doctor profile — pick mode + slot
   Step 3: confirmation
   BACKEND HOOK: swap mockDoctors for GET /api/doctors, and the "confirm"
   step for POST /api/appointments (see comments below).
   ====================================================================== */
function ConsultView({ assessmentId }) {
  const [step, setStep] = useState("list"); // "list" | "profile" | "confirmation"
  const [activeFilter, setActiveFilter] = useState("Nearby");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState(false);

  function openDoctor(doctor) {
    setSelectedDoctor(doctor);
    setSelectedMode(doctor.modes[0]);
    setSelectedSlot(null);
    setStep("profile");
  }

  async function bookAppointment() {
    if (!selectedSlot) return;
    setBooking(true);
    try {
      /* ============ BACKEND HOOK: BOOK APPOINTMENT ============
         await api.post("/api/appointments", {
           doctorId: selectedDoctor.id,
           type: selectedMode,
           slot: selectedSlot,
           assessmentId, // links the consult to the assessment that started it
         });
      */
      await new Promise((r) => setTimeout(r, 600)); // mock latency
      setStep("confirmation");
    } catch (err) {
      alert(
        err.response?.data?.message || "Could not book the appointment.",
      );
    } finally {
      setBooking(false);
    }
  }

  const visibleDoctors =
    activeFilter === "Available now"
      ? mockDoctors.filter((d) => d.status === "available")
      : activeFilter === "Nearby"
      ? [...mockDoctors].sort((a, b) => a.distanceKm - b.distanceKm)
      : mockDoctors;

  if (step === "profile" && selectedDoctor) {
    return (
      <ConsultProfileStep
        doctor={selectedDoctor}
        selectedMode={selectedMode}
        setSelectedMode={setSelectedMode}
        selectedSlot={selectedSlot}
        setSelectedSlot={setSelectedSlot}
        onBack={() => setStep("list")}
        onBook={bookAppointment}
        booking={booking}
        assessmentId={assessmentId}
      />
    );
  }

  if (step === "confirmation" && selectedDoctor) {
    return (
      <ConsultConfirmationStep
        doctor={selectedDoctor}
        mode={selectedMode}
        slot={selectedSlot}
        onDone={() => {
          setStep("list");
          setSelectedDoctor(null);
        }}
      />
    );
  }

  return (
    <section className="view active">
      <div className="section-title">🩺 Find a Dermatologist</div>
      <p style={{ color: "var(--text-secondary)", marginTop: -6, marginBottom: 16 }}>
        Based on your latest skin assessment, here are specialists you can consult.
      </p>

      <div className="location-row">
        📍 Lucknow, Uttar Pradesh
        <a href="#" style={{ marginLeft: "auto", color: "var(--color-primary)", fontWeight: 500 }}>
          Change
        </a>
      </div>

      <div className="filters">
        {["Nearby", "Available now", "All doctors"].map((f) => (
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
        <div className="doctor-card" key={d.id} onClick={() => openDoctor(d)}>
          <div className="doctor-card__avatar">{d.initials}</div>
          <div className="doctor-card__body">
            <div className="doctor-card__name">{d.name}</div>
            <div className="doctor-card__role">{d.role}</div>
            <div className="doctor-card__meta">
              <span>⭐ {d.rating}</span>
              <span>📍 {d.distanceKm} km away</span>
            </div>
            {d.status === "available" ? (
              <span className="status-dot">Available now</span>
            ) : (
              <span className="status-dot" style={{ color: "var(--text-secondary)" }}>
                Next slot: {d.nextSlot}
              </span>
            )}
            <div className="mode-row">
              {d.modes.map((m) => (
                <span className="mode-tag" key={m}>{MODE_LABELS[m]}</span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

function ConsultProfileStep({
  doctor,
  selectedMode,
  setSelectedMode,
  selectedSlot,
  setSelectedSlot,
  onBack,
  onBook,
  booking,
  assessmentId,
}) {
  return (
    <section className="view active">
      <button className="btn btn-outline" style={{ marginBottom: 16 }} onClick={onBack}>
        ← All doctors
      </button>

      <div className="card" style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <div
          className="doctor-card__avatar"
          style={{ width: 64, height: 64, fontSize: "1.2rem" }}
        >
          {doctor.initials}
        </div>
        <div>
          <div className="doctor-card__name" style={{ fontSize: "1.1rem" }}>
            {doctor.name}
          </div>
          <div className="doctor-card__role">{doctor.role}</div>
          <div className="doctor-card__meta">
            <span>⭐ {doctor.rating}</span>
            <span>📍 {doctor.distanceKm} km away</span>
          </div>
        </div>
      </div>

      <div className="section-title" style={{ fontSize: "1rem" }}>
        Choose consultation type
      </div>
      <div className="mode-select">
        {doctor.modes.map((m) => (
          <div
            key={m}
            className={`mode-option${selectedMode === m ? " is-selected" : ""}`}
            onClick={() => setSelectedMode(m)}
          >
            <span className="mode-option__icon">{MODE_ICONS[m]}</span>
            {MODE_LABELS[m]}
          </div>
        ))}
      </div>

      {doctor.slotGroups.map((group) => (
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

      <div className="card" style={{ background: "var(--bg-section)", margin: "16px 0 20px" }}>
        <div className="result-item">
          <span className="k">Consultation fee</span>
          <span className="v">₹{doctor.fee}</span>
        </div>
        <div className="result-item">
          <span className="k">Report shared with doctor</span>
          <span className="v">
            {assessmentId ? `Assessment #${assessmentId}` : "Latest skin assessment"}
          </span>
        </div>
      </div>

      <button
        className="btn btn-primary"
        style={{ width: "100%" }}
        disabled={!selectedSlot || booking}
        onClick={onBook}
      >
        {booking
          ? "Booking..."
          : selectedSlot
          ? `Book appointment — ${selectedSlot}`
          : "Select a slot to continue"}
      </button>
    </section>
  );
}

function ConsultConfirmationStep({ doctor, mode, slot, onDone }) {
  return (
    <section className="view active">
      <div className="card" style={{ textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--color-success)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.6rem",
            margin: "0 auto 16px",
          }}
        >
          ✓
        </div>
        <h3 style={{ marginBottom: 4 }}>Appointment booked</h3>
        <p style={{ color: "var(--text-secondary)", marginTop: 0 }}>
          A confirmation has been sent to your email.
        </p>

        <div style={{ textAlign: "left", margin: "16px 0" }}>
          <div className="result-item">
            <span className="k">Doctor</span>
            <span className="v">{doctor.name}</span>
          </div>
          <div className="result-item">
            <span className="k">Type</span>
            <span className="v">{MODE_LABELS[mode]}</span>
          </div>
          <div className="result-item">
            <span className="k">Date &amp; time</span>
            <span className="v">{slot}</span>
          </div>
          <div className="result-item">
            <span className="k">Fee</span>
            <span className="v">₹{doctor.fee}</span>
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: "100%" }} onClick={onDone}>
          Back to doctors
        </button>
      </div>
    </section>
  );
}

function NotificationsView({ items }) {
  return (
    <section className="view active">
      <div className="section-title">🔔 Notifications</div>
      <div className="card">
        {items.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>
            You're all caught up — no notifications.
          </p>
        ) : (
          items.map((n, i) => (
            <div
              className={`notif-item ${n.unread ? "unread" : ""}`}
              key={n.id || i}
            >
              <div
                className="notif-icon"
                style={{ background: "var(--bg-main)" }}
              >
                {n.icon || "🔔"}
              </div>
              <div>
                <div className="notif-title">{n.title}</div>
                <div className="notif-time">{n.time}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function ProfileView({
  profile,
  setProfile,
  savedProfile,
  onSave,
  onChangePassword,
}) {
  function update(field, value) {
    setProfile((p) => ({ ...p, [field]: value }));
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
        <div
          style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}
        >
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
            onClick={() => setDarkMode((d) => !d)}
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
            onClick={() => setNotifScan((v) => !v)}
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
            onClick={() => setNotifFollowup((v) => !v)}
          >
            <div className="knob"></div>
          </div>
        </div>
      </div>
    </section>
  );
}