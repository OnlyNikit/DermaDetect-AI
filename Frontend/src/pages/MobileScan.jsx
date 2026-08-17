import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import "../components/styles/mobilescan..css";

export default function MobileScan() {
  const { sessionId } = useParams();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // "loading" | "camera" | "preview" | "uploading" | "success" | "error"
  const [status, setStatus] = useState("loading");
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState("");

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const openCamera = useCallback(async () => {
    try {
      setStatus("loading");
      setError("");
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = cameraStream;
      if (videoRef.current) {
        videoRef.current.srcObject = cameraStream;
      }
      setStatus("camera");
    } catch (err) {
      console.error(err);
      setError(
        "Camera access denied or unavailable. Please allow camera permission.",
      );
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    openCamera();
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(imageData);
    stopStream();
    setStatus("preview");
  };

  const retakeImage = async () => {
    setCapturedImage(null);
    await openCamera();
  };

  const uploadImage = async () => {
    if (!capturedImage) return;
    try {
      setStatus("uploading");
      setError("");

      const blobResponse = await fetch(capturedImage);
      const blob = await blobResponse.blob();
      const formData = new FormData();
      formData.append(
        "image",
        new File([blob], "phone-skin-image.jpg", { type: "image/jpeg" }),
      );

      await api.post(`/phone-upload/${sessionId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatus("success");
    } catch (err) {
      console.error("Upload failed:", err); // add/check this line
      console.error("Response data:", err.response?.data); // add this too
      console.error("Status:", err.response?.status);
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
      {/* ---------- Header ---------- */}
      <header className="mscan__header">
        <div className="mscan__logo-dot" />
        <div>
          <h1 className="mscan__title">Scan Image</h1>
          <p className="mscan__subtitle">Linked from laptop screen</p>
        </div>
      </header>

      <main className="mscan__body">
        {/* ---------- Loading ---------- */}
        {status === "loading" && (
          <div className="mscan__state">
            <div className="mscan__spinner" />
            <p className="mscan__state-text">Opening camera...</p>
          </div>
        )}

        {/* ---------- Camera / Viewfinder ---------- */}
        {status === "camera" && (
          <div className="mscan__camera-wrap">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="mscan__video"
            />

            {/* viewfinder guide overlay */}
            <div className="mscan__frame">
              <span className="mscan__corner mscan__corner--tl" />
              <span className="mscan__corner mscan__corner--tr" />
              <span className="mscan__corner mscan__corner--bl" />
              <span className="mscan__corner mscan__corner--br" />
            </div>

            <p className="mscan__hint">Keep the image inside the frame</p>
          </div>
        )}

        {/* ---------- Preview ---------- */}
        {status === "preview" && capturedImage && (
          <div className="mscan__preview-wrap">
            <img
              src={capturedImage}
              alt="Captured"
              className="mscan__preview-img"
            />
          </div>
        )}

        {/* ---------- Uploading ---------- */}
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

        {/* ---------- Success ---------- */}
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
            <p className="mscan__state-title">Upload complete!</p>
            <p className="mscan__state-text">
              You can now go back to your laptop screen.
            </p>
          </div>
        )}

        {/* ---------- Error ---------- */}
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

      {/* ---------- Bottom controls ---------- */}
      {status === "camera" && (
        <div className="mscan__controls">
          <button
            className="mscan__capture-btn"
            onClick={captureImage}
            aria-label="Capture"
          >
            <span className="mscan__capture-btn-inner" />
          </button>
        </div>
      )}

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

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}