// import React, { useState, useRef, useEffect } from "react";
// import "../components/styles/dashboard.css";

// /* ======================================================================
//    DERMA DETECT AI — Patient Dashboard (React)
//    Frontend-only. Wherever backend/API needs to be connected, look for
//    comment blocks tagged:  BACKEND HOOK
//    Everything currently runs on MOCK DATA (see mock* constants below) so
//    the UI can be previewed immediately.
//    ====================================================================== */

// const TITLE_MAP = {
//   dashboard: "Dashboard",
//   scan: "New Skin Scan",
//   result: "Scan Result",
//   diseaseInfo: "Disease Information",
//   history: "Scan History",
//   reports: "Medical Reports",
//   notifications: "Notifications",
//   profile: "Profile",
//   settings: "Settings",
// };

// /* ---------- MOCK DATA (replace with API responses) ---------- */
// const mockUser = {
//   name: "Nikit Sharma",
//   initial: "N",
//   email: "nikit@example.com",
// };

// const mockStats = {
//   totalScans: 12,
//   lastScanDate: "02 Aug 2026",
//   currentStatus: "Healthy",
//   reportsAvailable: 12,
// };

// const mockHistory = [
//   { date: "02 Aug 2026", disease: "Acne", confidence: "97%", status: "Disease Detected" },
//   { date: "30 Jul 2026", disease: "Healthy", confidence: "99%", status: "Healthy" },
//   { date: "18 Jul 2026", disease: "Ringworm", confidence: "91%", status: "Disease Detected" },
//   { date: "05 Jul 2026", disease: "Healthy", confidence: "98%", status: "Healthy" },
// ];

// const mockReports = [
//   { title: "Scan Report — Acne", date: "02 Aug 2026" },
//   { title: "Scan Report — Healthy Skin", date: "30 Jul 2026" },
//   { title: "Scan Report — Ringworm", date: "18 Jul 2026" },
// ];

// const mockNotifications = [
//   { icon: "✅", title: "Scan completed — result is ready", time: "2 hours ago", unread: true },
//   { icon: "📄", title: "New report available for download", time: "2 hours ago", unread: true },
//   { icon: "⏰", title: "Follow-up reminder: dermatologist visit in 3 days", time: "1 day ago", unread: false },
// ];

// const diseaseInfoSections = [
//   { key: "what", label: "What is this disease?", text: "Psoriasis is a chronic skin condition where skin cells build up faster than normal, forming scaly, itchy patches." },
//   { key: "symptoms", label: "Symptoms", text: "Red patches with silvery scales, dry cracked skin that may bleed, itching or burning, thickened nails." },
//   { key: "causes", label: "Causes", text: "Believed to be linked to an overactive immune system; triggers include stress, infections, and skin injury." },
//   { key: "prevention", label: "Prevention", text: "Manage stress, avoid known triggers, keep skin moisturized, avoid smoking and excess alcohol." },
//   { key: "homecare", label: "Home Care Tips", text: "Use fragrance-free moisturizers daily, take lukewarm (not hot) showers, avoid scratching." },
//   { key: "treatment", label: "Treatment Options", text: "Topical creams, light therapy, and in moderate-to-severe cases, oral or injectable medication prescribed by a dermatologist." },
//   { key: "whentosee", label: "When to see a doctor", text: "If patches spread quickly, become painful, show signs of infection, or affect daily life — book a dermatologist visit." },
// ];

// const defaultResult = {
//   disease: "Psoriasis",
//   confidence: 96,
//   severity: "Medium",
//   description: "A chronic autoimmune condition causing rapid buildup of skin cells.",
//   contagious: "No",
//   recommendation: "Consult a dermatologist within a week. Avoid scratching the affected area and keep skin moisturized.",
//   date: "02 Aug 2026, 10:42 AM",
// };

// function severityBadgeClass(severity) {
//   if (severity === "Low") return "badge badge-success";
//   if (severity === "High") return "badge badge-danger";
//   return "badge badge-warn";
// }

// function statusBadge(status) {
//   return status === "Healthy" ? (
//     <span className="badge badge-success">Healthy</span>
//   ) : (
//     <span className="badge badge-warn">Disease Detected</span>
//   );
// }

// export default function DermaDetectAI() {
//   const [activeView, setActiveView] = useState("dashboard");
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   /* -------- Dark mode (functional) -------- */
//   const [darkMode, setDarkMode] = useState(() => {
//     if (typeof window === "undefined") return false;
//     return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
//   });

//   useEffect(() => {
//     /* ============ BACKEND HOOK: PERSIST THEME PREFERENCE ============
//        Optionally save the user's theme choice, e.g.
//        fetch('/api/settings', { method:'PATCH', body: JSON.stringify({ darkMode }) })
//        or localStorage.setItem('theme', darkMode ? 'dark' : 'light')
//     */
//   }, [darkMode]);

//   /* -------- Settings toggles -------- */
//   const [notifScan, setNotifScan] = useState(true);
//   const [notifFollowup, setNotifFollowup] = useState(true);
//   const [language, setLanguage] = useState("English");

//   /* -------- Profile form -------- */
//   const [profile, setProfile] = useState({
//     name: mockUser.name,
//     age: "24",
//     gender: "Male",
//     email: mockUser.email,
//     phone: "+91 90000 00000",
//   });
//   const [savedProfile, setSavedProfile] = useState(profile);

//   /* -------- History search / filter -------- */
//   const [historySearch, setHistorySearch] = useState("");
//   const [historyFilter, setHistoryFilter] = useState("all");

//   /* -------- Disease info accordion -------- */
//   const [openSection, setOpenSection] = useState("what");

//   /* -------- Camera / scan flow -------- */
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const streamRef = useRef(null);

//   const [cameraActive, setCameraActive] = useState(false);
//   const [capturedImage, setCapturedImage] = useState(null);
//   const [scanning, setScanning] = useState(false);
//   const [scanResult, setScanResult] = useState(defaultResult);
//   const [dashboardResult, setDashboardResult] = useState(defaultResult);

//   function goTo(view) {
//     setActiveView(view);
//     setSidebarOpen(false);
//   }

//   async function openCamera() {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "environment" },
//       });
//       streamRef.current = stream;
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//       }
//       setCameraActive(true);
//       setCapturedImage(null);
//     } catch (err) {
//       alert("Could not access camera. Please allow camera permission and try again.");
//     }
//   }

//   function captureFrame() {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     if (!video || !canvas) return;
//     const w = video.videoWidth;
//     const h = video.videoHeight;
//     canvas.width = w;
//     canvas.height = h;
//     canvas.getContext("2d").drawImage(video, 0, 0, w, h);
//     const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
//     setCapturedImage(dataUrl);

//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((t) => t.stop());
//       streamRef.current = null;
//     }
//     setCameraActive(false);
//   }

//   function resetScanFlow() {
//     setCameraActive(false);
//     setCapturedImage(null);
//   }

//   async function scanNow() {
//     setScanning(true);

//     /* ================================================================
//        BACKEND HOOK: RUN SKIN SCAN / ML PREDICTION
//        Send `capturedImage` (base64 JPEG string) to your backend/ML API.

//        const res = await fetch('/api/scan', {
//          method: 'POST',
//          headers: { 'Content-Type': 'application/json' },
//          body: JSON.stringify({ image: capturedImage }),
//        });
//        const result = await res.json();
//        // expected shape:
//        // { disease, confidence, severity, description, contagious, recommendation, date }
//        setScanResult(result);
//        setDashboardResult(result);

//        Replace the setTimeout mock below with the real call above.
//        ================================================================ */
//     setTimeout(() => {
//       const mockResult = { ...defaultResult, date: new Date().toLocaleString() };
//       setScanResult(mockResult);
//       setDashboardResult(mockResult);
//       setScanning(false);
//       goTo("result");
//       resetScanFlow();
//     }, 1800);
//   }

//   /* ============ BACKEND HOOK: DISEASE INFO LOOKUP ============
//      The accordion content in diseaseInfoSections is hardcoded for the demo.
//      Ideally fetch disease-specific info keyed by scanResult.disease, e.g.
//      fetch(`/api/disease-info/${encodeURIComponent(scanResult.disease)}`)
//      when the "diseaseInfo" view opens, and store it in state instead.
//   */

//   function handleLogout() {
//     /* ============ BACKEND HOOK: LOGOUT ============
//        fetch('/api/auth/logout', { method: 'POST' }).then(() => { window.location = '/login'; });
//     */
//     alert("Backend not connected yet: this button should log the user out.");
//   }

//   function handleSaveProfile() {
//     /* ============ BACKEND HOOK: SAVE PROFILE ============
//        fetch('/api/profile', { method: 'PUT', headers: {...}, body: JSON.stringify(profile) })
//     */
//     console.log("Profile to save (backend not connected):", profile);
//     setSavedProfile(profile);
//     alert("Backend not connected yet: profile changes are not actually saved.");
//   }

//   function handleChangePassword() {
//     /* ============ BACKEND HOOK: CHANGE PASSWORD ============
//        Open a modal / route that calls something like
//        fetch('/api/profile/change-password', { method:'POST', body: {...} })
//     */
//     alert("Backend not connected yet: this should open the change-password flow.");
//   }

//   function handleReportAction(action, item) {
//     if (action === "download-pdf") {
//       /* ============ BACKEND HOOK: DOWNLOAD PDF ============
//          window.location = `/api/reports/${item.date}/download`;
//       */
//       alert("Backend not connected yet: this should download the PDF report.");
//     }
//     if (action === "print-report") {
//       /* ============ BACKEND HOOK: PRINT REPORT ============
//          Load the full report (HTML/PDF) then call window.print().
//       */
//       alert("Backend not connected yet: this should open the print dialog for the report.");
//     }
//     if (action === "share-report") {
//       /* ============ BACKEND HOOK: SHARE REPORT ============
//          Generate a shareable link from backend (with access token) and use
//          navigator.share() or copy-to-clipboard.
//       */
//       alert("Backend not connected yet: this should share the report link.");
//     }
//   }

//   const filteredHistory = mockHistory.filter((h) => {
//     const matchesSearch = h.disease.toLowerCase().includes(historySearch.toLowerCase());
//     const matchesFilter = historyFilter === "all" || h.status === historyFilter;
//     return matchesSearch && matchesFilter;
//   });

//   /* ============ BACKEND HOOK: INITIAL DATA LOAD ============
//      Right now the dashboard renders from mock* constants defined above.
//      Replace with real API calls on mount, e.g.:

//      useEffect(() => {
//        fetch('/api/dashboard/summary').then(r => r.json()).then(setStats);
//        fetch('/api/scans/history').then(r => r.json()).then(setHistory);
//        fetch('/api/reports').then(r => r.json()).then(setReports);
//        fetch('/api/notifications').then(r => r.json()).then(setNotifications);
//      }, []);
//   */

//   return (
//     <div className="dtc-app" data-theme={darkMode ? "dark" : "light"}>
//       {/* ================= SIDEBAR ================= */}
//       <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
//         <div className="sidebar-brand">
//           <span className="logo-dot"></span> Derma Detect AI
//         </div>
//         <ul className="nav-list">
//           {[
//             ["dashboard", "🏠", "Dashboard"],
//             ["scan", "📷", "New Scan"],
//             ["history", "📊", "Scan History"],
//             ["reports", "📄", "Reports"],
//             ["notifications", "🔔", "Notifications"],
//             ["profile", "👤", "Profile"],
//             ["settings", "⚙️", "Settings"],
//           ].map(([key, icon, label]) => (
//             <li
//               key={key}
//               className={`nav-item ${activeView === key ? "active" : ""}`}
//               onClick={() => goTo(key)}
//             >
//               <span className="nav-icon">{icon}</span> {label}
//             </li>
//           ))}
//         </ul>
//         <div className="sidebar-footer">
//           <div className="logout-btn" onClick={handleLogout}>
//             🚪 Logout
//           </div>
//         </div>
//       </aside>

//       {/* ================= MAIN ================= */}
//       <div className="main">
//         <div className="topbar">
//           <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//             <button className="menu-btn" onClick={() => setSidebarOpen((s) => !s)}>
//               ☰
//             </button>
//             <div className="topbar-title">{TITLE_MAP[activeView]}</div>
//           </div>
//           <div className="topbar-right">
//             <div className="bell" onClick={() => goTo("notifications")}>
//               <span className="dot"></span>🔔
//             </div>
//             <div className="avatar-chip" onClick={() => goTo("profile")}>
//               <div className="avatar-circle">{mockUser.initial}</div>
//             </div>
//           </div>
//         </div>

//         <div className="content">
//           {activeView === "dashboard" && (
//             <DashboardView
//               userFirstName={mockUser.name.split(" ")[0]}
//               stats={mockStats}
//               recentResult={dashboardResult}
//               history={mockHistory}
//               goTo={goTo}
//             />
//           )}

//           {activeView === "scan" && (
//             <ScanView
//               videoRef={videoRef}
//               canvasRef={canvasRef}
//               cameraActive={cameraActive}
//               capturedImage={capturedImage}
//               scanning={scanning}
//               onOpenCamera={openCamera}
//               onCapture={captureFrame}
//               onScanNow={scanNow}
//             />
//           )}

//           {activeView === "result" && (
//             <ResultView result={scanResult} capturedImage={capturedImage} goTo={goTo} />
//           )}

//           {activeView === "diseaseInfo" && (
//             <DiseaseInfoView
//               diseaseName={scanResult.disease}
//               openSection={openSection}
//               setOpenSection={setOpenSection}
//             />
//           )}

//           {activeView === "history" && (
//             <HistoryView
//               rows={filteredHistory}
//               search={historySearch}
//               setSearch={setHistorySearch}
//               filter={historyFilter}
//               setFilter={setHistoryFilter}
//               goTo={goTo}
//             />
//           )}

//           {activeView === "reports" && (
//             <ReportsView reports={mockReports} onAction={handleReportAction} />
//           )}

//           {activeView === "notifications" && <NotificationsView items={mockNotifications} />}

//           {activeView === "profile" && (
//             <ProfileView
//               profile={profile}
//               setProfile={setProfile}
//               savedProfile={savedProfile}
//               onSave={handleSaveProfile}
//               onChangePassword={handleChangePassword}
//             />
//           )}

//           {activeView === "settings" && (
//             <SettingsView
//               darkMode={darkMode}
//               setDarkMode={setDarkMode}
//               language={language}
//               setLanguage={setLanguage}
//               notifScan={notifScan}
//               setNotifScan={setNotifScan}
//               notifFollowup={notifFollowup}
//               setNotifFollowup={setNotifFollowup}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ======================================================================
//    SUB-VIEWS
//    ====================================================================== */

// function DashboardView({ userFirstName, stats, recentResult, history, goTo }) {
//   return (
//     <section className="view active">
//       <div className="welcome">
//         <div>
//           <h1>Hello, {userFirstName} 👋</h1>
//           <p>Here's a quick look at your skin health overview.</p>
//         </div>
//       </div>

//       <div className="stats-grid">
//         <StatCard icon="📷" iconClass="blue" value={stats.totalScans} label="Total Scans" />
//         <StatCard icon="📅" iconClass="teal" value={stats.lastScanDate} label="Last Scan Date" />
//         <StatCard icon="✅" iconClass="green" value={stats.currentStatus} label="Current Status" />
//         <StatCard icon="📄" iconClass="mint" value={stats.reportsAvailable} label="Reports Available" />
//       </div>

//       <div className="cta-scan">
//         <div>
//           <h3>📷 Ready for your next check-up?</h3>
//           <p>Scan your skin in seconds and get an instant AI-powered analysis.</p>
//         </div>
//         <button className="btn btn-secondary" onClick={() => goTo("scan")}>
//           Quick Scan
//         </button>
//       </div>

//       <div className="dash-grid">
//         <div className="card">
//           <div className="result-preview-row">
//             <div className="section-title" style={{ marginBottom: 0 }}>
//               📈 Recent Scan Result
//             </div>
//             <span className={severityBadgeClass(recentResult.severity)}>{recentResult.severity}</span>
//           </div>
//           <div className="result-item">
//             <span className="k">Disease</span>
//             <span className="v">{recentResult.disease}</span>
//           </div>
//           <div className="result-item">
//             <span className="k">Confidence</span>
//             <span className="v">{recentResult.confidence}%</span>
//           </div>
//           <div className="result-item">
//             <span className="k">Scanned on</span>
//             <span className="v">{recentResult.date}</span>
//           </div>
//           <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={() => goTo("result")}>
//             View Full Report
//           </button>
//         </div>

//         <div className="card">
//           <div className="section-title">📜 Recent History</div>
//           <ul className="history-mini">
//             {history.slice(0, 4).map((item, i) => (
//               <li key={i}>
//                 <span>
//                   <span className={`dot ${item.status === "Healthy" ? "dot-green" : "dot-amber"}`}></span>
//                   {item.disease}
//                 </span>
//                 <span style={{ color: "var(--text-secondary)", fontSize: 12.5 }}>{item.date}</span>
//               </li>
//             ))}
//           </ul>
//           <button className="btn btn-outline" style={{ marginTop: 14, width: "100%" }} onClick={() => goTo("history")}>
//             View All History
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// }

// function StatCard({ icon, iconClass, value, label }) {
//   return (
//     <div className="stat-card">
//       <div className={`stat-icon ${iconClass}`}>{icon}</div>
//       <div>
//         <div className="stat-value">{value}</div>
//         <div className="stat-label">{label}</div>
//       </div>
//     </div>
//   );
// }

// function ScanView({ videoRef, canvasRef, cameraActive, capturedImage, scanning, onOpenCamera, onCapture, onScanNow }) {
//   return (
//     <section className="view active">
//       <div className="section-title">📷 New Skin Scan</div>
//       <div className="scan-wrap card">
//         <div className="camera-box">
//           {!cameraActive && !capturedImage && (
//             <div className="camera-placeholder">
//               <div className="icon">📷</div>
//               <div>Camera preview will appear here</div>
//             </div>
//           )}
//           <video
//             ref={videoRef}
//             autoPlay
//             playsInline
//             style={{ display: cameraActive ? "block" : "none" }}
//           />
//           {capturedImage && <img src={capturedImage} alt="Captured skin area" style={{ display: "block" }} />}
//           <canvas ref={canvasRef} style={{ display: "none" }} />
//         </div>

//         <div className="scan-actions">
//           <button className="btn btn-primary" onClick={onOpenCamera} disabled={cameraActive}>
//             {cameraActive ? "📷 Camera Active" : "📷 Open Camera"}
//           </button>
//           <button className="btn btn-secondary" onClick={onCapture} disabled={!cameraActive}>
//             📸 Capture
//           </button>
//           <button className="btn btn-secondary" onClick={onScanNow} disabled={!capturedImage || scanning}>
//             🤖 Scan Now
//           </button>
//         </div>
//         <p className="scan-tip">
//           Position the affected skin area clearly in frame, in good lighting, then capture and scan.
//         </p>

//         {scanning && (
//           <div className="scan-status show">
//             <div className="spinner"></div>
//             <span>Analyzing image, please wait...</span>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }

// function ResultView({ result, capturedImage, goTo }) {
//   return (
//     <section className="view active">
//       <div className="section-title">🤖 Scan Result</div>
//       <div className="card mb">
//         <div className="result-hero">
//           <div className="result-photo">
//             {capturedImage ? <img src={capturedImage} alt="Scanned" /> : "Captured Image"}
//           </div>
//           <div className="result-main">
//             <div className="result-disease">{result.disease}</div>
//             <span className={severityBadgeClass(result.severity)}>Severity: {result.severity}</span>
//             <div style={{ marginTop: 14, fontSize: 13, color: "var(--text-secondary)" }}>Confidence Score</div>
//             <div className="confidence-bar-track">
//               <div className="confidence-bar-fill" style={{ width: `${result.confidence}%` }}></div>
//             </div>
//             <div style={{ fontWeight: 700, fontSize: 14 }}>{result.confidence}%</div>

//             <div className="recommend-box">
//               <b>Recommended Action:</b> {result.recommendation}
//             </div>
//           </div>
//         </div>

//         <div className="info-grid">
//           <div className="info-box">
//             <div className="lbl">Short Description</div>
//             <div className="val" style={{ fontWeight: 500 }}>{result.description}</div>
//           </div>
//           <div className="info-box">
//             <div className="lbl">Is it Contagious?</div>
//             <div className="val">{result.contagious}</div>
//           </div>
//           <div className="info-box">
//             <div className="lbl">Scanned On</div>
//             <div className="val">{result.date}</div>
//           </div>
//         </div>

//         <div className="scan-actions" style={{ justifyContent: "flex-start", marginTop: 22 }}>
//           <button className="btn btn-primary" onClick={() => goTo("diseaseInfo")}>
//             📖 Learn About This Disease
//           </button>
//           <button className="btn btn-outline" onClick={() => goTo("reports")}>
//             📄 View / Download Report
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// }

// function DiseaseInfoView({ diseaseName, openSection, setOpenSection }) {
//   return (
//     <section className="view active">
//       <div className="section-title">📖 Disease Information — {diseaseName}</div>
//       <div>
//         {diseaseInfoSections.map((sec) => (
//           <div key={sec.key} className={`accordion ${openSection === sec.key ? "open" : ""}`}>
//             <div
//               className="accordion-head"
//               onClick={() => setOpenSection(openSection === sec.key ? null : sec.key)}
//             >
//               {sec.label} <span className="chev">▾</span>
//             </div>
//             <div className="accordion-body">{sec.text}</div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }

// function HistoryView({ rows, search, setSearch, filter, setFilter, goTo }) {
//   return (
//     <section className="view active">
//       <div className="section-title">📊 Scan History</div>
//       <div className="card">
//         <div className="table-toolbar">
//           <div className="search-box">
//             🔍 <input
//               type="text"
//               placeholder="Search by disease..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>
//           <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
//             <option value="all">All Status</option>
//             <option value="Healthy">Healthy</option>
//             <option value="Disease Detected">Disease Detected</option>
//           </select>
//         </div>
//         <table>
//           <thead>
//             <tr>
//               <th>Date</th>
//               <th>Disease</th>
//               <th>Confidence</th>
//               <th>Status</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((item, i) => (
//               <tr key={i}>
//                 <td>{item.date}</td>
//                 <td>{item.disease}</td>
//                 <td>{item.confidence}</td>
//                 <td>{statusBadge(item.status)}</td>
//                 <td>
//                   <div className="row-actions">
//                     <button className="icon-btn" title="View Report" onClick={() => goTo("result")}>
//                       👁
//                     </button>
//                     <button
//                       className="icon-btn"
//                       title="Download PDF"
//                       onClick={() => alert("Backend not connected yet: this should download the PDF report.")}
//                     >
//                       ⬇
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </section>
//   );
// }

// function ReportsView({ reports, onAction }) {
//   return (
//     <section className="view active">
//       <div className="section-title">📄 Medical Reports</div>
//       <div className="card">
//         {reports.map((r, i) => (
//           <div className="report-card" key={i}>
//             <div className="report-left">
//               <div className="report-icon">📄</div>
//               <div>
//                 <div className="report-title">{r.title}</div>
//                 <div className="report-sub">{r.date}</div>
//               </div>
//             </div>
//             <div className="report-actions">
//               <button className="btn btn-outline" onClick={() => onAction("download-pdf", r)}>
//                 ⬇ Download
//               </button>
//               <button className="btn btn-outline" onClick={() => onAction("print-report", r)}>
//                 🖨 Print
//               </button>
//               <button className="btn btn-outline" onClick={() => onAction("share-report", r)}>
//                 🔗 Share
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }

// function NotificationsView({ items }) {
//   return (
//     <section className="view active">
//       <div className="section-title">🔔 Notifications</div>
//       <div className="card">
//         {items.map((n, i) => (
//           <div className={`notif-item ${n.unread ? "unread" : ""}`} key={i}>
//             <div className="notif-icon" style={{ background: "var(--bg-main)" }}>
//               {n.icon}
//             </div>
//             <div>
//               <div className="notif-title">{n.title}</div>
//               <div className="notif-time">{n.time}</div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }

// function ProfileView({ profile, setProfile, savedProfile, onSave, onChangePassword }) {
//   function update(field, value) {
//     setProfile((p) => ({ ...p, [field]: value }));
//   }

//   return (
//     <section className="view active">
//       <div className="section-title">👤 Profile</div>
//       <div className="card">
//         <div className="profile-head">
//           <div className="profile-avatar">{savedProfile.name.charAt(0)}</div>
//           <div>
//             <div className="profile-name">{savedProfile.name}</div>
//             <div className="profile-email">{savedProfile.email}</div>
//           </div>
//         </div>
//         <div className="form-grid">
//           <div className="field">
//             <label>Full Name</label>
//             <input type="text" value={profile.name} onChange={(e) => update("name", e.target.value)} />
//           </div>
//           <div className="field">
//             <label>Age</label>
//             <input type="number" value={profile.age} onChange={(e) => update("age", e.target.value)} />
//           </div>
//           <div className="field">
//             <label>Gender</label>
//             <select value={profile.gender} onChange={(e) => update("gender", e.target.value)}>
//               <option>Male</option>
//               <option>Female</option>
//               <option>Other</option>
//             </select>
//           </div>
//           <div className="field">
//             <label>Email</label>
//             <input type="email" value={profile.email} onChange={(e) => update("email", e.target.value)} />
//           </div>
//           <div className="field">
//             <label>Phone</label>
//             <input type="tel" value={profile.phone} onChange={(e) => update("phone", e.target.value)} />
//           </div>
//         </div>
//         <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
//           <button className="btn btn-primary" onClick={onSave}>
//             Save Changes
//           </button>
//           <button className="btn btn-outline" onClick={onChangePassword}>
//             Change Password
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// }

// function SettingsView({
//   darkMode,
//   setDarkMode,
//   language,
//   setLanguage,
//   notifScan,
//   setNotifScan,
//   notifFollowup,
//   setNotifFollowup,
// }) {
//   return (
//     <section className="view active">
//       <div className="section-title">⚙ Settings</div>
//       <div className="card">
//         <div className="settings-row">
//           <div>
//             <div className="settings-label">Dark Mode</div>
//             <div className="settings-sub">Switch between light and dark theme</div>
//           </div>
//           <div className={`toggle ${darkMode ? "on" : ""}`} onClick={() => setDarkMode((d) => !d)}>
//             <div className="knob"></div>
//           </div>
//         </div>
//         <div className="settings-row">
//           <div>
//             <div className="settings-label">Language</div>
//             <div className="settings-sub">Choose your preferred language</div>
//           </div>
//           <select className="filter-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
//             <option>English</option>
//             <option>हिन्दी</option>
//           </select>
//         </div>
//         <div className="settings-row">
//           <div>
//             <div className="settings-label">Scan Completed Alerts</div>
//             <div className="settings-sub">Get notified when a scan result is ready</div>
//           </div>
//           <div className={`toggle ${notifScan ? "on" : ""}`} onClick={() => setNotifScan((v) => !v)}>
//             <div className="knob"></div>
//           </div>
//         </div>
//         <div className="settings-row">
//           <div>
//             <div className="settings-label">Follow-up Reminders</div>
//             <div className="settings-sub">Reminders for recommended doctor visits</div>
//           </div>
//           <div className={`toggle ${notifFollowup ? "on" : ""}`} onClick={() => setNotifFollowup((v) => !v)}>
//             <div className="knob"></div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
import React, { useState, useRef, useEffect } from "react";
import "../components/styles/dashboard.css";

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
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
