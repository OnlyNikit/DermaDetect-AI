import React from "react";
import "../styles/footer.css";
import ButtonPrimary from "../ui/ButtonPrimary";
import Social from "../ui/Social";

function Footer() {
  return (
    <>
      <footer>
        <div className="footer-container">
          <div className="container">
            <div className="row pb-5">
              <div className="ccol-12 col-lg-7 mt-5 foot-head">
                <h2>
                  Your skin already sends signals. <br /> Start listening to
                  them.
                </h2>
              </div>
              <div className="col-12 col-lg-5 foot-btn">
                <form action="/choose">
                  <button type="submit" className="btn">
                    Scan a photo
                  </button>
                </form>
              </div>
            </div>
            <hr />
          <div className="container">
            <div className="row">
              <div className=" col-12 col-lg-8">
                <p>
                  Derma is a screening aid, not a medical device. It does not
                  diagnose, treat, or replace consultation with a <br />{" "}
                  qualified dermatologist. If a mark is bleeding, growing
                  quickly, or you're worried, see a doctor directly.
                </p>
              </div>
              <div className="col-12 col-lg-4 social-media ">
                <Social />
              </div>
            </div>
          </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
