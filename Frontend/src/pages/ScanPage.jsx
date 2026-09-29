import React, { useState } from "react";
import Camera from "../components/camera/Camera";
import "../components/styles/scanpage.css";

const CONDITIONS = [
  "Acne",
  "Psoriasis",
  "Ringworm",
  "Vitiligo",
];

function ScanPage() {
  const [isChecking, setIsChecking] = useState(false);

  return (
    <div className="scan-page">
      <div
        className="scan-page__glow"
        aria-hidden="true"
      />

      <header className="scan-header">
        <span className="scan-eyebrow">
          Skin analysis
        </span>

        <h1 className="scan-title">
          Scan Page
        </h1>

        <p className="scan-subtitle">
          Line up the affected area under good lighting
          and capture a clear, steady photo.
        </p>

        <ul className="condition-chips">
          {CONDITIONS.map((condition) => (
            <li
              className="condition-chip"
              key={condition}
            >
              {condition}
            </li>
          ))}
        </ul>
      </header>

      <main className="scan-main">
        <Camera
          onValidationStart={() =>
            setIsChecking(true)
          }
          onValidationEnd={() =>
            setIsChecking(false)
          }
        />
      </main>

      {/* ==============================
          VALIDATION LOADER
         ============================== */}

      {isChecking && (
        <div className="scan-loader-overlay">
          <div className="scan-loader-card">
            <div className="scan-loader-spinner" />

            <h3>
              Checking your image...
            </h3>

            <p>
              We're checking whether your photo is
              suitable for skin analysis.
            </p>

            <span>
              This may take a few seconds.
            </span>
          </div>
        </div>
      )}

      <p className="scan-footnote">
        Results are a preliminary screening, not a
        diagnosis. If you have concerns about your
        skin, please consult a dermatologist.
      </p>
    </div>
  );
}

export default ScanPage;