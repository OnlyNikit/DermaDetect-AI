import React from "react";
import "../components/styles/register.css";

const Register = () => {

  

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="stage-wrapper">
      <div className="stage">
      <div className="scan-panel">
        <div className="scan-copy">
          <div className="brand">
            <span className="brand-dot"></span> DermaDetect AI
          </div>

          <h1>Early detection starts with a clear picture.</h1>

          <p>
            Create your account to start scanning, tracking, and understanding
            skin changes over time.
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

        <div className="status-line">Analyzing sample</div>
      </div>

      <div className="form-panel">
        <div className="form-head">
          <h2>Create your account</h2>
          <p>It only takes a minute to get started.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Full name</label>

            <div className="input-wrap">
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="email">Email address</label>

            <div className="input-wrap">
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>

            <div className="input-wrap">
              <input
                id="password"
                type="password"
                placeholder="Create a password"
                required
              />
            </div>

            <p className="hint">Use at least 8 characters.</p>
          </div>

          <div className="field">
            <label htmlFor="confirm">Confirm password</label>

            <div className="input-wrap">
              <input
                id="confirm"
                type="password"
                placeholder="Re-enter your password"
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" id="submitBtn">
            Create account
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <p className="login-row">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </div>
    </div>
  );
};

export default Register;