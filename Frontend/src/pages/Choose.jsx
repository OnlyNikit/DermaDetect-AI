import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../components/styles/choose.css";
import { useAuth } from "../components/context/AuthContext";

const SKIN_TAGS = ["Warts", "Acne", "Psoriasis", "Ringworm", "Vitiligo"];

export default function ScanSelect() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const toastTimer = useRef(null);

  // Called when the user picks "Scan on this device" — opens the camera
  // directly in this browser tab (same flow as before).
  const handleThisDeviceClick = () => {
    if (!user) {
      navigate("/login");
    } else {
      navigate("/choose=thisdevice");
    }
    setSelected("thisdevice");
    // TODO: navigate to /scan or open the in-page camera capture view here
  };

  // Called when the user picks "Scan from Smartphone" — generates a
  // short-lived session and opens the QR modal. The phone visits a
  // link tied to sessionId, opens its own camera, and streams/uploads
  // the result back to this session (via your backend / websocket).
  const handleSmartphoneClick = () => {
    setSelected("smartphone");
    // TODO: replace with a real backend call, e.g.
    // const { id } = await api.createScanSession();
    const id = Math.random().toString(36).slice(2, 8).toUpperCase();
    setSessionId(id);
    setQrModalOpen(true);
    // TODO: open a websocket / poll here to detect when the phone
    // connects, then update the status text below and eventually
    // redirect this tab to the results page once the scan completes.
  };

  const closeQrModal = () => {
    setQrModalOpen(false);
    setSessionId(null);
  };

  const handleDeviceClick = () => {
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2200);
  };

  const handleKeyDown = (e, action) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  // Build the URL the phone should open. Swap this for your real
  // scan-session route once the backend endpoint exists.
  const qrTargetUrl = sessionId
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/mobile-scan/${sessionId}`
    : "";

  return (
    <div className="dermascan-root">
      <div className="ds-page">
        <div className="ds-grid-overlay"></div>

        <div className="ds-eyebrow">
          <span className="ds-dot"></span>DERMASCAN AI
        </div>

        <h1 className="ds-h1">
          How would you like to <span>scan your skin?</span>
        </h1>

        <p className="ds-subtext">
          Pick whichever camera is easiest right now — your phone, this device,
          or our dedicated scanner.
        </p>

        <div className="ds-cards">
          {/* Option 1 — Scan from Smartphone */}
          <div
            className={`ds-card smartphone ${selected === "smartphone" ? "selected" : ""}`}
            tabIndex={0}
            role="button"
            // aria-pressed={selected === "smartphone"}
            aria-disabled="true"
            onClick={handleDeviceClick}
            onKeyDown={(e) => handleKeyDown(e, handleDeviceClick)}
          >ao
            <div className="ds-badge accent">New</div>

            <div className="ds-icon-wrap">
              <div className="ds-icon-ring pulse"></div>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z" />
              </svg>
            </div>

            <div className="ds-card-title">Scan from Smartphone</div>
            <div className="ds-card-desc">
              Scan a <strong>QR code</strong> to connect your phone — its camera
              opens instantly for a closer, higher-quality scan.
            </div>
            <div className="ds-tag-row">
              {SKIN_TAGS.map((tag) => (
                <span className="ds-tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <button className="ds-card-cta">Coming Soon </button>
          </div>

          {/* Option 2 — Scan on this device */}
          <div
            className={`ds-card thisdevice ${selected === "thisdevice" ? "selected" : ""}`}
            tabIndex={0}
            role="button"
            aria-pressed={selected === "thisdevice"}
            onClick={handleThisDeviceClick}
            onKeyDown={(e) => handleKeyDown(e, handleThisDeviceClick)}
          >
            <div className="ds-checkmark">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="ds-badge recommended">Fastest</div>

            <div className="ds-icon-wrap">
              <div className="ds-icon-ring pulse"></div>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 8a2 2 0 0 1 2-2h1.5l1-1.5h7l1 1.5H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
            </div>

            <div className="ds-card-title">Scan on This Device</div>
            <div className="ds-card-desc">
              Already on the device you want to scan with? Use its camera right
              here — no extra steps, no QR code needed.
            </div>
            <div className="ds-tag-row">
              {SKIN_TAGS.map((tag) => (
                <span className="ds-tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <button className="ds-card-cta">Start scan</button>
          </div>

          {/* Option 3 — Dedicated scan device (coming soon) */}
          <div
            className="ds-card device"
            tabIndex={0}
            role="button"
            aria-disabled="true"
            onClick={handleDeviceClick}
            onKeyDown={(e) => handleKeyDown(e, handleDeviceClick)}
          >
            <div className="ds-badge">Coming soon</div>

            <div className="ds-icon-wrap">
              <div className="ds-icon-ring"></div>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="7" y="2" width="10" height="20" rx="2.5" />
                <path d="M10 5.5h4" />
                <circle cx="12" cy="17.2" r="1.4" />
              </svg>
            </div>

            <div className="ds-card-title">Scan from Device</div>
            <div className="ds-card-desc">
              A purpose-built handheld scanner for deeper diagnostics, including
              skin cancer and other conditions.
            </div>
            <button className="ds-card-cta">In development</button>
          </div>
        </div>

        <div className={`ds-toast ${toastVisible ? "show" : ""}`}>
          This feature is coming soon
        </div>

        {qrModalOpen && (
          <div
            className="ds-qr-overlay"
            onClick={closeQrModal}
            role="dialog"
            aria-modal="true"
            aria-label="Connect your smartphone"
          >
            <div className="ds-qr-modal" onClick={(e) => e.stopPropagation()}>
              <button
                className="ds-qr-close"
                onClick={closeQrModal}
                aria-label="Close"
              >
                ✕
              </button>

              <div className="ds-qr-title">Connect your phone</div>
              <div className="ds-qr-subtitle">
                Scan this code with your phone's camera to open the scanner on
                your phone.
              </div>

              <div className="ds-qr-frame">
                {/* Swap this placeholder for a real QR component, e.g.:
                    import QRCode from "react-qr-code";
                    <QRCode value={qrTargetUrl} size={148} /> */}
                <svg viewBox="0 0 148 148" width="148" height="148">
                  <rect width="148" height="148" fill="#ffffff" />
                  <g fill="#05668d">
                    <rect x="10" y="10" width="34" height="34" />
                    <rect x="104" y="10" width="34" height="34" />
                    <rect x="10" y="104" width="34" height="34" />
                    <rect x="18" y="18" width="18" height="18" fill="#ffffff" />
                    <rect
                      x="112"
                      y="18"
                      width="18"
                      height="18"
                      fill="#ffffff"
                    />
                    <rect
                      x="18"
                      y="112"
                      width="18"
                      height="18"
                      fill="#ffffff"
                    />
                    <rect x="52" y="10" width="8" height="8" />
                    <rect x="68" y="10" width="8" height="8" />
                    <rect x="52" y="26" width="8" height="8" />
                    <rect x="84" y="26" width="8" height="8" />
                    <rect x="52" y="52" width="8" height="8" />
                    <rect x="68" y="52" width="8" height="8" />
                    <rect x="84" y="52" width="8" height="8" />
                    <rect x="100" y="52" width="8" height="8" />
                    <rect x="52" y="68" width="8" height="8" />
                    <rect x="84" y="68" width="8" height="8" />
                    <rect x="118" y="68" width="8" height="8" />
                    <rect x="52" y="84" width="8" height="8" />
                    <rect x="68" y="84" width="8" height="8" />
                    <rect x="104" y="84" width="8" height="8" />
                    <rect x="52" y="100" width="8" height="8" />
                    <rect x="84" y="104" width="8" height="8" />
                    <rect x="100" y="104" width="8" height="8" />
                    <rect x="118" y="104" width="8" height="8" />
                    <rect x="52" y="118" width="8" height="8" />
                    <rect x="68" y="118" width="8" height="8" />
                    <rect x="100" y="118" width="8" height="8" />
                  </g>
                </svg>
              </div>

              <ol className="ds-qr-steps">
                <li>
                  <span className="ds-step-num">1</span>
                  Open your phone's camera app.
                </li>
                <li>
                  <span className="ds-step-num">2</span>
                  Point it at the QR code above and tap the link that appears.
                </li>
                <li>
                  <span className="ds-step-num">3</span>
                  Allow camera access when your phone asks — the scan starts
                  automatically.
                </li>
              </ol>

              <div className="ds-qr-status">
                <span className="ds-dot"></span>
                Waiting for phone to connect
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
