import React, { useEffect, useRef, useState } from "react";
import "../components/styles/about.css";
import {Link} from "react-router-dom"
const STEPS = [
  {
    n: "01",
    title: "Upload",
    desc: "Take or upload a clear photo of the affected skin area.",
  },
  {
    n: "02",
    title: "Scan",
    desc: "Our model analyzes texture, color, and pattern against trained cases.",
  },
  {
    n: "03",
    title: "Detect",
    desc: "The condition is classified with a confidence score in seconds.",
  },
  {
    n: "04",
    title: "Guide",
    desc: "You get a plain-language summary and next-step suggestions.",
  },
];

const STATS = [
  { value: "5+", label: "Conditions covered" },
  { value: "<10s", label: "Avg. scan time" },
  { value: "24/7", label: "Always available" },
];

const STACK = ["Python", "TensorFlow", "React", "Pytorch", "Node.js", "Scikit-learn" ,"FastAPI","Matplotlib"];

/** Wraps children and adds the .in-view class once the element scrolls into frame. */
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
      { threshold: 0.2 },
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

export default function About() {
  return (
    <main className="about">
      {/* ---------- Hero ---------- */}
      <section className="about-hero">
        <div className="about-hero__bg" aria-hidden="true" />
        <div className="about-hero__inner">
          <span className="eyebrow">About the project</span>
          <h1 className="about-hero__title">
            Skin health, <span className="hl">read at a glance.</span>
          </h1>
          <p className="about-hero__subtitle">
            We're building an AI-powered scanner that helps people recognize
            common skin conditions early — fast, private, and easy to use.
          </p>
          <div className="about-hero__cta">
            <Link to="/choose">
            <button className="btn btn--primary">Try a scan</button>
            </Link>
            <Link to="/how-its-works">
            <button className="btn btn--secondary">How it works</button></Link>
          </div>
        </div>
      </section>

      {/* ---------- Stats strip ---------- */}
      <section className="stats-strip">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 100} className="stat">
            <span className="stat__value">{s.value}</span>
            <span className="stat__label">{s.label}</span>
          </Reveal>
        ))}
      </section>

      {/* ---------- Mission ---------- */}
      <section className="mission">
        <Reveal className="mission__text">
          <span className="eyebrow">Why we're building this</span>
          <h2 className="section-title">
            Early detection shouldn't need a waitlist.
          </h2>
          <p className="section-body">
            Millions of people notice something on their skin and don't know
            whether it's worth a doctor's visit. Our goal is a lightweight first
            check — point your camera, get a clear read, and decide your next
            step with confidence, not guesswork.
          </p>
        </Reveal>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="how">
        <Reveal className="how__header">
          <span className="eyebrow">Process</span>
          <h2 className="section-title">How it works</h2>
        </Reveal>

        <div className="how__grid">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 110} className="step-card">
              <span className="step-card__n">{s.n}</span>
              <h3 className="step-card__title">{s.title}</h3>
              <p className="step-card__desc">{s.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Tech stack ---------- */}
      <section className="stack">
        <Reveal className="stack__header">
          <span className="eyebrow">Under the hood</span>
          <h2 className="section-title">Built with</h2>
        </Reveal>
        <Reveal className="stack__chips" delay={100}>
          {STACK.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </Reveal>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="cta">
        <Reveal className="cta__inner">
          <h2 className="cta__title">Ready to check your skin?</h2>
          <p className="cta__body">
            It takes less than a minute — no signup required to try it out.
          </p>
          <Link to="/choose">
            <button className="btn btn--primary btn--lg">
              Start a free scan
            </button>
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
