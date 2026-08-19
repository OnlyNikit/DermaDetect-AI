import React from "react";
import { useRef, useState } from "react";
import "../styles/camera.css";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function Camera() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const openCamera = async () => {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
       video: {
          facingMode: {
            ideal: "environment",
          },
        },
        audio: false,
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
    setError(null);
    openCamera();
  };

  // Shared helper: takes a Blob, uploads it to our backend, returns the uploads URL
  const uploadToServer = async (blob, filename) => {
    const file = new File([blob], filename, { type: "image/png" });

    const formData = new FormData();
    formData.append("image", file); // field name must match upload.single("image")

    const response = await api.post("/api/upload", formData);

    if (!response.data?.success || !response.data?.imageUrl) {
      throw new Error("Upload failed");
    }

    return response.data.imageUrl;
  };
const useThisImage = async () => {
  if (uploading || !capturedImage) return;

  try {
    setUploading(true);
    setError(null);

    let blob;
    let filename;

    if (selectedFile) {
      blob = selectedFile;
      filename = selectedFile.name;
    } else {
      const blobResponse = await fetch(capturedImage);
      blob = await blobResponse.blob();
      filename = "skin-image.png";
    }

    const imageUrl = await uploadToServer(blob, filename);

    console.log("Uploaded image URL:", imageUrl);

    navigate("/skinAssessment", {
      state: { imageUrl },
    });
  } catch (err) {
    console.error("Upload failed:", err);
    setError("Unable to upload image. Please try again.");
  } finally {
    setUploading(false);
  }
};

  const useDemoImage = async () => {
    if (uploading) return;

    try {
      setUploading(true);
      setError(null);

      const blobResponse = await fetch("/demo/skin-scan.png");
      const blob = await blobResponse.blob();

      const imageUrl = await uploadToServer(blob, "demo-skin-image.png");

      console.log("Uploaded demo image URL:", imageUrl);

      navigate("/skinAssessment", {
        state: { imageUrl },
      });
    } catch (error) {
      console.error("Demo image upload failed:", error);
      setError("Unable to upload demo image.");
    } finally {
      setUploading(false);
    }
  };
  const handleFileChange = (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setError("Please select a valid image file.");
    return;
  }

  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }

  const imagePreview = URL.createObjectURL(file);

  setSelectedFile(file);
  setCapturedImage(imagePreview);
  setCameraOn(false);
  setError(null);
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
        <p className="camera-error">
          {typeof error === "string"
            ? error
            : `Error accessing camera: ${error.message}`}
        </p>
      )}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <div className="camera-actions">
        {!cameraOn && !capturedImage && (
          <>
            <button className="btn btn--primary" onClick={openCamera}>
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 7h2.5l1-1.5h9l1 1.5H20a1 1 0 0 1 1 1v10a1 1 0 0 1 1-1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
              Scan on device
            </button>

            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose file
            </button>
          </>
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
              disabled={uploading}
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
              disabled={uploading}
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
              {uploading ? "Uploading…" : "Continue"}
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={useDemoImage}
              disabled={uploading}
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
