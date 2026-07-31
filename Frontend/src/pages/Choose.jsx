import React, { useState, useRef } from "react";
import "../components/styles/choose.css";

export default function ScanSelect() {
  const [selected, setSelected] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef(null);

  const handleCameraClick = () => {
    setSelected("camera");
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
          Choose an input method to begin your skin analysis.
        </p>

        <div className="ds-cards">
          <div
            className={`ds-card camera ${selected === "camera" ? "selected" : ""}`}
            tabIndex={0}
            role="button"
            aria-pressed={selected === "camera"}
            onClick={handleCameraClick}
            onKeyDown={(e) => handleKeyDown(e, handleCameraClick)}
          >
            <div className="ds-checkmark">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

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

            <div className="ds-card-title">Use Camera</div>
            <div className="ds-card-desc">
              Detects <strong>Warts, Acne, Psoriasis, Ringworm</strong> and{" "}
              <strong>Vitiligo</strong> using your live camera feed.
            </div>
            <div className="ds-tag-row">
              {["Warts", "Acne", "Psoriasis", "Ringworm", "Vitiligo"].map(
                (tag) => (
                  <span className="ds-tag" key={tag}>
                    {tag}
                  </span>
                )
              )}
            </div>
            <button className="ds-card-cta">Start scan</button>
          </div>

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

            <div className="ds-card-title">Dedicated Scan Device</div>
            <div className="ds-card-desc">
              A purpose-built handheld device for deeper diagnostics,
              including skin cancer and other conditions.
            </div>
            <button className="ds-card-cta">In development</button>
          </div>
        </div>

        <div className={`ds-toast ${toastVisible ? "show" : ""}`}>
          This feature is coming soon
        </div>
      </div>
    </div>
  );
}