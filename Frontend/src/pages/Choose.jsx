import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../components/styles/choose.css";
import { useAuth } from "../components/context/AuthContext";
import api from "../api/axios";
import { QRCodeSVG } from "qrcode.react";

const SKIN_TAGS = ["Acne", "Psoriasis", "Ringworm", "Vitiligo"];

export default function ScanSelect() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selected, setSelected] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [phoneStatus, setPhoneStatus] = useState("waiting");

  const toastTimer = useRef(null);

  // =========================================================
  // SCAN ON THIS DEVICE
  // =========================================================
const handleThisDeviceClick = () => {
  if (!user) {
    navigate("/login");
    return;
  }

  setSelected("thisdevice");

  navigate("/choose-this-device");
};

  // =========================================================
  // SMARTPHONE QR SCAN
  // =========================================================
  const handleSmartphoneClick = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setSelected("smartphone");
      setPhoneStatus("creating");

      const response = await api.post("/api/phone-session");

      console.log("PHONE SESSION RESPONSE:", response);

      const id = response?.data?.sessionId;

      if (!id) {
        throw new Error("Session ID not received from backend");
      }

      setSessionId(id);
      setPhoneStatus("waiting");
      setQrModalOpen(true);

      console.log("PHONE SESSION ID:", id);
    } catch (error) {
      console.error("Failed to create phone session:", error);

      setPhoneStatus("error");
      setQrModalOpen(true);
    }
  };

  // =========================================================
  // POLL PHONE SESSION
  // =========================================================
  useEffect(() => {
    if (!sessionId || !qrModalOpen) return;

    let isMounted = true;

    const interval = setInterval(async () => {
      try {
        const response = await api.get(
          `/api/phone-session/${sessionId}`
        );

        console.log("PHONE SESSION STATUS:", response.data);

        if (!isMounted) return;

        const data = response.data;

        setPhoneStatus(data.status);

        // Phone uploaded image
        if (data.status === "uploaded" && data.imageUrl) {
          clearInterval(interval);

          setQrModalOpen(false);

          // Go to assessment page
          navigate("/skinAssessment", {
            state: {
              imageUrl: data.imageUrl,
            },
          });
        }
      } catch (error) {
        console.error("Phone session polling failed:", error);
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [sessionId, qrModalOpen, navigate]);

  // =========================================================
  // CLOSE QR MODAL
  // =========================================================
  const closeQrModal = () => {
    setQrModalOpen(false);
    setSessionId(null);
    setPhoneStatus("waiting");
    setSelected(null);
  };

  // =========================================================
  // COMING SOON DEVICE
  // =========================================================
  const handleDeviceClick = () => {
    setToastVisible(true);

    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    toastTimer.current = setTimeout(() => {
      setToastVisible(false);
    }, 2200);
  };

  // =========================================================
  // KEYBOARD ACCESSIBILITY
  // =========================================================
  const handleKeyDown = (event, action) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  };

  // =========================================================
  // QR URL
  // =========================================================
  const qrTargetUrl = sessionId
    ? `${window.location.origin}/mobile-scan/${sessionId}`
    : "";

  return (
    <div className="dermascan-root">
      <div className="ds-page">

        {/* Background Grid */}
        <div className="ds-grid-overlay" />

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="ds-eyebrow">
          <span className="ds-dot" />
          DERMASCAN AI
        </div>

        <h1 className="ds-h1">
          How would you like to <span>scan your skin?</span>
        </h1>

        <p className="ds-subtext">
          Pick whichever camera is easiest right now — your phone,
          this device, or our dedicated scanner.
        </p>

        {/* =====================================================
            SCAN OPTIONS
        ====================================================== */}

        <div className="ds-cards">

          {/* ===================================================
              SMARTPHONE
          ==================================================== */}

          <div
            className={`ds-card smartphone ${
              selected === "smartphone" ? "selected" : ""
            }`}
            tabIndex={0}
            role="button"
            aria-pressed={selected === "smartphone"}
            onClick={handleSmartphoneClick}
            onKeyDown={(e) =>
              handleKeyDown(e, handleSmartphoneClick)
            }
          >
            <div className="ds-badge accent">
              New
            </div>

            <div className="ds-icon-wrap">
              <div className="ds-icon-ring pulse" />

              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect
                  x="3"
                  y="3"
                  width="7"
                  height="7"
                  rx="1"
                />

                <rect
                  x="14"
                  y="3"
                  width="7"
                  height="7"
                  rx="1"
                />

                <rect
                  x="3"
                  y="14"
                  width="7"
                  height="7"
                  rx="1"
                />

                <path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z" />
              </svg>
            </div>

            <div className="ds-card-title">
              Scan from Smartphone
            </div>

            <div className="ds-card-desc">
              Scan a <strong>QR code</strong> to connect your
              phone — its camera opens instantly for a closer,
              higher-quality scan.
            </div>

            <div className="ds-tag-row">
              {SKIN_TAGS.map((tag) => (
                <span
                  className="ds-tag"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </div>

            <button
              type="button"
              className="ds-card-cta"
              onClick={(e) => {
                e.stopPropagation();
                handleSmartphoneClick();
              }}
            >
              Generate QR Code
            </button>
          </div>

          {/* ===================================================
              THIS DEVICE
          ==================================================== */}

          <div
            className={`ds-card thisdevice ${
              selected === "thisdevice" ? "selected" : ""
            }`}
            tabIndex={0}
            role="button"
            aria-pressed={selected === "thisdevice"}
            onClick={handleThisDeviceClick}
            onKeyDown={(e) =>
              handleKeyDown(e, handleThisDeviceClick)
            }
          >
            <div className="ds-checkmark">
              <svg
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="ds-badge recommended">
              Fastest
            </div>

            <div className="ds-icon-wrap">
              <div className="ds-icon-ring pulse" />

              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 8a2 2 0 0 1 2-2h1.5l1-1.5h7l1 1.5H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />

                <circle
                  cx="12"
                  cy="13"
                  r="3.5"
                />
              </svg>
            </div>

            <div className="ds-card-title">
              Scan on This Device
            </div>

            <div className="ds-card-desc">
              Already on the device you want to scan with?
              Use its camera right here — no extra steps,
              no QR code needed.
            </div>

            <div className="ds-tag-row">
              {SKIN_TAGS.map((tag) => (
                <span
                  className="ds-tag"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </div>

            <button
              type="button"
              className="ds-card-cta"
              onClick={(e) => {
                e.stopPropagation();
                handleThisDeviceClick();
              }}
            >
              Start Scan
            </button>
          </div>

          {/* ===================================================
              DEDICATED DEVICE
          ==================================================== */}

          <div
            className="ds-card device"
            tabIndex={0}
            role="button"
            aria-disabled="true"
            onClick={handleDeviceClick}
            onKeyDown={(e) =>
              handleKeyDown(e, handleDeviceClick)
            }
          >
            <div className="ds-badge">
              Coming Soon
            </div>

            <div className="ds-icon-wrap">
              <div className="ds-icon-ring" />

              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect
                  x="7"
                  y="2"
                  width="10"
                  height="20"
                  rx="2.5"
                />

                <path d="M10 5.5h4" />

                <circle
                  cx="12"
                  cy="17.2"
                  r="1.4"
                />
              </svg>
            </div>

            <div className="ds-card-title">
              Scan from Device
            </div>

            <div className="ds-card-desc">
              A purpose-built handheld scanner for deeper
              diagnostics, including skin cancer and other
              conditions.
            </div>

            <button
              type="button"
              className="ds-card-cta"
              onClick={(e) => {
                e.stopPropagation();
                handleDeviceClick();
              }}
            >
              In Development
            </button>
          </div>

        </div>

        {/* =====================================================
            TOAST
        ====================================================== */}

        <div
          className={`ds-toast ${
            toastVisible ? "show" : ""
          }`}
        >
          This feature is coming soon
        </div>

        {/* =====================================================
            QR MODAL
        ====================================================== */}

        {qrModalOpen && (
          <div
            className="ds-qr-overlay"
            onClick={closeQrModal}
            role="dialog"
            aria-modal="true"
            aria-label="Connect your smartphone"
          >
            <div
              className="ds-qr-modal"
              onClick={(e) => e.stopPropagation()}
            >

              <button
                type="button"
                className="ds-qr-close"
                onClick={closeQrModal}
                aria-label="Close"
              >
                ✕
              </button>

              <div className="ds-qr-title">
                Connect Your Phone
              </div>

              <div className="ds-qr-subtitle">
                Scan this code with your phone's camera
                to open the scanner on your phone.
              </div>

              <div className="ds-qr-frame">

                {sessionId ? (
                  <QRCodeSVG
                    value={qrTargetUrl}
                    size={148}
                    level="H"
                    includeMargin={true}
                  />
                ) : (
                  <div>
                    Creating QR...
                  </div>
                )}

              </div>

              <ol className="ds-qr-steps">

                <li>
                  <span className="ds-step-num">
                    1
                  </span>

                  Open your phone's camera app.
                </li>

                <li>
                  <span className="ds-step-num">
                    2
                  </span>

                  Point it at the QR code and open
                  the link.
                </li>

                <li>
                  <span className="ds-step-num">
                    3
                  </span>

                  Allow camera access when requested.
                </li>

              </ol>

              <div className="ds-qr-status">

                <span className="ds-dot" />

                {phoneStatus === "creating" &&
                  "Creating secure session..."}

                {phoneStatus === "waiting" &&
                  "Waiting for phone to upload image"}

                {phoneStatus === "uploaded" &&
                  "Image received. Opening assessment..."}

                {phoneStatus === "error" &&
                  "Something went wrong. Please try again."}

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}