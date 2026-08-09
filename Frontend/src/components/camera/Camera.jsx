import React from "react";
import { useRef, useState } from "react";
import "../styles/camera.css";
import { uploadImage } from "../services/api";
import { useNavigate } from "react-router-dom";

function Camera() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  const openCamera = async () => {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = cameraStream;
      setStream(cameraStream);
      setCameraOn(true);
      setError(null);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setError(error);
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/png");
    setCapturedImage(imageData);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraOn(false);
  };

  const retakeImage = async () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setCapturedImage(null);
    openCamera();
  };

  const useThisImage = async () => {
    /* ============ BACKEND HOOK: USE CAPTURED IMAGE ============
       `capturedImage` is a base64 PNG data URL. Send it to the scan/ML
       endpoint here (or lift it up via a prop callback), e.g.
       onImageConfirmed(capturedImage);
       fetch('/api/scan', { method:'POST', body: JSON.stringify({ image: capturedImage }) })
    */
    try {
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      const file = new File([blob], "skin-image.png", {
        type: "image/png",
      });

      //backend
      const result = await uploadImage(file);
      console.log("server response", result);
      navigate("/skinAssessment", { state: { imageUrl: result.imageUrl } });
    } catch (err) {
      console.log("uplod failed", err);
    }
  };
  const useDemoImage = async () => {
    try {
      const response = await fetch("/demo/skin-scan.png");

      const blob = await response.blob();

      const file = new File([blob], "demo-skin-image.png", {
        type: "image/png",
      });

      const result = await uploadImage(file);

      console.log("Demo image uploaded:", result);

      navigate("/skinAssessment", {
        state: {
          imageUrl: result.imageUrl,
        },
      });
    } catch (error) {
      console.error("Demo image upload failed:", error);
    }
  };

  return (
    <div className="camera-widget">
      {/* status pill */}
      <div className="camera-status">
        <span className={`status-dot ${cameraOn ? "status-dot--live" : ""}`} />
        <span className="status-text">
          {capturedImage ? "Preview" : cameraOn ? "Camera live" : "Camera idle"}
        </span>
      </div>

      {/* viewfinder — live video, placeholder, AND the captured preview all live here */}
      <div
        className={`viewfinder ${cameraOn ? "viewfinder--active" : ""} ${capturedImage ? "viewfinder--preview" : ""}`}
      >
        <span className="corner corner--tl" />
        <span className="corner corner--tr" />
        <span className="corner corner--bl" />
        <span className="corner corner--br" />

        {cameraOn && !capturedImage && <div className="scan-line" />}

        {!cameraOn && !capturedImage && (
          <div className="viewfinder-placeholder">
            <svg
              className="placeholder-icon"
              viewBox="0 0 24 24"
              width="40"
              height="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4 7h2.5l1-1.5h9l1 1.5H20a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            <p>Position the affected area in frame</p>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="camera-video"
          style={{ display: cameraOn && !capturedImage ? "block" : "none" }}
        />

        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured"
            className="camera-video camera-preview-img"
          />
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {error && (
        <p className="camera-error">Error accessing camera: {error.message}</p>
      )}

      <div className="camera-actions">
        {!cameraOn && !capturedImage && (
          <button className="btn btn--primary" onClick={openCamera}>
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 7h2.5l1-1.5h9l1 1.5H20a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            Scan on device
          </button>
        )}

        {cameraOn && !capturedImage && (
          <button className="btn btn--secondary" onClick={captureImage}>
            <span className="shutter-ring" />
            Capture image
          </button>
        )}

        {capturedImage && (
          <>
            <button
              type="button"
              className="btn btn--outline"
              onClick={retakeImage}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 4v5h5" />
                <path d="M4.5 9A8 8 0 1 1 6 15.5" />
              </svg>
              Retake
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={useThisImage}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Continue
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={useDemoImage}
            >
              Use demo image
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Camera;
