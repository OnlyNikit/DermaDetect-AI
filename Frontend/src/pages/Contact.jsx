import React, { useEffect, useRef, useState } from "react";
import "../components/styles/contact.css";

const CHANNELS = [
  {
    label: "Email",
    value: "hello@skinscan.app",
    href: "mailto:hello@skinscan.app",
  },
  {
    label: "Phone",
    value: "+91 0000000000",
    href: "tel:+919876543210",
  },
  {
    label: "Location",
    value: "Kanpur, Uttar Pradesh, India",
    href: null,
  },
];

/** Wraps children and adds .in-view once the element scrolls into frame. */
function Reveal({ as: Tag = "div", className = "", children, delay = 0 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? "in-view" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Wire this up to your API / email service.
    console.log("Contact form submitted:", form);
    setSent(true);
  }

  return (
    <main className="contact">
      {/* ---------- Hero ---------- */}
      <section className="contact-hero">
        <div className="contact-hero__bg" aria-hidden="true" />
        <div className="contact-hero__inner">
          <span className="eyebrow">Get in touch</span>
          <h1 className="contact-hero__title">
            Questions? <span className="hl">We're listening.</span>
          </h1>
          <p className="contact-hero__subtitle">
            Bug reports, feedback on a scan result, partnership ideas — send
            it over and we'll get back within a day or two.
          </p>
        </div>
      </section>

      {/* ---------- Body: form + info ---------- */}
      <section className="contact-body">
        <Reveal className="contact-form-card">
          {sent ? (
            <div className="sent-state">
              <span className="sent-state__icon">✓</span>
              <h3>Message sent</h3>
              <p>Thanks for reaching out — we'll reply soon.</p>
              <button
                className="btn btn--secondary"
                onClick={() => {
                  setSent(false);
                  setForm({ name: "", email: "", message: "" });
                }}
              >
                Send another
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="How can we help?"
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="btn btn--primary btn--lg">
                Send message
              </button>
            </form>
          )}
        </Reveal>

        <Reveal className="contact-info" delay={120}>
          <h2 className="section-title">Other ways to reach us</h2>
          <p className="section-body">
            Prefer email or a call? Use whichever's easiest — we check all of
            these regularly.
          </p>

          <ul className="channel-list">
            {CHANNELS.map((c) => (
              <li className="channel" key={c.label}>
                <span className="channel__label">{c.label}</span>
                {c.href ? (
                  <a className="channel__value" href={c.href}>
                    {c.value}
                  </a>
                ) : (
                  <span className="channel__value">{c.value}</span>
                )}
              </li>
            ))}
          </ul>

          <div className="social-row">
            <a href="#" className="social-chip" aria-label="Twitter / X">
              X
            </a>
            <a href="#" className="social-chip" aria-label="GitHub">
              GH
            </a>
            <a href="#" className="social-chip" aria-label="LinkedIn">
              in
            </a>
          </div>
        </Reveal>
      </section>
    </main>
  );
}