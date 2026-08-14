import { useEffect, useRef, useState } from "react";
import "../components/styles/skinpage.css";

import { useLocation, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
// import GlobalLoader from "../components/common/GlobalLoader";
import Loader2 from "../components/common/Loader2"
import api from "../api/axios";

function severityClass(level) {
  const l = (level || "").toLowerCase();

  if (l === "medium") return "medium";
  if (l === "high") return "high";

  return "";
}

export default function SkinAnalysisResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const assessmentId = location.state?.assessmentId;
  const reportRef = useRef(null);

  const [assessment, setAssessment] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [barWidth, setBarWidth] = useState(0);

  const [generatingReport, setGeneratingReport] = useState(false);

  const hasAnimated = useRef(false);

  // ==========================================
  // HOOK 1: Fetch assessment
  // ==========================================

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        if (!assessmentId) {
          setError("Assessment ID not found");

          setLoading(false);

          return;
        }

        console.log("========== RESULT PAGE ==========");

        console.log("Location state:", location.state);

        console.log("Assessment ID:", assessmentId);

        const response = await api.get(`/assessment/${assessmentId}`);

        console.log("Assessment from DB:", response.data);

        setAssessment(response.data.assessment);
      } catch (err) {
        console.error(
          "Assessment fetch failed:",
          err.response?.data || err.message,
        );

        setError(err.response?.data?.message || "Unable to load assessment");
      } finally {
        setTimeout(() => {
    setLoading(false);
  }, 6000);
      }
    };

    fetchAssessment();
  }, [assessmentId]);

  // ==========================================
  // Calculate confidence safely
  // ==========================================

  const rawConfidence = assessment?.prediction?.confidence ?? 0;

  const confidence = rawConfidence > 1 ? rawConfidence : rawConfidence * 100;

  // ==========================================
  // HOOK 2: Confidence animation
  //
  // IMPORTANT:
  // Ye if/loadaing/error ke BAAD nahi hona chahiye
  // ==========================================

  useEffect(() => {
    if (!assessment) {
      return;
    }

    if (hasAnimated.current) {
      return;
    }

    hasAnimated.current = true;

    const timer = setTimeout(() => {
      setBarWidth(confidence);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [assessment, confidence]);

  // ==========================================
  // Ab conditional returns allowed hain
  // ==========================================

  if (loading) {
    return <Loader2 />;
  }

  if (error) {
    return (
      <div className="skin-result-page">
        <div className="sar-loading">
          <h2>Unable to load result</h2>

          <p>{error}</p>

          <button
            className="sar-btn sar-btn-secondary"
            onClick={() => navigate("/choose=thisdevice")}
          >
            Back to assessment
          </button>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="skin-result-page">
        <div className="sar-loading">
          <h2>Assessment not found</h2>
        </div>
      </div>
    );
  }

  // ==========================================
  // DB DATA
  // ==========================================

  const prediction = assessment.prediction || {};

  const user = assessment.user || {};

  const analyzedDate = assessment.updatedAt || assessment.createdAt;

  const formattedDate = analyzedDate
    ? new Date(analyzedDate).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not available";

  // ==========================================
  // BUTTONS
  // ==========================================

  const handleGenerateReport = async () => {
    if (!reportRef.current || generatingReport) {
      return;
    }

    const reportElement = reportRef.current;

    try {
      setGeneratingReport(true);

      // PDF mode: freezes animations so the capture is crisp, not mid-fade
      reportElement.classList.add("pdf-export");

      // Browser ko styles apply karne ka time
      await new Promise((resolve) => setTimeout(resolve, 150));

      // High-resolution capture — scale 3 keeps text/icons sharp when zoomed
      const canvas = await html2canvas(reportElement, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#f7f9f8",
        logging: false,
        windowWidth: reportElement.scrollWidth,
        windowHeight: reportElement.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);

      // Build a PDF page sized exactly to the content -> always a single page,
      // no matter how tall the report ends up being.
      const pdfWidthMm = 210; // A4 width, keeps the report a familiar page size
      const pdfHeightMm = (canvas.height * pdfWidthMm) / canvas.width;

      const pdf = new jsPDF({
        unit: "mm",
        format: [pdfWidthMm, pdfHeightMm],
        orientation: pdfHeightMm >= pdfWidthMm ? "portrait" : "landscape",
      });

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidthMm, pdfHeightMm);
      pdf.save(`DermaDetect-Report-${assessment._id}.pdf`);
      navigate("/dashboard");
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      reportElement.classList.remove("pdf-export");
      setGeneratingReport(false);
    }
  };

  const handleNewAssessment = () => {
    navigate("/choose=thisdevice");
  };

  const handleBack = () => {
    navigate("/choose=thisdevice");
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="skin-result-page">
      <div className="sar-header">
        <button className="sar-back-btn" onClick={handleBack}>
          ← Back to assessment
        </button>

        <button
          className="sar-download-btn"
          onClick={handleGenerateReport}
          disabled={generatingReport}
        >
          {generatingReport ? "Preparing…" : "↓ Download report"}
        </button>
      </div>

      {/* Only what's inside reportRef gets captured into the PDF —
          buttons and navigation live outside it on purpose. */}
      <div className="sar-report-content" ref={reportRef}>
        <div className="sar-hero">
          <h1>Skin analysis result</h1>

          <p>Prototype AI screening result</p>

          <div className="sar-meta">
            Assessment ID: #{assessment._id}
            {" · "}
            Analyzed {formattedDate}
          </div>
        </div>

        <div className="sar-card sar-delay-1">
          <div className="sar-result-grid">
            <div className="sar-image-panel">
              <div className="sar-frame">
                {assessment.image ? (
                  <img src={assessment.image} alt="Uploaded skin" />
                ) : (
                  <div className="sar-placeholder">
                    Uploaded skin image
                    <br />
                    not available
                  </div>
                )}
              </div>
            </div>

            <div className="sar-info-panel">
              <div>
                <div className="sar-eyebrow">Possible condition</div>

                <div className="sar-condition-name">
                  {prediction.disease || "Not available"}
                </div>
              </div>

              <div className="sar-confidence-row">
                <div className="sar-confidence-label">
                  <span>Confidence</span>

                  <span className="sar-confidence-value">
                    {confidence.toFixed(0)}%
                  </span>
                </div>

                <div className="sar-bar-track">
                  <div
                    className="sar-bar-fill"
                    style={{
                      width: `${barWidth}%`,
                    }}
                  />
                </div>
              </div>

              <div className="sar-severity-row">
                <span className="sar-severity-label">Severity</span>

                <span
                  className={`sar-severity-dot ${severityClass(
                    prediction.severity,
                  )}`}
                />

                <span className="sar-severity-text">
                  {prediction.severity || "Not available"}
                </span>
              </div>

              <div className="sar-status-pill">
                <span className="sar-check">&#10003;</span>

                {assessment.status === "analyzed"
                  ? "Analysis complete"
                  : "Analysis pending"}
              </div>
            </div>
          </div>
        </div>

        <div className="sar-card sar-delay-2">
          <div className="sar-card-title">Patient information</div>

          <div className="sar-summary-grid">
            <div className="sar-summary-item">
              <div className="sar-field-label">Full name</div>

              <div className="sar-field-value">
                {user.fullName || "Not available"}
              </div>
            </div>

            <div className="sar-summary-item">
              <div className="sar-field-label">Age</div>

              <div className="sar-field-value">
                {user.age ?? "Not available"}
              </div>
            </div>

            <div className="sar-summary-item">
              <div className="sar-field-label">Gender</div>

              <div className="sar-field-value">
                {user.gender || "Not available"}
              </div>
            </div>
          </div>
        </div>

        <div className="sar-card sar-delay-2">
          <div className="sar-card-title">Assessment summary</div>

          <div className="sar-summary-grid">
            <div className="sar-summary-item">
              <div className="sar-field-label">Affected area</div>

              <div className="sar-field-value">
                {assessment.location || "Not available"}
              </div>
            </div>

            <div className="sar-summary-item">
              <div className="sar-field-label">Duration</div>

              <div className="sar-field-value">
                {assessment.duration || "Not available"}
              </div>
            </div>

            <div className="sar-summary-item">
              <div className="sar-field-label">Itching</div>

              <div className="sar-field-value">
                {assessment.itching || "Not available"}
              </div>
            </div>

            <div className="sar-summary-item">
              <div className="sar-field-label">Pain / burning</div>

              <div className="sar-field-value">
                {assessment.painBurning || "Not available"}
              </div>
            </div>

            <div className="sar-summary-item">
              <div className="sar-field-label">Change / spread</div>

              <div className="sar-field-value">
                {assessment.changeSpread || "Not available"}
              </div>
            </div>

            <div className="sar-summary-item">
              <div className="sar-field-label">Changes</div>

              <div className="sar-field-value">
                {assessment.changeDetails?.length
                  ? assessment.changeDetails.join(", ")
                  : "None"}
              </div>
            </div>

            {assessment.optionalDetails &&
              Object.entries(assessment.optionalDetails).map(([key, value]) => (
                <div className="sar-summary-item" key={key}>
                  <div className="sar-field-label">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </div>

                  <div className="sar-field-value">
                    {value || "Not answered"}
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="sar-card sar-delay-3">
          <div className="sar-card-title">What the result means</div>

          <div className="sar-explanation-body">
            {assessment.explanation ||
              "The screening result is based on the submitted image and assessment responses. It is intended to provide a preliminary screening indication only."}
          </div>
        </div>

        <div className="sar-card sar-delay-4">
          <div className="sar-disclaimer">
            <span className="sar-icon">&#9888;</span>

            <p>
              <strong>Important:</strong> This is a prototype AI screening
              result and is not a medical diagnosis. Please consult a qualified
              dermatologist for an accurate diagnosis and treatment.
            </p>
          </div>
        </div>
      </div>

      {/* Deliberately outside reportRef — never appears in the PDF */}
      <div className="sar-actions">
        <button
          className="sar-btn sar-btn-primary"
          onClick={handleGenerateReport}
          disabled={generatingReport}
        >
          {generatingReport ? "Preparing…" : "Generate report"}
        </button>

        <button
          className="sar-btn sar-btn-secondary"
          onClick={handleNewAssessment}
        >
          New assessment
        </button>
      </div>
    </div>
  );
}
