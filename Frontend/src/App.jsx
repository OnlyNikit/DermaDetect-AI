import { Routes, Route } from "react-router-dom";

import "./App.css";

// Layout
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Common
import ChatBot from "./components/common/ChatBot";
import Loader1 from "./components/common/Loader1";

// Auth
import ProtectedRoute from "./features/auth/ProtectedRoute";
import { useAuth } from "./components/context/AuthContext";

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Features from "./pages/Features";
import HowItWorks from "./pages/HowItsWorks";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Choose from "./pages/Choose";

// Patient Pages
import Dashboard from "./pages/Dashboard";
import ScanPage from "./pages/ScanPage";
import SkinAssessment from "./pages/SkinAssessment";
import SkinAnalysisResult from "./pages/SkinResult";
import Report from "./pages/Report";
import MobileScan from "./pages/MobileScan";

// Doctor Pages
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorOnboarding from "./pages/DoctorOnboarding";
import DoctorAppointments from "./pages/DoctorAppointments";
import DoctorAppointmentDetails from "./pages/DoctorAppointmentDetails";
import DoctorDetails from "./pages/DoctorDetails";
import Doctorprofile from "./pages/Doctorprofile";
import DoctorAvailability from "./pages/DoctorAvailability";
import DoctorAssessment from "./pages/DoctorAssessment";

// Appointment Pages
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";
import Appointmentconfirmation from "./pages/Appointmentconfirmation";

// Utility
import ScrollToTop from "./pages/ScrollToTop";


function App() {
  const { loading } = useAuth();

  // --------------------------------------------------
  // AUTH LOADING
  // --------------------------------------------------

  if (loading) {
    return <Loader1 />;
  }

  return (
    <>
      <ScrollToTop />

      <Navbar />

      <Routes>

        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        <Route
          path="/features"
          element={<Features />}
        />

        <Route
          path="/how-its-works"
          element={<HowItWorks />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/choose"
          element={<Choose />}
        />


        {/* =================================================
            PATIENT ROUTES
        ================================================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/choose-this-device"
          element={
            <ProtectedRoute>
              <ScanPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/skinAssessment"
          element={
            <ProtectedRoute>
              <SkinAssessment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/skinAssessmentResult"
          element={
            <ProtectedRoute>
              <SkinAnalysisResult />
            </ProtectedRoute>
          }
        />

        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mobile-scan/:sessionId"
          element={<MobileScan />}
        />


        {/* =================================================
            DOCTOR DASHBOARD
        ================================================= */}

        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            DOCTOR PROFILE / ONBOARDING
        ================================================= */}

        <Route
          path="/doctor-onboarding"
          element={
            <ProtectedRoute>
              <DoctorOnboarding />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor-profile"
          element={
            <ProtectedRoute>
              <Doctorprofile />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            DOCTOR AVAILABILITY
        ================================================= */}

        <Route
          path="/doctor-availability"
          element={
            <ProtectedRoute>
              <DoctorAvailability />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            DOCTOR APPOINTMENTS
        ================================================= */}

        <Route
          path="/doctor-appointments"
          element={
            <ProtectedRoute>
              <DoctorAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor-appointments/:appointmentId"
          element={
            <ProtectedRoute>
              <DoctorAppointmentDetails />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            DOCTOR PATIENT ASSESSMENT
        ================================================= */}

        <Route
          path="/doctor/assessment/:assessmentId"
          element={
            <ProtectedRoute>
              <DoctorAssessment />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            DOCTOR DETAILS
        ================================================= */}

        <Route
          path="/doctors/:id"
          element={
            <ProtectedRoute>
              <DoctorDetails />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            BOOK APPOINTMENT
        ================================================= */}

        <Route
          path="/doctors/:doctorId/book"
          element={
            <ProtectedRoute>
              <BookAppointment />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            MY APPOINTMENTS
        ================================================= */}

        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute>
              <MyAppointments />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            APPOINTMENT CONFIRMATION
        ================================================= */}

        <Route
          path="/appointment-confirmation"
          element={
            <ProtectedRoute>
              <Appointmentconfirmation />
            </ProtectedRoute>
          }
        />

      </Routes>


      {/* =================================================
          GLOBAL COMPONENTS
      ================================================= */}

      <ChatBot />

      <Footer />
    </>
  );
}

export default App;