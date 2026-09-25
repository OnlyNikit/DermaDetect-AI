import React from "react";
import { Link } from "react-router-dom";

import "../components/styles/home.css";

import ButtonPrimary from "../components/ui/ButtonPrimary";
import Buttonsecondary from "../components/ui/ButtonSecondary";

import ScanSvg from "../assets/animations/skin-scan.svg";
import SkinProblems from "../components/ui/Skinproblem";

const diseases = ["Acne", "Psoriasis", "Ringworm", "Vitiligo"];

export default function Home() {
  const items = [...diseases, ...diseases];

  return (
    <>
      {/* =====================================================
          HERO SECTION
      ====================================================== */}

      <section className="container main-container">
        <div className="row align-items-center">

          {/* ================= LEFT ================= */}

          <div className="col-12 col-lg-6 order-2 order-lg-1 container-left">
            <div className="heading">
              <h1>
                See what's on
                <br />
                your skin,
                <span className="highlight"> clearly</span>.
              </h1>
            </div>

            <div className="description">
              <h4>
                Upload medical images, receive AI-assisted analysis,
                understand potential risks, and monitor your health
                through an intuitive platform.
              </h4>

              {/* ================= HERO BUTTONS ================= */}

              <div className="hero-btns">

                {/* GET STARTED */}

                <Link
                  to="/choose"
                  className="hero-btn-link"
                  aria-label="Get Started"
                >
                  <Buttonsecondary>
                    Get Started
                  </Buttonsecondary>
                </Link>

                {/* LEARN MORE */}

                <Link
                  to="/about"
                  className="hero-btn-link"
                  aria-label="Learn More"
                >
                  <ButtonPrimary>
                    Learn More
                  </ButtonPrimary>
                </Link>

              </div>
            </div>
          </div>

          {/* ================= RIGHT ================= */}

          <div className="col-12 col-lg-6 order-1 order-lg-2 container-right">
            <div className="scan">
              <img
                src={ScanSvg}
                alt="AI skin scanning illustration"
              />
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================
          SKIN PROBLEMS
      ====================================================== */}

      <SkinProblems />

      {/* =====================================================
          THREE STEPS
      ====================================================== */}

      <section className="container">

        <hr />

        <div className="row">
          <div className="col-12">

            <div className="card-head">
              <h2>
                Three steps, no waiting room.
              </h2>
            </div>

            <div className="card-des">
              <h6>
                Capture, analyze, understand — the whole check
                happens on your phone, in under a minute.
              </h6>
            </div>

          </div>
        </div>

        <div className="row">

          <div className="cards">

            {/* ================= CARD 1 ================= */}

            <div className="card red">
              <p className="tip">
                01 — Capture
              </p>

              <p className="second-text">
                Photograph the area
              </p>

              <p className="third-text">
                Frame the mark in good light. Derma guides you
                to the right distance and focus before it lets
                you shoot.
              </p>
            </div>

            {/* ================= CARD 2 ================= */}

            <div className="card blue">
              <p className="tip">
                02 — Analyze
              </p>

              <p className="second-text">
                The model gets to work
              </p>

              <p className="third-text">
                Shape, border, colour variation and size are
                analyzed against patterns learned from
                dermatology image sets.
              </p>
            </div>

            {/* ================= CARD 3 ================= */}

            <div className="card green">
              <p className="tip">
                03 — Understand
              </p>

              <p className="second-text">
                Get a plain-language read
              </p>

              <p className="third-text">
                Get a risk indication, understand what it may
                mean, and see a clear next step — track it at
                home or consult a dermatologist.
              </p>
            </div>

          </div>

        </div>

        <hr />

      </section>

      {/* =====================================================
          DISEASE SECTION HEADING
      ====================================================== */}

      <section className="container">

        <div className="row">

          <div className="col-12">

            <div className="card-head">
              <h2 className="card-text">
                Skin Conditions Included in Our AI Screening.
              </h2>
            </div>

            <div className="card-des">
              <h6>
                Our current AI screening prototype covers
                multiple common skin conditions.
              </h6>
            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          DISEASE MARQUEE
      ====================================================== */}

      <section className="cards2">

        <div className="card2">

          <div className="marquee-label">
            <span className="dot"></span>
            Scanning Diseases
          </div>

          <div className="marquee-wrap">

            <div className="marquee-track">

              {items.map((name, index) => (
                <div
                  className="item-group"
                  key={`${name}-${index}`}
                >

                  <div className="item alert">
                    <span className="ring"></span>
                    <span>{name}</span>
                  </div>

                  <span className="sep">
                    &#8226;
                  </span>

                </div>
              ))}

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          DISCLAIMER + FEATURES
      ====================================================== */}

      <section className="container">

        <hr />

        <div className="row">

          {/* ================= DISCLAIMER ================= */}

          <div className="col-12 col-lg-5">

            <div className="cards">

              <div className="card red">

                <p className="tip">
                  NOT A DIAGNOSIS
                </p>

                <p className="second-text">
                  DermaDetect AI flags what deserves a closer
                  look. A licensed dermatologist always makes
                  the final call.
                </p>

              </div>

            </div>

          </div>

          {/* ================= FEATURES ================= */}

          <div className="col-12 col-lg-7">

            <div className="feature">

              <ul>

                <li className="item1">
                  <span>
                    Photos stay on your device
                  </span>

                  <p>
                    Images are processed for your scan and
                    are not stored on our servers by default.
                  </p>
                </li>

                <li className="item1">
                  <span>
                    Built on dermatology data
                  </span>

                  <p>
                    The model is trained using labelled
                    dermatology image datasets.
                  </p>
                </li>

                <li className="item1">
                  <span>
                    Track changes over time
                  </span>

                  <p>
                    Re-scan the same area later to compare
                    changes in size, shape, or appearance.
                  </p>
                </li>

              </ul>

            </div>

          </div>

        </div>

      </section>
    </>
  );
}