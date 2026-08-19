import React, { useState } from "react";
import "../components/styles/login.css";
import { toast } from "react-toastify";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/context/AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { SetUser } = useAuth();
  const { fetchProfile } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  let [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    setLoginData((currData) => {
      return { ...currData, [event.target.name]: event.target.value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/api/auth/login", loginData);
      await fetchProfile(); // Fetch the user profile after successful login
      toast.success(response.data.message);
      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      toast.error("Account not exist");
    }
  };

  const handleRipple = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  };

  return (
    <div className="login-body">
      <div className="stage">
        <div className="scan-panel">
          <div className="scan-copy">
            <div className="brand">
              <span className="brand-dot"></span> DermaDetect AI
            </div>
            <h1>Welcome back. Your scans are right where you left them.</h1>
            <p>
              Log in to check your latest results, track changes, and keep
              monitoring your skin over time.
            </p>
          </div>

          <div className="scan-frame">
            <div className="crosshair">
              <span className="h"></span>
              <span className="v"></span>
            </div>
            <div className="cell c1"></div>
            <div className="cell c2"></div>
            <div className="cell c3"></div>
            <div className="cell c4"></div>
            <div className="cell c5"></div>
          </div>

          <div className="status-line">Ready to scan</div>
        </div>

        <div className="form-panel">
          <div className="form-head">
            <h2>Log in to your account</h2>
            <p>Enter your details to continue.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <div className="input-wrap">
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  name="email"
                  onChange={handleChange}
                  value={loginData.email}
                  required
                />
              </div>
            </div>

            <div className="field">
              <div className="field-label-row">
                <label htmlFor="password">Password</label>
                <a href="/forgot-password" className="forgot-link">
                  Forgot password?
                </a>
              </div>
              <div className="input-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  name="password"
                  onChange={handleChange}
                  value={loginData.password}
                  required
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" onClick={handleRipple}>
              Log in
            </button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <p className="login-row">
            Don't have an account? <a href="/register">Create one</a>
          </p>
        </div>
      </div>
    </div>
  );
}
