import React from "react";
import { useRef, useState } from "react";
import "../styles/camera.css";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from "../context/ToastContext";

function Camera({
  onValidationStart,
  onValidationEnd,
}) {
  const navigate = useNavigate();

  const {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  } = useToast();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // =========================
  // OPEN CAMERA
  // =========================

  const openCamera = async () => {
    try {
      setError(null);

      const cameraStream =
        await navigator.mediaDevices.getUserMedia({
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
    } catch (error) {
      console.error(
        "Error accessing camera:",
        error
      );

      setError(
        "Unable to access camera. Please allow camera permission."
      );

      showError(
        "Camera access was blocked. Please allow camera permission and try again."
      );
    }
  };

  // =========================
  // CAPTURE IMAGE
  // =========================

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const imageData =
      canvas.toDataURL("image/png");

    setCapturedImage(imageData);
    setSelectedFile(null);

    if (stream) {
      stream
        .getTracks()
        .forEach((track) => track.stop());
    }

    setStream(null);
    setCameraOn(false);
  };

  // =========================
  // RETAKE IMAGE
  // =========================

  const retakeImage = async () => {
    if (uploading) return;

    if (stream) {
      stream
        .getTracks()
        .forEach((track) => track.stop());
    }

    setStream(null);
    setCapturedImage(null);
    setSelectedFile(null);
    setError(null);

    await openCamera();
  };

  // =========================
  // UPLOAD IMAGE TO SERVER
  // =========================

  const uploadToServer = async (
    blob,
    filename
  ) => {
    const file = new File(
      [blob],
      filename,
      {
        type: blob.type || "image/png",
      }
    );

    const formData = new FormData();

    formData.append(
      "image",
      file
    );

    const response = await api.post(
      "/api/upload",
      formData
    );

    if (
      !response.data?.success ||
      !response.data?.imageUrl
    ) {
      throw new Error(
        "Upload failed"
      );
    }

    return response.data.imageUrl;
  };

  // =========================
  // VALIDATE IMAGE
  // =========================

  const validateImage = async (
    imageUrl
  ) => {
    const response = await api.post(
      "/api/assessment/validate-image",
      {
        imageUrl,
      }
    );
    console.log("VALIDATION API RESPONSE:", response.data);

    if (!response.data?.success) {
      throw new Error(
        response.data?.message ||
          "Please try again with a clear photo."
      );
    }

    return response.data;
  };

  // =========================
  // HANDLE VALIDATION RESULT
  // =========================

  const handleValidationResult = (
    validationResult,
    imageUrl
  ) => {
    console.log(
      "Validation result:",
      validationResult
    );

    const {
      status,
      message,
    } = validationResult;

    // --------------------------------
    // INVALID / NON-SKIN IMAGE
    // --------------------------------

    if (status === "invalid_image") {
      const userMessage =
        "Please upload a clear photo of the affected skin area. The current image doesn't appear to show skin clearly.";

      setError(
        message || userMessage
      );

      showWarning(
        message || userMessage
      );

      return;
    }

    // --------------------------------
    // NORMAL SKIN
    // --------------------------------

    if (status === "normal_skin") {
      const userMessage =
        "No visible signs of the supported skin conditions were detected. If you're experiencing a skin problem, try a clear photo of the affected area.";

      setError(
        message || userMessage
      );

      showInfo(
        message || userMessage
      );

      return;
    }

    // --------------------------------
    // VALID DISEASE-LIKE SKIN IMAGE
    // --------------------------------

    if (status === "valid_skin") {
      setError(null);

      showSuccess(
        "Image checked successfully. Let's continue with your skin assessment."
      );

      navigate(
        "/skinAssessment",
        {
          state: {
            imageUrl,
          },
        }
      );

      return;
    }

    // --------------------------------
    // UNKNOWN STATUS
    // --------------------------------

    const userMessage =
      "We couldn't understand this image. Please try another clear, well-lit photo.";

    setError(userMessage);

    showError(userMessage);
  };

  // =========================
  // USE THIS IMAGE
  // =========================

  const useThisImage = async () => {
    if (
      uploading ||
      !capturedImage
    ) {
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Tell ScanPage to show loader
      onValidationStart?.();

      showInfo(
        "Checking your image. Please wait..."
      );

      let blob;
      let filename;

      // --------------------------------
      // SELECTED FILE
      // --------------------------------

      if (selectedFile) {
        blob = selectedFile;
        filename = selectedFile.name;
      }

      // --------------------------------
      // CAMERA CAPTURE
      // --------------------------------

      else {
        const blobResponse =
          await fetch(
            capturedImage
          );

        blob =
          await blobResponse.blob();

        filename =
          "skin-image.png";
      }

      // --------------------------------
      // UPLOAD TO CLOUDINARY
      // --------------------------------

      console.log(
        "Uploading image..."
      );

      const imageUrl =
        await uploadToServer(
          blob,
          filename
        );

      console.log(
        "Uploaded image URL:",
        imageUrl
      );

      // --------------------------------
      // VALIDATE IMAGE
      // --------------------------------

      console.log(
        "Validating image..."
      );

      const validationResult =
        await validateImage(
          imageUrl
        );

      // --------------------------------
      // HANDLE RESULT
      // --------------------------------

      handleValidationResult(
        validationResult,
        imageUrl
      );

    } catch (err) {
      console.error(
        "Image processing failed:",
        err
      );

      console.error(
        "Server response:",
        err.response?.data
      );

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "We couldn't process your image. Please try again with a clear, well-lit photo.";

      setError(errorMessage);

      showError(errorMessage);

    } finally {
      setUploading(false);

      // Tell ScanPage to hide loader
      onValidationEnd?.();
    }
  };

  // =========================
  // DEMO IMAGE
  // =========================

  const useDemoImage = async () => {
    if (uploading) return;

    try {
      setUploading(true);
      setError(null);

      // Tell ScanPage to show loader
      onValidationStart?.();

      showInfo(
        "Checking the demo image. Please wait..."
      );

      const imageUrl =
        "https://res.cloudinary.com/di6ryzdy2/image/upload/v1787156579/dermaScan-uploads/knaemf928f1n2vtq6jfm.jpg";

      console.log(
        "Demo image URL:",
        imageUrl
      );

      // --------------------------------
      // VALIDATE DEMO IMAGE
      // --------------------------------

      const validationResult =
        await validateImage(
          imageUrl
        );

      handleValidationResult(
        validationResult,
        imageUrl
      );

    } catch (error) {
      console.error(
        "Demo image validation failed:",
        error
      );

      console.error(
        "Server response:",
        error.response?.data
      );

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "We couldn't validate the demo image. Please try again.";

      setError(errorMessage);

      showError(errorMessage);

    } finally {
      setUploading(false);

      // Tell ScanPage to hide loader
      onValidationEnd?.();
    }
  };

  // =========================
  // FILE SELECT
  // =========================

  const handleFileChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    // --------------------------------
    // CHECK FILE TYPE
    // --------------------------------

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      const errorMessage =
        "Please select a valid image file such as JPG, JPEG, or PNG.";

      setError(errorMessage);

      showWarning(errorMessage);

      return;
    }

    // --------------------------------
    // STOP CAMERA
    // --------------------------------

    if (stream) {
      stream
        .getTracks()
        .forEach((track) =>
          track.stop()
        );
    }

    setStream(null);

    // --------------------------------
    // CREATE PREVIEW
    // --------------------------------

    const imagePreview =
      URL.createObjectURL(
        file
      );

    setSelectedFile(file);
    setCapturedImage(
      imagePreview
    );
    setCameraOn(false);
    setError(null);
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="camera-widget">

      {/* =========================
          STATUS
      ========================== */}

      <div className="camera-status">
        <span
          className={`status-dot ${
            cameraOn
              ? "status-dot--live"
              : ""
          }`}
        />

        <span className="status-text">
          {uploading
            ? "Checking image..."
            : capturedImage
            ? "Preview"
            : cameraOn
            ? "Camera live"
            : "Camera idle"}
        </span>
      </div>

      {/* =========================
          VIEWFINDER
      ========================== */}

      <div
        className={`viewfinder ${
          cameraOn
            ? "viewfinder--active"
            : ""
        } ${
          capturedImage
            ? "viewfinder--preview"
            : ""
        }`}
      >
        <span className="corner corner--tl" />
        <span className="corner corner--tr" />
        <span className="corner corner--bl" />
        <span className="corner corner--br" />

        {cameraOn &&
          !capturedImage && (
            <div className="scan-line" />
          )}

        {!cameraOn &&
          !capturedImage && (
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

                <circle
                  cx="12"
                  cy="13"
                  r="3.5"
                />
              </svg>

              <p>
                Position the affected area
                in frame
              </p>
            </div>
          )}

        {/* CAMERA VIDEO */}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="camera-video"
          style={{
            display:
              cameraOn &&
              !capturedImage
                ? "block"
                : "none",
          }}
        />

        {/* IMAGE PREVIEW */}

        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured skin"
            className="camera-video camera-preview-img"
          />
        )}
      </div>

      {/* =========================
          HIDDEN CANVAS
      ========================== */}

      <canvas
        ref={canvasRef}
        style={{
          display: "none",
        }}
      />

      {/* =========================
          ERROR
      ========================== */}

      {error && (
        <p className="camera-error">
          {typeof error === "string"
            ? error
            : `Error accessing camera: ${error.message}`}
        </p>
      )}

      {/* =========================
          FILE INPUT
      ========================== */}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={
          handleFileChange
        }
        style={{
          display: "none",
        }}
      />

      {/* =========================
          ACTION BUTTONS
      ========================== */}

      <div className="camera-actions">

        {/* CAMERA / FILE BUTTONS */}

        {!cameraOn &&
          !capturedImage && (
            <>
              <button
                className="btn btn--primary"
                onClick={
                  openCamera
                }
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
                  <path d="M4 7h2.5l1-1.5h9l1 1.5H20a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />

                  <circle
                    cx="12"
                    cy="13"
                    r="3.5"
                  />
                </svg>

                Scan on device
              </button>

              <button
                type="button"
                className="btn btn--secondary"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={uploading}
              >
                Choose file
              </button>
            </>
          )}

        {/* CAPTURE BUTTON */}

        {cameraOn &&
          !capturedImage && (
            <button
              className="btn btn--secondary"
              onClick={
                captureImage
              }
              disabled={uploading}
            >
              <span className="shutter-ring" />

              Capture image
            </button>
          )}

        {/* PREVIEW BUTTONS */}

        {capturedImage && (
          <>
            <button
              type="button"
              className="btn btn--outline"
              onClick={
                retakeImage
              }
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
              onClick={
                useThisImage
              }
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

              {uploading
                ? "Checking…"
                : "Continue"}
            </button>

            <button
              type="button"
              className="btn btn--secondary"
              onClick={
                useDemoImage
              }
              disabled={uploading}
            >
              {uploading
                ? "Checking…"
                : "Use demo image"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Camera;