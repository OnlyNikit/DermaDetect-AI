import React from "react";
import { Link } from "react-router-dom";
import "./home.css";

import ButtonPrimary from "../components/ButtonPrimary";
import Buttonsecondary from "../components/Buttonsecondary";
import ScanSvg from "../assets/ScanSvg";
import SkinProblems from "../components/SkinProblems";
import { useAuth } from "../components/context/AuthContext.jsx";

const diseases = [
  "Acne",
  "Psoriasis",
  "Ringworm",
  "Vitiligo",
];

export default function Home() {
  const { user } = useAuth();

  // Doctor login check
  const isDoctorLoggedIn = user?.role?.toLowerCase() === "doctor";

  const duplicatedDiseases = [...diseases, ...diseases];

  return (
    <div className="home">

      {/* ================= HERO ================= */}
      <section className="hero-section">
        <div className="hero-left">
          <h1>
            See what's on your skin,
            <span> clearly.</span>
          </h1>

          <p>
            Upload medical images, receive AI-assisted analysis,
            understand potential risks, and monitor your health
            through an intuitive platform.
          </p>

          <div className="hero-buttons">

            {/* GET STARTED / DASHBOARD */}
            <ButtonPrimary
              to={isDoctorLoggedIn ? "/doctor-dashboard" : "/choose"}
            >
              {isDoctorLoggedIn ? "Dashboard" : "Get Started"}
            </ButtonPrimary>

            <Buttonsecondary to="/about">
              Learn More
            </Buttonsecondary>

          </div>
        </div>

        <div className="hero-right">
          <ScanSvg />
        </div>
      </section>


      {/* ================= SKIN PROBLEMS ================= */}
      <SkinProblems />


      {/* ================= HOW IT WORKS ================= */}
      <section className="how-section">
        <div className="section-heading">
          <h2>How DermaDetect AI Works</h2>
          <p>
            Simple steps to understand your skin better.
          </p>
        </div>

        <div className="how-cards">

          <div className="how-card">
            <div className="card-number">01</div>
            <h3>Capture</h3>
            <p>
              Capture or upload a clear image of the affected
              skin area.
            </p>
          </div>

          <div className="how-card">
            <div className="card-number">02</div>
            <h3>Analyze</h3>
            <p>
              Our AI analyzes the image for supported skin
              conditions.
            </p>
          </div>

          <div className="how-card">
            <div className="card-number">03</div>
            <h3>Understand</h3>
            <p>
              Review the result and understand what may
              require further attention.
            </p>
          </div>

        </div>
      </section>


      {/* ================= DISEASES ================= */}
      <section className="disease-section">

        <div className="section-heading">
          <h2>
            Skin Conditions Included in Our AI Screening.
          </h2>

          <p>
            DermaDetect AI currently screens for these
            supported skin conditions.
          </p>
        </div>

        <div className="disease-marquee">
          <div className="disease-track">
            {duplicatedDiseases.map((disease, index) => (
              <div className="disease-item" key={index}>
                <span>{disease}</span>
              </div>
            ))}
          </div>
        </div>

      </section>


      {/* ================= DISCLAIMER ================= */}
      <section className="disclaimer-section">

        <div className="disclaimer-card">

          <div className="disclaimer-title">
            <span>NOT A DIAGNOSIS</span>
          </div>

          <p>
            DermaDetect AI flags what may deserve a closer look.
            It does not replace a professional medical diagnosis.
            A dermatologist or qualified healthcare professional
            should make the final assessment.
          </p>

        </div>

      </section>


      {/* ================= FEATURES ================= */}
      <section className="features-section">

        <div className="feature-card">
          <h3>Photos stay on your device</h3>
          <p>
            Images are processed for analysis and are not stored
            on servers by default.
          </p>
        </div>

        <div className="feature-card">
          <h3>Built on dermatology data</h3>
          <p>
            Our AI models are trained using image datasets
            representing supported skin conditions.
          </p>
        </div>

        <div className="feature-card">
          <h3>Track changes over time</h3>
          <p>
            Keep track of your previous assessments and monitor
            changes in your skin.
          </p>
        </div>

      </section>

    </div>
  );
}