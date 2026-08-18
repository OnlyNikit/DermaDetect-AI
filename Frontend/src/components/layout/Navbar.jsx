import { React, useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import Logo from "../../assets/images/logo1.png";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "react-toastify";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: "fa-house" },
  { to: "/features", label: "Features", icon: "fa-star" },
  { to: "/how-its-works", label: "How it Works", icon: "fa-gear" },
  { to: "/about", label: "About", icon: "fa-circle-info" },
  { to: "/contact", label: "Contact", icon: "fa-envelope" },
];

function Navbar() {
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);

  const closeMenu = () => setMenu(false);
  const { user, logout } = useAuth();

  console.log("User in Navbar:", user);

  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Close the dropdown when clicking outside it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial = user?.fullName?.charAt(0).toUpperCase() || "?";

  const handleLogout = async () => {
    try {
      const response = await logout();
      console.log("Logout response:", response);

      toast.success(response.message);

      navigate("/login");
    } catch (err) {
      console.error("Logout Error:", err);
      console.error("Response:", err.response);
      toast.error("Logout failed");
    }
  };

  return (
    <nav>
      <div className="navbar">
        <div className="logo-img">
          <Link to="/" onClick={closeMenu}>
            <img src={Logo} alt="Logo" className="img-fluid" />
          </Link>
        </div>

        <div className="links">
          <ul className={menu ? "nav-links active" : "nav-links"}>
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) => (isActive ? "active" : "")}
                  onClick={closeMenu}
                >
                  <i className={`fa-solid ${item.icon} icon`}></i>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}

            {/* Logged-out: Register / Login buttons inside mobile menu */}
            {!user && (
              <div className="mobile-btn">
                <li>
                  <Link to="/register" onClick={closeMenu}>
                    <button type="button" className="secondary-btn">
                      Register
                    </button>
                  </Link>
                </li>
                <li>
                  <Link to="/login" onClick={closeMenu}>
                    <button type="button" className="primary-btn">
                      Login
                    </button>
                  </Link>
                </li>
              </div>
            )}

            {/* Logged-in: profile options inside mobile menu */}
            {user && (
              <div className="mobile-profile">
                <li className="mobile-profile-header">
                  <span className="profile-avatar">{initial}</span>
                  <span className="profile-name">{user.fullName}</span>
                </li>
                <li>
                  <a href="/profile" className="dropdown-item" onClick={closeMenu}>
                    👤 Profile
                  </a>
                </li>
                <li>
                  <a href="/settings" className="dropdown-item" onClick={closeMenu}>
                    ⚙ Settings
                  </a>
                </li>
                <li>
                  <a href="/dashboard" className="dropdown-item" onClick={closeMenu}>
                    📊 Dashboard
                  </a>
                </li>
                <li>
                  <button
                    className="dropdown-item logout"
                    onClick={() => {
                      closeMenu();
                      handleLogout();
                    }}
                  >
                    🚪 Logout
                  </button>
                </li>
              </div>
            )}
          </ul>

          {/* Desktop-only profile badge — hidden on mobile via CSS */}
          {user ? (
            <div className="profile-badge desktop-only" ref={wrapRef}>
              <button
                className="profile-trigger"
                onClick={() => setOpen((v) => !v)}
              >
                <span className="profile-avatar">{initial}</span>
                <span className="profile-name">{user.fullName}</span>
                <span className={`profile-caret ${open ? "up" : ""}`}>▾</span>
              </button>

              {open && (
                <div className="profile-dropdown">
                  <a href="/profile" className="dropdown-item">
                    👤 Profile
                  </a>
                  <a href="/settings" className="dropdown-item">
                    ⚙ Settings
                  </a>
                  <a href="/dashboard" className="dropdown-item">
                    📊 Dashboard
                  </a>
                  <button
                    className="dropdown-item logout"
                    onClick={handleLogout}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="btn-container">
              <Link to="/login">
                <button type="button" className="primary-btn">
                  Login
                </button>
              </Link>
              <Link to="/register">
                <button type="button" className="secondary-btn">
                  Register
                </button>
              </Link>
            </div>
          )}

          <button
            type="button"
            className="menu-icon"
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            onClick={() => setMenu((m) => !m)}
          >
            <i className={`fa-solid ${menu ? "fa-xmark" : "fa-bars"}`}></i>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;