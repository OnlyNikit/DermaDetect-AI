import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./components/context/AuthContext.jsx";
import { LoaderProvider } from "./components/context/LoaderContext";
import { ToastProvider } from "./components/context/ToastContext";

import ScrollToTop from "./pages/ScrollToTop.jsx";

import "./index.css";
import "./components/styles/toast.css";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>

      <LoaderProvider>

        <AuthProvider>

          <ToastProvider>

            <ScrollToTop />

            <App />

          </ToastProvider>

        </AuthProvider>

      </LoaderProvider>

    </BrowserRouter>
  </StrictMode>
);