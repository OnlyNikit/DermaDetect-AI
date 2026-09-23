import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../components/styles/doctor-dashboard.css";

export default function DoctorDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get(
        "/doctors/profile/me"
      );

      setProfile(response.data.profile);
    } catch (error) {
      if (error.response?.status === 404) {
        setProfile(null);
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="doctor-loading">
        Loading doctor dashboard...
      </div>
    );
  }

  return (
    <div className="doctor-dashboard">
      <div className="doctor-dashboard-container">

        <div className="doctor-header">
          <div>
            <p className="doctor-eyebrow">
              DERMADETECT AI
            </p>

            <h1>Doctor Dashboard</h1>

            <p>
              Manage your professional profile,
              availability and consultations.
            </p>
          </div>
        </div>

        {!profile ? (
          <div className="doctor-onboard-card">
            <h2>Complete your doctor profile</h2>

            <p>
              Before patients can find you, complete
              your professional information.
            </p>

            <button
              onClick={() =>
                navigate("/doctor-onboarding")
              }
            >
              Onboard to DermaDetect AI
            </button>
          </div>
        ) : (
          <>
            <div className="doctor-status-card">
              <div>
                <span>Verification status</span>

                <strong>
                  {profile.verificationStatus}
                </strong>
              </div>

              <div>
                <span>Availability</span>

                <strong>
                  {profile.isAvailable
                    ? "Available"
                    : "Unavailable"}
                </strong>
              </div>
            </div>

            <div className="doctor-dashboard-grid">

              <button
                onClick={() =>
                  navigate("/doctor-profile")
                }
              >
                <h3>My Profile</h3>
                <p>
                  Update professional information
                </p>
              </button>

              <button
                onClick={() =>
                  navigate("/doctor-availability")
                }
              >
                <h3>Availability</h3>
                <p>
                  Manage consultation timings
                </p>
              </button>

              <button
                onClick={() =>
                  navigate("/doctor-appointments")
                }
              >
                <h3>Appointments</h3>
                <p>
                  View patient consultation requests
                </p>
              </button>

            </div>
          </>
        )}
      </div>
    </div>
  );
}