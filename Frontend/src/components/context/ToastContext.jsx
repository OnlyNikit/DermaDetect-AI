import {
  createContext,
  useContext,
  useCallback,
  useState,
} from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback(
    (message, type = "success", duration = 3000) => {
      setToast({
        id: Date.now(),
        message,
        type,
      });

      setTimeout(() => {
        setToast(null);
      }, duration);
    },
    []
  );

  const showSuccess = useCallback(
    (message) => {
      showToast(message, "success");
    },
    [showToast]
  );

  const showError = useCallback(
    (message) => {
      showToast(message, "error");
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message) => {
      showToast(message, "warning");
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message) => {
      showToast(message, "info");
    },
    [showToast]
  );

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideToast,
      }}
    >
      {children}

      {toast && (
        <div
          className={`app-toast app-toast-${toast.type}`}
          role="alert"
        >
          <div className="app-toast-icon">
            {toast.type === "success" && "✓"}
            {toast.type === "error" && "!"}
            {toast.type === "warning" && "⚠"}
            {toast.type === "info" && "i"}
          </div>

          <div className="app-toast-message">
            {toast.message}
          </div>

          <button
            className="app-toast-close"
            onClick={hideToast}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast must be used inside ToastProvider"
    );
  }

  return context;
}