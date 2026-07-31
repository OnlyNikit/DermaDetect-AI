import React, { useEffect, useRef } from "react";
import "../components/styles/howitsworks.css"

const STEPS = [
  {
    id: "capture",
    number: "01",
    title: "Capture or Upload a Photo",
    desc: "Take a clear photo of the affected skin area with your camera, or upload an existing image from your gallery.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 8a2 2 0 0 1 2-2h1.5l1-1.6A2 2 0 0 1 10.2 3.4h3.6a2 2 0 0 1 1.7 1L16.5 6H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="12" cy="13" r="3.3" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    id: "analyze",
    number: "02",
    title: "AI Analyzes the Image",
    desc: "Our trained model scans the image pixel by pixel, comparing patterns against a large dataset of skin conditions.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "results",
    number: "03",
    title: "Get Instant Results",
    desc: "Within seconds, view a confidence score and a breakdown of the most likely conditions detected in your scan.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "act",
    number: "04",
    title: "Track & Consult",
    desc: "Save the result to your history, monitor changes over time, or share the report with a dermatologist for review.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4 20c1.2-4 4.2-6 8-6s6.8 2 8 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="m9.5 12 1.8 1.8L14.5 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add("is-visible");
          observer.unobserve(node);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function StepRow({ step, index }) {
  const ref = useReveal();
  const isEven = index % 2 === 1;

  return (
    <div
      className={`step-row ${isEven ? "reverse" : ""} reveal`}
      ref={ref}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <div className="step-node">
        <span className="node-dot"></span>
      </div>

      <div className="step-card">
        <span className="step-number">{step.number}</span>
        <div className="step-icon">{step.icon}</div>
        <h3>{step.title}</h3>
        <p>{step.desc}</p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const heroRef = useReveal();

  return (
    <div className="hiw-body">
      <section className="hiw-hero">
        <div className="hero-content reveal" ref={heroRef}>
          <span className="eyebrow">
            <span className="brand-dot"></span> How It Works
          </span>
          <h1>From photo to answer in four simple steps.</h1>
          <p>DermaDetect AI turns a single photo into a clear, actionable read on your skin health — no appointment needed to get started.</p>
        </div>
      </section>

      <section className="hiw-timeline-section">
        <div className="timeline">
          <div className="timeline-line"></div>
          {STEPS.map((step, i) => (
            <StepRow step={step} index={i} key={step.id} />
          ))}
        </div>
      </section>
    </div>
  );
}