import React from "react";
import Camera from "../components/camera/Camera";
import "../components/styles/scanpage.css";

const CONDITIONS = ["Warts", "Acne", "Psoriasis", "Ringworm", "Vitiligo"];

function ScanPage() {
  return (
    <div className="scan-page">
      <div className="scan-page__glow" aria-hidden="true" />

      <header className="scan-header">
        <span className="scan-eyebrow">Skin analysis</span>
        <h1 className="scan-title">Scan Page</h1>
        <p className="scan-subtitle">
          Line up the area under good light and capture a clear, steady shot.
        </p>

        <ul className="condition-chips">
          {CONDITIONS.map((condition) => (
            <li className="condition-chip" key={condition}>
              {condition}
            </li>
          ))}
        </ul>
      </header>

      <main className="scan-main">
        <Camera />
      </main>

      <p className="scan-footnote">
        Results are a preliminary read, not a diagnosis. When in doubt, see a
        dermatologist.
      </p>
    </div>
  );
}

export default ScanPage;