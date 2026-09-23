import { useState } from "react";
import "../components/styles/register.css";
import api from "../api/axios.js";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [registerFormData, setRegisterFormData] = useState({
    fullName: "Nikit Kumar",
    email: "nikit2@gmail.com",
    password: "12345678",
    confirmPassword: "12345678",
    gender: "Male",
    age: "19",
    role: "user",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setRegisterFormData((currData) => ({
      ...currData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (registerFormData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (
      registerFormData.password !==
      registerFormData.confirmPassword
    ) {
      toast.error("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/api/auth/register",
        registerFormData
      );

      toast.success(response.data.message);

      navigate("/login", {
        state: {
          email: registerFormData.email,
        },
      });
    } catch (err) {
      console.log("REGISTER ERROR:", err.response?.data);

      if (err.response?.status === 409) {
        toast.error(
          "Account already exists. Please login."
        );
      } else {
        toast.error(
          err.response?.data?.message ||
            "Registration failed"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stage-wrapper">
      <div className="stage">

        {/* ================= LEFT PANEL ================= */}

        <div className="scan-panel">

          <div className="scan-copy">

            <div className="brand">
              <span className="brand-dot"></span>
              DermaDetect AI
            </div>

            <h1>
              Early detection starts with a clear picture.
            </h1>

            <p>
              Create your account to start scanning,
              tracking, and understanding skin changes
              over time.
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

          <div className="status-line">
            Analyzing sample
          </div>

        </div>

        {/* ================= RIGHT PANEL ================= */}

        <div className="form-panel">

          <div className="form-head">

            <h2>Create your account</h2>

            <p>
              It only takes a minute to get started.
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            {/* ACCOUNT TYPE */}

            <div className="field">

              <label htmlFor="role">
                Account type
              </label>

              <div className="input-wrap">

                <select
                  id="role"
                  name="role"
                  value={registerFormData.role}
                  onChange={handleChange}
                  required
                >

                  <option value="user">
                    Patient / User
                  </option>

                  <option value="doctor">
                    Doctor
                  </option>

                </select>

              </div>

            </div>

            {/* FULL NAME */}

            <div className="field">

              <label htmlFor="name">
                Full name
              </label>

              <div className="input-wrap">

                <input
                  id="name"
                  value={registerFormData.fullName}
                  onChange={handleChange}
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  required
                />

              </div>

            </div>

            {/* EMAIL */}

            <div className="field">

              <label htmlFor="email">
                Email address
              </label>

              <div className="input-wrap">

                <input
                  id="email"
                  type="email"
                  value={registerFormData.email}
                  onChange={handleChange}
                  name="email"
                  placeholder="you@example.com"
                  required
                />

              </div>

            </div>

            {/* GENDER + AGE */}

            <div className="field-row">

              <div className="field">

                <label htmlFor="gender">
                  Gender
                </label>

                <div className="input-wrap">

                  <select
                    id="gender"
                    value={registerFormData.gender}
                    onChange={handleChange}
                    name="gender"
                    required
                  >

                    <option value="" disabled>
                      Select gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>

                    <option value="prefer_not_to_say">
                      Prefer not to say
                    </option>

                  </select>

                </div>

              </div>

              <div className="field">

                <label htmlFor="age">
                  Age
                </label>

                <div className="input-wrap">

                  <input
                    id="age"
                    type="number"
                    value={registerFormData.age}
                    onChange={handleChange}
                    name="age"
                    placeholder="Years"
                    min="1"
                    max="120"
                    required
                  />

                </div>

              </div>

            </div>

            {/* PASSWORD */}

            <div className="field">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrap">

                <input
                  id="password"
                  type="password"
                  value={registerFormData.password}
                  onChange={handleChange}
                  name="password"
                  placeholder="Create a password"
                  minLength="8"
                  required
                />

              </div>

              <p className="hint">
                Use at least 8 characters.
              </p>

            </div>

            {/* CONFIRM PASSWORD */}

            <div className="field">

              <label htmlFor="confirm">
                Confirm password
              </label>

              <div className="input-wrap">

                <input
                  id="confirm"
                  type="password"
                  value={registerFormData.confirmPassword}
                  onChange={handleChange}
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  required
                />

              </div>

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating account...
                </>
              ) : (
                registerFormData.role === "doctor"
                  ? "Create Doctor Account"
                  : "Create Account"
              )}

            </button>

          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <p className="login-row">

            Already have an account?

            <a href="/login">
              {" "}Log in
            </a>

          </p>

        </div>

      </div>
    </div>
  );
};

export default Register;