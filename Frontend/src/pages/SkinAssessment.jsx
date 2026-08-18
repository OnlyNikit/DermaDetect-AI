import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../components/styles/skinassessment.css";
import api from "../api/axios";
import { toast } from "react-toastify";

const QUESTIONS = [
  {
    key: "location",
    heading: "Where is the affected area?",
    type: "single",
    options: [
      "Face",
      "Scalp",
      "Neck",
      "Chest / Back",
      "Hand / Arm",
      "Leg / Foot",
      "Other",
    ],
  },
  {
    key: "duration",
    heading: "How long have you noticed this problem?",
    type: "single",
    options: [
      "Less than 1 week",
      "1–4 weeks",
      "1–6 months",
      "More than 6 months",
      "Not sure",
    ],
  },
  {
    key: "itching",
    heading: "Is the affected area itchy?",
    type: "yesno",
  },
  {
    key: "painBurning",
    heading: "Do you feel pain or burning?",
    type: "single",
    options: ["Yes", "No", "Not sure"],
  },
  {
    key: "changeSpread",
    heading: "Has the affected area changed or spread recently?",
    type: "yesno-followup",
    followupHeading: "What changed?",
    followupOptions: [
      "It became larger",
      "It changed color",
      "It spread to another area",
      "It changed in appearance",
    ],
  },
];

// Sirf female users ko dikhenge, common 5 questions ke baad
const MENSTRUAL_QUESTIONS = [
  {
    key: "worsensAroundPeriod",
    heading: "Does your skin problem get worse around your period?",
    type: "single",
    options: ["Yes", "No", "Not sure"],
  },
  {
    key: "repeatsAroundPeriod",
    heading:
      "Have you noticed similar skin problems repeatedly around your periods?",
    type: "single",
    options: ["Yes", "No", "Not sure"],
  },
];

const OPTIONAL_QUESTIONS = [
  { key: "dryFlaky", heading: "Is the area dry or flaky?" },
  { key: "ringShaped", heading: "Is it circular / ring-shaped?" },
  { key: "raised", heading: "Is it raised?" },
  { key: "fluidPus", heading: "Is there any fluid / pus?" },
  { key: "bleeding", heading: "Is there bleeding?" },
];

const SkinAssessment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const imageUrl = location.state?.imageUrl || null;
  const capturedImage = imageUrl;

  const [gender, setGender] = useState(null);
  const [genderLoaded, setGenderLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [stage, setStage] = useState("preview"); // preview | question | complete | optional
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showFollowup, setShowFollowup] = useState(false);
  const [optionalAnswers, setOptionalAnswers] = useState({});
  const [animKey, setAnimKey] = useState(0);

  // Logged-in user ka gender fetch karo — apna actual "current user" endpoint yahan dalo
  useEffect(() => {
    const fetchGender = async () => {
      try {
        const res = await api.get("/api/user/profile"); // 👈 apna actual endpoint use karo
        setGender(res.data?.user?.gender || null);
      } catch (err) {
        console.error("Could not fetch user gender:", err);
      } finally {
        setGenderLoaded(true);
      }
    };
    fetchGender();
  }, []);

  const isFemale = gender === "Female";

  // Common 5 questions + agar female hai to 2 menstrual questions bhi jud jaate hain
  const activeQuestions = isFemale
    ? [...QUESTIONS, ...MENSTRUAL_QUESTIONS]
    : QUESTIONS;
  const TOTAL_STEPS = activeQuestions.length;

  useEffect(() => {
    if (stage === "question") {
      setAnimKey((k) => k + 1);
    }
  }, [stage, stepIndex]);

  const goToQuestion = (index) => {
    setStepIndex(index);
    setShowFollowup(false);
    setStage("question");
  };

  const handleSingleAnswer = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));

    const currentQ = activeQuestions[stepIndex];

    if (currentQ.type === "yesno-followup" && value === "Yes") {
      setShowFollowup(true);
      return;
    }

    advance();
  };

  const toggleFollowupOption = (option) => {
    setAnswers((prev) => {
      const existing = prev.changeDetails || [];
      const updated = existing.includes(option)
        ? existing.filter((o) => o !== option)
        : [...existing, option];
      return { ...prev, changeDetails: updated };
    });
  };

  const advance = () => {
    if (stepIndex < TOTAL_STEPS - 1) {
      goToQuestion(stepIndex + 1);
    } else {
      setStage("complete");
    }
  };

  const handleOptionalAnswer = (key, value) => {
    setOptionalAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleAnalyzer = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      console.log("========== ANALYZING SKIN ==========");
      console.log("Image:", imageUrl);
      console.log("Answers:", answers);
      console.log("Optional Answers:", optionalAnswers);

      // Backend exactly ye format expect karta hai
      const payload = {
        image: imageUrl,
        answers: answers,
        optionalAnswers: optionalAnswers,
      };

      const response = await api.post("/api/assessment", payload);

      console.log("Assessment response:", response.data);

      const assessmentId = response.data?.assessmentId;

      if (!assessmentId) {
        console.error("Assessment ID missing:", response.data);
        throw new Error("Assessment ID not received from server");
      }

      console.log("Assessment ID:", assessmentId);

      navigate("/skinAssessmentResult", {
        state: {
          assessmentId: assessmentId,
        },
      });
    } catch (err) {
      console.error("Analysis failed:", err.response?.data || err.message);

      toast.error(
        err.response?.data?.message || "Analysis failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gender fetch hone tak wait karo, taaki menstrual questions galat time pe skip/add na ho
  if (!genderLoaded) {
    return (
      <div className="assess-wrapper">
        <div className="assess-card">
          <p className="assess-sub">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="assess-wrapper">
      <div className="assess-card">
        <div className="assess-header">
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            ←
          </button>
          <span>Skin Assessment</span>
        </div>

        {stage === "preview" && (
          <div className="fade-block" key="preview-block">
            <p className="section-label">Your skin image</p>
            <div className="image-frame">
              {capturedImage ? (
                <img src={capturedImage} alt="Captured skin area" />
              ) : (
                <div className="image-placeholder">No image captured</div>
              )}
            </div>

            <h2 className="assess-title">Help us understand this concern</h2>
            <p className="assess-sub">Answer {TOTAL_STEPS} quick questions</p>

            <button className="continue-btn" onClick={() => goToQuestion(0)}>
              Continue →
            </button>
          </div>
        )}

        {stage === "question" && (
          <div className="fade-block" key={`q-${animKey}`}>
            <div className="progress-track">
              {activeQuestions.map((_, i) => (
                <span
                  key={i}
                  className={`progress-dot ${i <= stepIndex ? "active" : ""}`}
                ></span>
              ))}
            </div>

            {!showFollowup ? (
              <>
                <h2 className="question-heading">
                  {activeQuestions[stepIndex].heading}
                </h2>

                {activeQuestions[stepIndex].type === "single" && (
                  <div className="options-list">
                    {activeQuestions[stepIndex].options.map((opt) => (
                      <button
                        key={opt}
                        className={`option-pill ${
                          answers[activeQuestions[stepIndex].key] === opt
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          handleSingleAnswer(
                            activeQuestions[stepIndex].key,
                            opt,
                          )
                        }
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {(activeQuestions[stepIndex].type === "yesno" ||
                  activeQuestions[stepIndex].type === "yesno-followup") && (
                  <div className="yesno-row">
                    <button
                      className={`yesno-btn ${
                        answers[activeQuestions[stepIndex].key] === "Yes"
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleSingleAnswer(
                          activeQuestions[stepIndex].key,
                          "Yes",
                        )
                      }
                    >
                      Yes
                    </button>
                    <button
                      className={`yesno-btn ${
                        answers[activeQuestions[stepIndex].key] === "No"
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleSingleAnswer(activeQuestions[stepIndex].key, "No")
                      }
                    >
                      No
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="question-heading">
                  {activeQuestions[stepIndex].followupHeading}
                </h2>
                <div className="checkbox-list">
                  {activeQuestions[stepIndex].followupOptions.map((opt) => (
                    <label className="checkbox-row" key={opt}>
                      <input
                        type="checkbox"
                        checked={(answers.changeDetails || []).includes(opt)}
                        onChange={() => toggleFollowupOption(opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <button className="continue-btn" onClick={advance}>
                  Continue →
                </button>
              </>
            )}

            <p className="step-counter">
              {stepIndex + 1} of {TOTAL_STEPS}
            </p>
          </div>
        )}

        {stage === "complete" && (
          <div className="fade-block" key="complete-block">
            <div className="complete-icon">✓</div>
            <h2 className="assess-title">Assessment Complete</h2>
            <p className="assess-sub">
              We've collected the basic details needed for your skin analysis.
            </p>

            <ul className="checklist">
              <li>
                Image <span>✓</span>
              </li>
              <li>
                Skin concern <span>✓</span>
              </li>
              <li>
                Symptoms <span>✓</span>
              </li>
            </ul>

            <button
              className="optional-link"
              onClick={() => setStage("optional")}
            >
              Want to add more details? (Optional)
            </button>

            <button className="continue-btn" onClick={handleAnalyzer}>
              Analyze My Skin
            </button>
          </div>
        )}

        {stage === "optional" && (
          <div className="fade-block" key="optional-block">
            <h2 className="assess-title">Additional Details</h2>

            <div className="optional-list">
              {OPTIONAL_QUESTIONS.map((q) => (
                <div className="optional-row" key={q.key}>
                  <p>{q.heading}</p>
                  <div className="yesno-row compact">
                    <button
                      className={`yesno-btn ${
                        optionalAnswers[q.key] === "Yes" ? "selected" : ""
                      }`}
                      onClick={() => handleOptionalAnswer(q.key, "Yes")}
                    >
                      Yes
                    </button>
                    <button
                      className={`yesno-btn ${
                        optionalAnswers[q.key] === "No" ? "selected" : ""
                      }`}
                      onClick={() => handleOptionalAnswer(q.key, "No")}
                    >
                      No
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="optional-actions">
              <button className="skip-btn" onClick={() => setStage("complete")}>
                Skip
              </button>
              <button
                className="continue-btn"
                onClick={() => setStage("complete")}
              >
                Save Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkinAssessment;
