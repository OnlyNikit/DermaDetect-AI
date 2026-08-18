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

  // Stop camera
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }
  }, []);

  // Open camera
  const openCamera = useCallback(async () => {
    try {
      setStatus("loading");
      setError("");

      // Agar pehle se camera open hai
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

      // Stream save karo
      streamRef.current = cameraStream;

      // Video element ab render hoga
      setStatus("camera");
    } catch (err) {
      console.error("CAMERA ERROR:", err);

      setError(
        `${err.name}: ${err.message || "Unable to access camera"}`,
      );

      setStatus("error");
    }
  }, [stopStream]);

  // IMPORTANT:
  // Video element render hone ke baad stream attach karo
  useEffect(() => {
    if (
      status === "camera" &&
      videoRef.current &&
      streamRef.current
    ) {
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

  // Open camera when page loads
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

  // Capture image
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

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    const imageData = canvas.toDataURL(
      "image/jpeg",
      0.9,
    );

    setCapturedImage(imageData);

    // Camera band karo
    stopStream();

    setStatus("preview");
  };

  // Retake image
  const retakeImage = async () => {
    setCapturedImage(null);

    await openCamera();
  };

  // Upload image to backend
  const uploadImage = async () => {
    if (!capturedImage || !sessionId) return;

    try {
      setStatus("uploading");
      setError("");

      // Base64 image -> Blob
      const blobResponse = await fetch(capturedImage);
      const blob = await blobResponse.blob();

      const formData = new FormData();

      formData.append(
        "image",
        new File(
          [blob],
          "phone-skin-image.jpg",
          {
            type: "image/jpeg",
          },
        ),
      );

      console.log(
        "Uploading image for session:",
        sessionId,
      );

      const response = await api.post(
        `/api/phone-upload/${sessionId}`,
        formData,
      );

      console.log(
        "Upload successful:",
        response.data,
      );

      setStatus("success");
    } catch (err) {
      console.error("UPLOAD FAILED:", err);
      console.error(
        "Response:",
        err.response?.data,
      );
      console.error(
        "Status:",
        err.response?.status,
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Upload failed. Please try again.",
      );

      setStatus("error");
    }
  };

  return (
    <div className="mscan">

      {/* Header */}
      <header className="mscan__header">
        <div className="mscan__logo-dot" />

        <div>
          <h1 className="mscan__title">
            Scan Image
          </h1>

          <p className="mscan__subtitle">
            Linked from laptop screen
          </p>
        </div>
      </header>

      <main className="mscan__body">

        {/* Loading */}
        {status === "loading" && (
          <div className="mscan__state">
            <div className="mscan__spinner" />

            <p className="mscan__state-text">
              Opening camera...
            </p>
          </div>
        )}

        {/* Camera */}
        {status === "camera" && (
          <div className="mscan__camera-wrap">

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="mscan__video"
            />

            {/* Camera frame */}
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

        {/* Preview */}
        {status === "preview" && capturedImage && (
          <div className="mscan__preview-wrap">

            <img
              src={capturedImage}
              alt="Captured skin"
              className="mscan__preview-img"
            />

          </div>
        )}

        {/* Uploading */}
        {status === "uploading" && (
          <div className="mscan__preview-wrap">

            <img
              src={capturedImage}
              alt="Uploading"
              className="mscan__preview-img mscan__preview-img--dim"
            />

            <div className="mscan__upload-overlay">

              <div className="mscan__spinner mscan__spinner--light" />

              <p className="mscan__state-text mscan__state-text--light">
                Uploading...
              </p>

            </div>

          </div>
        )}

        {/* Success */}
        {status === "success" && (
          <div className="mscan__state">

            <div className="mscan__success-icon">
              <svg
                viewBox="0 0 52 52"
                width="56"
                height="56"
              >
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

            <p className="mscan__state-title">
              Upload complete!
            </p>

            <p className="mscan__state-text">
              You can now go back to your laptop screen.
            </p>

          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="mscan__state">

            <div className="mscan__error-icon">
              !
            </div>

            <p className="mscan__state-title">
              Something went wrong
            </p>

            <p className="mscan__state-text">
              {error}
            </p>

            <button
              className="mscan__btn mscan__btn--primary"
              onClick={openCamera}
            >
              Try Again
            </button>

          </div>
        )}

      </main>

      {/* Capture button */}
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

      {/* Preview buttons */}
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

      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
      />

    </div>
  );
}