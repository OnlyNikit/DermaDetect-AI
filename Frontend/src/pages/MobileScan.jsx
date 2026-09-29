import { useEffect, useRef, useState, useCallback } from "react";

import { useParams } from "react-router-dom";

import api from "../api/axios";

import "../components/styles/mobilescan..css";

export default function MobileScan() {
  const { sessionId } = useParams();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [status, setStatus] = useState("loading");

  const [capturedImage, setCapturedImage] = useState(null);

  const [error, setError] = useState("");

  // =====================================
  // STOP CAMERA
  // =====================================
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }
  }, []);

  // =====================================
  // OPEN CAMERA
  // =====================================
  const openCamera = useCallback(async () => {
    try {
      setStatus("loading");
      setError("");

      stopStream();

      console.log("Opening camera...");

      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: "environment",
          },
        },
        audio: false,
      });

      console.log("Camera stream received:", cameraStream);

      streamRef.current = cameraStream;

      setStatus("camera");
    } catch (err) {
      console.error("CAMERA ERROR:", err);

      setError(`${err.name}: ${err.message || "Unable to access camera"}`);

      setStatus("error");
    }
  }, [stopStream]);

  // =====================================
  // ATTACH STREAM TO VIDEO
  // =====================================
  useEffect(() => {
    if (status === "camera" && videoRef.current && streamRef.current) {
      console.log("Attaching stream to video");

      videoRef.current.srcObject = streamRef.current;

      videoRef.current
        .play()
        .then(() => {
          console.log("Camera video playing");
        })
        .catch((err) => {
          console.error("Video play error:", err);
        });
    }
  }, [status]);

  // =====================================
  // OPEN CAMERA ON PAGE LOAD
  // =====================================
  useEffect(() => {
    if (!sessionId) {
      setError("Invalid scan session");

      setStatus("error");

      return;
    }

    openCamera();

    return () => {
      stopStream();
    };
  }, [sessionId, openCamera, stopStream]);

  // =====================================
  // CAPTURE IMAGE
  // =====================================
  const captureImage = () => {
    const video = videoRef.current;

    const canvas = canvasRef.current;

    if (!video || !canvas) {
      console.error("Video or canvas not available");

      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      setError("Camera is still loading. Please try again.");

      return;
    }

    canvas.width = video.videoWidth;

    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg", 0.9);

    setCapturedImage(imageData);

    stopStream();

    setStatus("preview");
  };

  // =====================================
  // RETAKE IMAGE
  // =====================================
  const retakeImage = async () => {
    setCapturedImage(null);
    setError("");

    await openCamera();
  };

  // =====================================
  // UPLOAD IMAGE
  // =====================================
  const uploadImage = async () => {
    if (!capturedImage || !sessionId) {
      return;
    }

    try {
      setStatus("uploading");
      setError("");

      // ---------------------------------
      // BASE64 → BLOB
      // ---------------------------------
      const blobResponse = await fetch(capturedImage);

      const blob = await blobResponse.blob();

      // ---------------------------------
      // FORM DATA
      // ---------------------------------
      const formData = new FormData();

      formData.append(
        "image",
        new File([blob], "phone-skin-image.jpg", {
          type: "image/jpeg",
        }),
      );

      console.log("Uploading image for session:", sessionId);

      // ---------------------------------
      // SEND TO BACKEND
      // ---------------------------------
      const response = await api.post(
        `/api/phone-upload/${sessionId}`,
        formData,
      );

      console.log("Phone upload response:", response.data);

      const result = response.data;

      // =================================
      // INVALID IMAGE
      // =================================
      if (result.status === "invalid_image") {
        setError(result.message || "Please upload a clear skin image.");

        setStatus("invalid_image");

        return;
      }

      // =================================
      // NORMAL SKIN
      // =================================
      if (result.status === "normal_skin") {
        setError(result.message || "No apparent skin disease detected.");

        setStatus("normal_skin");

        return;
      }

      // =================================
      // VALID SKIN
      // =================================
      if (result.status === "uploaded") {
        setStatus("success");

        return;
      }

      // =================================
      // FAILED
      // =================================
      setError(result.message || "Unable to validate image.");

      setStatus("error");
    } catch (err) {
      console.error("UPLOAD FAILED:", err);

      console.error("Response:", err.response?.data);

      console.error("Status:", err.response?.status);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Upload failed. Please try again.",
      );

      setStatus("error");
    }
  };

  // =====================================
  // RENDER
  // =====================================
  return (
    <div className="mscan">
      {/* =================================
          HEADER
      ================================== */}
      <header className="mscan__header">
        <div className="mscan__logo-dot" />

        <div>
          <h1 className="mscan__title">Scan Image</h1>

          <p className="mscan__subtitle">Linked from laptop screen</p>
        </div>
      </header>

      <main className="mscan__body">
        {/* =================================
            LOADING
        ================================== */}
        {status === "loading" && (
          <div className="mscan__state">
            <div className="mscan__spinner" />

            <p className="mscan__state-text">Opening camera...</p>
          </div>
        )}

        {/* =================================
            CAMERA
        ================================== */}
        {status === "camera" && (
          <div className="mscan__camera-wrap">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="mscan__video"
            />

            <div className="mscan__frame">
              <span className="mscan__corner mscan__corner--tl" />

              <span className="mscan__corner mscan__corner--tr" />

              <span className="mscan__corner mscan__corner--bl" />

              <span className="mscan__corner mscan__corner--br" />
            </div>

            <p className="mscan__hint">
              Keep the affected area inside the frame
            </p>
          </div>
        )}

        {/* =================================
            PREVIEW
        ================================== */}
        {status === "preview" && capturedImage && (
          <div className="mscan__preview-wrap">
            <img
              src={capturedImage}
              alt="Captured skin"
              className="mscan__preview-img"
            />
          </div>
        )}

        {/* =================================
            UPLOADING / VALIDATING
        ================================== */}
        {status === "uploading" && capturedImage && (
          <div className="mscan__preview-wrap">
            <img
              src={capturedImage}
              alt="Checking skin"
              className="mscan__preview-img mscan__preview-img--dim"
            />

            <div className="mscan__upload-overlay">
              <div className="mscan__spinner mscan__spinner--light" />

              <p className="mscan__state-text mscan__state-text--light">
                Checking image...
              </p>
            </div>
          </div>
        )}

        {/* =================================
            VALID IMAGE
        ================================== */}
        {status === "success" && (
          <div className="mscan__state">
            <div className="mscan__success-icon">
              <svg viewBox="0 0 52 52" width="56" height="56">
                <circle
                  cx="26"
                  cy="26"
                  r="25"
                  fill="none"
                  className="mscan__success-circle"
                />

                <path
                  fill="none"
                  className="mscan__success-check"
                  d="M14 27l7 7 17-17"
                />
              </svg>
            </div>

            <p className="mscan__state-title">Image accepted!</p>

            <p className="mscan__state-text">
              Go back to your laptop to continue the assessment.
            </p>
          </div>
        )}

        {/* =================================
            NORMAL SKIN
        ================================== */}
        {status === "normal_skin" && (
          <div className="mscan__state">
            <div className="mscan__error-icon">!</div>

            <p className="mscan__state-title">Normal skin detected</p>

            <p className="mscan__state-text">
              {error || "No apparent skin disease detected."}
            </p>

            <button
              className="mscan__btn mscan__btn--primary"
              onClick={retakeImage}
            >
              Scan Again
            </button>
          </div>
        )}

        {/* =================================
            INVALID IMAGE
        ================================== */}
        {status === "invalid_image" && (
          <div className="mscan__state">
            <div className="mscan__error-icon">!</div>

            <p className="mscan__state-title">Invalid image</p>

            <p className="mscan__state-text">
              {error || "Please upload a clear skin image."}
            </p>

            <button
              className="mscan__btn mscan__btn--primary"
              onClick={retakeImage}
            >
              Try Another Image
            </button>
          </div>
        )}

        {/* =================================
            GENERAL ERROR
        ================================== */}
        {status === "error" && (
          <div className="mscan__state">
            <div className="mscan__error-icon">!</div>

            <p className="mscan__state-title">Something went wrong</p>

            <p className="mscan__state-text">{error}</p>

            <button
              className="mscan__btn mscan__btn--primary"
              onClick={openCamera}
            >
              Try Again
            </button>
          </div>
        )}
      </main>

      {/* =================================
          CAPTURE BUTTON
      ================================== */}
      {status === "camera" && (
        <div className="mscan__controls">
          <button
            className="mscan__capture-btn"
            onClick={captureImage}
            aria-label="Capture image"
          >
            <span className="mscan__capture-btn-inner" />
          </button>
        </div>
      )}

      {/* =================================
          PREVIEW BUTTONS
      ================================== */}
      {status === "preview" && (
        <div className="mscan__controls mscan__controls--row">
          <button
            className="mscan__btn mscan__btn--secondary"
            onClick={retakeImage}
          >
            Retake
          </button>

          <button
            className="mscan__btn mscan__btn--primary"
            onClick={uploadImage}
          >
            Use This Image
          </button>
        </div>
      )}

      {/* =================================
          HIDDEN CANVAS
      ================================== */}
      <canvas
        ref={canvasRef}
        style={{
          display: "none",
        }}
      />
    </div>
  );
}
