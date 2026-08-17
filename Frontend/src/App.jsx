import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import "./App.css";

import Navbar from "../src/components/layout/Navbar";
import Footer from "../src/components/layout/Footer";
import Home from "../src/pages/Home";
import About from "../src/pages/About";
import Contact from "../src/pages/Contact";
import Dashboard from "../src/pages/Dashboard";
import Login from "../src/pages/Login";
import Register from "../src/pages/Register";
import Report from "../src/pages/Report";
import Features from "../src/pages/Features";
import HowItWorks from "./pages/HowItsWorks";
import Choose from "./pages/Choose";

import ScrollToTop from "./pages/ScrollToTop";
import ProtectedRoute from "./features/auth/ProtectedRoute";

import ChatBot from "./components/common/ChatBot";

import Loader1 from "./components/common/Loader1";
import { useAuth } from "./components/context/AuthContext";
import ScanPage from "./pages/ScanPage";
import SkinAssessment from "./pages/SkinAssessment"
import SkinAnalysisResult from "./pages/SkinResult";
import MobileScan from "./pages/MobileScan";

function App() {
  const { loading } = useAuth();
  if (loading) {
    return <Loader1 />;
  }
  return (
    <>
      {/* <Loader1/> */}
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/choose=thisdevice"
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
              <SkinAssessment/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/skinAssessmentResult"
          element={
            <ProtectedRoute>
              <SkinAnalysisResult/>
            </ProtectedRoute>
          }
          />
            <Route
          path="/mobile-scan/:sessionId"
          element={
           
              <MobileScan/>
           
          }
          />
          
        <Route path="/features" element={<Features />} />
        <Route path="/how-its-works" element={<HowItWorks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/report" element={<Report />} />
        <Route path="/choose" element={<Choose />}></Route>
      </Routes>
      <ChatBot />

      <Footer />
    </>
  );
}

export default App;
