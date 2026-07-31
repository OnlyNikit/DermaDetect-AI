import React, { useEffect, useRef } from "react";
import "../components/styles/Features.css";

const FEATURES = [
  {
    id: "scan",
    title: "AI-Powered Skin Scan",
    desc: "Upload or capture a photo of the affected area and let our trained model analyze it for early signs of skin disease.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "instant",
    title: "Results in Seconds",
    desc: "No waiting rooms. Get a confidence score and likely condition breakdown moments after your scan completes.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "history",
    title: "Track Progress Over Time",
    desc: "Every scan is saved to your timeline, so you can see how a condition changes — or improves — week over week.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M3 17l5-5 4 4 8-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 7h5v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "report",
    title: "Detailed Reports",
    desc: "Download a clear, shareable summary of each scan — perfect for keeping records or bringing to a dermatologist.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 12h6M9 16h6M9 8h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "doctor",
    title: "Connect with a Dermatologist",
    desc: "Flag a scan for review and get it looked at by a licensed professional, right from within the app.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4 20c1.2-4 4.2-6 8-6s6.8 2 8 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M18 4v4M16 6h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "privacy",
    title: "Private by Design",
    desc: "Your photos and health data are encrypted end-to-end and never shared without your explicit permission.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
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
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function FeatureCard({ feature, index }) {
  const ref = useReveal();
  return (
    <div
      className="feature-card reveal"
      ref={ref}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <div className="feature-icon">{feature.icon}</div>
      <h3>{feature.title}</h3>
      <p>{feature.desc}</p>
    </div>
  );
}

export default function Features() {
  const heroRef = useReveal();

  return (
    <div className="features-body">
      <section className="features-hero">
        <div className="hero-bg">
          <div className="pulse-ring r1"></div>
          <div className="pulse-ring r2"></div>
          <div className="pulse-ring r3"></div>
        </div>

        <div className="hero-content reveal" ref={heroRef}>
          <span className="eyebrow">
            <span className="brand-dot"></span> DermaDetect AI  Features
          </span>
          <h1>Everything you need to understand your skin, in one place.</h1>
          <p className="p-hero">From instant AI analysis to long-term tracking, DermaDetect AI helps you catch changes early and stay informed.</p>
        </div>
      </section>

      <section className="features-grid-section">
        <div className="features-grid">
          {FEATURES.map((feature, i) => (
            <FeatureCard feature={feature} index={i} key={feature.id} />
          ))}
        </div>
      </section>
    </div>
  );
}