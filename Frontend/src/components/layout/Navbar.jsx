import { React, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/navbar.css";
import Logo from "../../assets/images/LOGO.png";

function Navbar() {
  const [menu, setMenu] = useState(false);
  console.log(menu);
  return (
    <>
      <nav>
        <div className="navbar">
          <div className="logo-img">
            <img src={Logo} alt="" className="img-fluid" />
          </div>
          <div className="links">
            <ul className={menu ? "nav-links active" : "nav-links"}>
              <li>
                <Link className="Link" to="/">
                  <i className="fa-solid fa-house icon"></i>
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link className="Link" to="/features">
                  <i className="fa-solid fa-star icon"></i>
                  <span>Features</span>
                </Link>
              </li>
              <li>
                <Link className="Link" to="/working">
                  <i className="fa-solid fa-gear icon"></i>
                  <span>How its Works</span>
                </Link>
              </li>
              <li>
                <Link className="Link" to="/about">
                  <i className="fa-solid fa-circle-info icon"></i>
                  <span>About</span>
                </Link>
              </li>
              <li>
                <Link className="Link" to="/contact">
                  <i className="fa-solid fa-envelope icon"></i>
                  <span>Contact</span>
                </Link>
              </li>
              <div className="mobile-btn">
                <li>
                  <form action="/register">
                    <button type="submit" className="primary-btn-register">
                      Register
                    </button>
                  </form>
                </li>
                <li>
                  <form action="/login">
                    <button type="submit" className="primary-btn-login">
                      Login
                    </button>
                  </form>
                </li>
              </div>
            </ul>
            <div className="btn-container">
              <form action="/login">
                <button type="submit" className="primary-btn">
                  Login
                </button>
              </form>
              <form action="/register">
                <button type="submit" className="secondary-btn">
                  Register
                </button>
              </form>
            </div>

            <div className="menu-icon" onClick={() => setMenu(!menu)}>
              <i className="fa-solid fa-bars"></i>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
