import { React, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "../styles/navbar.css";
import Logo from "../../assets/images/logo1.png";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: "fa-house" },
  { to: "/features", label: "Features", icon: "fa-star" },
  { to: "/how-its-works", label: "How it Works", icon: "fa-gear" },
  { to: "/about", label: "About", icon: "fa-circle-info" },
  { to: "/contact", label: "Contact", icon: "fa-envelope" },
];

function Navbar() {
  const [menu, setMenu] = useState(false);

  const closeMenu = () => setMenu(false);

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
          </ul>

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