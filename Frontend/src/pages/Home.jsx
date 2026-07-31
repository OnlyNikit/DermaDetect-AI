import React from "react";
import {Link} from "react-router-dom"
import "../components/styles/home.css";
// import  "../components/styles/card2.css";
import ButtonPrimary from "../components/ui/ButtonPrimary";
import Buttonsecondary from "../components/ui/ButtonSecondary";
import ScanAnimation from "../assets/animations/SkinScanHero";
import ScanSvg from "../assets/animations/skin-scan.svg";

import skinproblem from "../components/ui/Skinproblem"
import SkinProblems from "../components/ui/Skinproblem";

const diseases = [
  "Acne",
  "Eczema",
  "Psoriasis",
  "Ringworm",
  "Vitiligo",
  "Melanoma",
  "Basal Cell Carcinoma",
  "Squamous Cell Carcinoma",
  "Melanocytic Nevus (Mole)",
  "Warts",
];

export default function Home() {
  const items = [...diseases, ...diseases];

  return (
    <>
      <div className="container main-container">
        <div className="row ">
          <div className="col-12 col-lg-6 order-2 order-lg-1  container-left">
            <div className="heading">
              <h1>
                See what's on <br />
                your skin,<span className="highlight"> clearly</span>.
              </h1>
            </div>
            <div className="description">
              <h4>
                Upload medical images, receive AI-assisted analysis,
                 understand potential risks,and monitor your health{" "}
                 through an intuitive platform.
              </h4>
              <div className="hero-btns">
                <Link to="/choose">
                  <Buttonsecondary>Get Started</Buttonsecondary>
                </Link>
                <Link to="about">
                  <ButtonPrimary>Learn More</ButtonPrimary>
                </Link>
              </div>
            </div>
          </div>
          <div className=" col-12 col-lg-6  order-1 order-lg-2  container-right">
            <div className="scan">
              {/* <ScanAnimation /> */}
              <img src={ScanSvg} alt="" />
            </div>
          </div>
        </div>
      </div>
              <SkinProblems/>
      <div className="container">
        <hr />
        <div className="row">
          <div className="col-12 ">
            <div className="card-head">
              <h2>Three steps, no waiting room.</h2>
            </div>
            <div className="card-des">
              <h6>
                Capture, analyze, understand the whole check happens on your
                phone, in under a minute.{" "}
              </h6>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="cards">
            <div className="card red">
              <p className="tip">01 — Capture</p>
              <p className="second-text">Photograph the area</p>
              <p className="third-text">
                Frame the mark in good light. Derma guides you to the right
                distance and focus before it lets you shoot.
              </p>
            </div>
            <div className="card blue">
              <p className="tip">02 — Analyze</p>
              <p className="second-text">The model gets to work</p>
              <p className="third-text">
                Shape, border, colour variation and size are measured against
                patterns learned from dermatology image sets.
              </p>
            </div>
            <div className="card green">
              <p className="tip">03 — Understand</p>
              <p className="second-text">Get a plain-language read</p>
              <p className="third-text">
                A risk band, what it means, and a clear next step — track it at
                home or book a dermatologist.
              </p>
            </div>
          </div>
        </div>
        <hr />
      </div>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="card-head ">
              <h2 className="card-text">
                Skin Conditions Included in Our AI Screening.
              </h2>
            </div>
            <div className="col-12">
              <div className="card-des">
                <h6>
                  Capture, analyze, understand the whole check happens on your
                  phone, in under a minute.{" "}
                </h6>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="cards2">
        <div className="card2">
          <div className="marquee-label">
            <span className="dot"></span>Scanning Diseases
          </div>

          <div className="marquee-wrap">
            <div className="marquee-track">
              {items.map((name, i) => (
                <div className="item-group" key={i}>
                  <div className={`item alert`}>
                    <span className="ring"></span>
                    <span>{name}</span>
                  </div>
                  <span className="sep">&#8226;</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <hr />
        <div className="row">
          <div className="col-12 col-lg-5">
            <div className="cards">
              <div className="card red">
                <p className="tip">NOT A DIAGNOSIS</p>
                <p className="second-text ">
                  DermaDetect AI flags what deserves a closer look. A licensed
                  dermatologist always makes the final call.
                </p>
                {/* <p className="third-text">
                Frame the mark in good light. Derma guides you to the right
                distance and focus before it lets you shoot.
              </p> */}
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-7">
            <div className="feature">
              <ul>
                <div className="item1">
                  <li>Photos stay on your device</li>
                  <p>
                    Images are processed for your scan and not stored on our
                    servers by default.
                  </p>
                </div>
                <div className="item1">
                  <li>Built on dermatology data</li>
                  <p>
                    The model is trained against labelled clinical image sets,
                    not general photos.
                  </p>
                </div>
                <div className="item1">
                  <li>Track changes over time</li>
                  <p>
                    Re-scan the same spot later to see if size, shape, or colour
                    has shifted.
                  </p>
                </div>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
