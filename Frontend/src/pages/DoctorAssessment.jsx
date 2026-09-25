import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import "../components/styles/doctorpages.css";

export default function DoctorAssessment() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (assessmentId) {
      fetchAssessment();
    }
  }, [assessmentId]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/api/doctor/assessment/${assessmentId}`
      );

      setAssessment(
        response.data?.assessment || null
      );

    } catch (error) {
      console.error(
        "DOCTOR ASSESSMENT ERROR:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Unable to load patient report."
      );
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="doctor-page">
        <div className="doctor-container">
          <div className="doctor-loading">
            <div className="doctor-spinner"></div>
            <p>
              Loading patient report...
            </p>
          </div>
        </div>
      </div>
    );
  }


  if (error || !assessment) {
    return (
      <div className="doctor-page">
        <div className="doctor-container">

          <div className="doctor-page-header">

            <div>
              <span className="doctor-eyebrow">
                Patient Assessment
              </span>

              <h1>
                Report unavailable
              </h1>
            </div>

            <button
              className="doctor-btn doctor-btn-secondary"
              onClick={() =>
                navigate("/doctor-dashboard")
              }
            >
              ← Dashboard
            </button>

          </div>


          <div className="doctor-card">

            <div className="doctor-empty">

              <div className="doctor-empty-icon">
                📄
              </div>

              <h3>
                Patient report unavailable
              </h3>

              <p>
                {error ||
                  "Assessment not found."}
              </p>

            </div>

          </div>

        </div>
      </div>
    );
  }


  const prediction =
    assessment.prediction || {};

  const confidence =
    prediction.confidence != null
      ? `${Math.round(
          prediction.confidence * 100
        )}%`
      : "—";


  return (
    <div className="doctor-page">

      <div className="doctor-container">

        {/* HEADER */}

        <div className="doctor-page-header">

          <div>
            <span className="doctor-eyebrow">
              Patient Assessment
            </span>

            <h1>
              AI Skin Assessment
            </h1>

            <p>
              Review the patient's AI-generated
              skin analysis report.
            </p>
          </div>

          <button
            className="doctor-btn doctor-btn-secondary"
            onClick={() =>
              navigate("/doctor-dashboard")
            }
          >
            ← Dashboard
          </button>

        </div>


        {/* RESULT */}

        <div className="assessment-result-grid">

          {/* IMAGE */}

          <div className="doctor-card">

            <h2>
              Patient Image
            </h2>

            <p className="doctor-card-subtitle">
              Image submitted for AI analysis.
            </p>

            {assessment.image ? (

              <img
                className="assessment-large-image"
                src={assessment.image}
                alt="Patient skin assessment"
              />

            ) : (

              <div className="assessment-image-empty">
                No image available
              </div>

            )}

          </div>


          {/* PREDICTION */}

          <div className="doctor-card">

            <div className="assessment-header">

              <div>
                <h2>
                  AI Analysis
                </h2>

                <p className="doctor-card-subtitle">
                  Generated from the patient's
                  submitted skin image.
                </p>
              </div>

              <span className="assessment-ai-badge">
                AI Analysis
              </span>

            </div>


            <div className="prediction-main">

              <span className="prediction-label">
                Detected condition
              </span>

              <h2 className="prediction-disease">
                {prediction.disease ||
                  "Not available"}
              </h2>

            </div>


            <div className="prediction-grid">

              <div className="prediction-box">

                <span>
                  Confidence
                </span>

                <strong>
                  {confidence}
                </strong>

              </div>


              <div className="prediction-box">

                <span>
                  Severity
                </span>

                <strong>
                  {prediction.severity ||
                    "—"}
                </strong>

              </div>


              <div className="prediction-box">

                <span>
                  Assessment Date
                </span>

                <strong>
                  {assessment.createdAt
                    ? new Date(
                        assessment.createdAt
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "—"}
                </strong>

              </div>

            </div>

          </div>

        </div>


        {/* PATIENT ANSWERS */}

        <div className="doctor-card">

          <h2>
            Patient Information
          </h2>

          <p className="doctor-card-subtitle">
            Information provided during the
            assessment.
          </p>


          <div className="patient-assessment-grid">

            <div className="assessment-detail">
              <span>
                Location
              </span>

              <strong>
                {assessment.location ||
                  "—"}
              </strong>
            </div>


            <div className="assessment-detail">
              <span>
                Duration
              </span>

              <strong>
                {assessment.duration ||
                  "—"}
              </strong>
            </div>


            <div className="assessment-detail">
              <span>
                Itching
              </span>

              <strong>
                {assessment.itching ||
                  "—"}
              </strong>
            </div>


            <div className="assessment-detail">
              <span>
                Pain / Burning
              </span>

              <strong>
                {assessment.painBurning ||
                  "—"}
              </strong>
            </div>


            <div className="assessment-detail">
              <span>
                Change / Spread
              </span>

              <strong>
                {assessment.changeSpread ||
                  "—"}
              </strong>
            </div>

          </div>

        </div>


        {/* CHANGE DETAILS */}

        {assessment.changeDetails?.length > 0 && (

          <div className="doctor-card">

            <h2>
              Changes Reported
            </h2>

            <div className="tag-list">

              {assessment.changeDetails.map(
                (item, index) => (

                  <span
                    className="assessment-tag"
                    key={index}
                  >
                    {item}
                  </span>

                )
              )}

            </div>

          </div>

        )}


        {/* OPTIONAL DETAILS */}

        {assessment.optionalDetails &&
          Object.keys(
            assessment.optionalDetails
          ).length > 0 && (

            <div className="doctor-card">

              <h2>
                Additional Information
              </h2>

              <div className="patient-assessment-grid">

                {Object.entries(
                  assessment.optionalDetails
                ).map(
                  ([key, value]) => (

                    <div
                      className="assessment-detail"
                      key={key}
                    >
                      <span>
                        {key}
                      </span>

                      <strong>
                        {Array.isArray(value)
                          ? value.join(", ")
                          : String(value)}
                      </strong>
                    </div>

                  )
                )}

              </div>

            </div>

          )}

      </div>

    </div>
  );
}