import React, { useEffect, useRef, useState } from "react";
import "../styles/skinproblem.css";
import Acne from "../../assets/images/acne.png";
import Psoriasis from "../../assets/images/psoriasis.png";
import vitiligo from "../../assets/images/vitiligo.png";
import warts from "../../assets/images/warts.png";
import ringworm from "../../assets/images/ringworm.png";
import melanoma from "../../assets/images/melanoma.png";

const PROBLEMS = [
  {
    id: "01",
    name: "Acne",
    tag: "Clogged pores",
    desc: "Red pimples, blackheads or whiteheads caused by clogged pores and excess oil.",
    image: Acne,
  },
  {
    id: "02",
    name: "Ringworm",
    tag: "Fungal",
    desc: "Fungal infection that causes a circular, red, itchy rash with raised edges.",
    image: ringworm,
  },
  {
    id: "03",
    name: "Psoriasis",
    tag: "Autoimmune",
    desc: "Autoimmune condition causing red patches with thick, silvery scales.",
    image: Psoriasis,
  },
  {
    id: "04",
    name: "Vitiligo",
    tag: "Pigment loss",
    desc: "A skin condition that causes white patches due to loss of pigment. It can affect any part of the body and is not contagious, but early care may help.",
    image: vitiligo,
  },
  {
    id: "comming soon",
    name: "Warts",
    tag: "Viral (HPV)",
    desc: "Small, rough skin growths caused by the Human Papillomavirus (HPV). They can appear on the hands, feet, face, or other parts of the body.",
    image: warts,
  },
  {
    id: "comming soon",
    name: "Melanoma",
    tag: "Skin Cancer",
    desc: "A fungal skin infection that causes a circular, red, itchy rash with raised edges. It spreads through direct contact with infected people, animals, or surfaces.",
    image: melanoma,
  },
];

/**
 * SkinProblems
 * Drop this into your homepage: <SkinProblems />
 * Cards reveal on scroll and lift on hover. Fully responsive (1 / 2 / 3 columns).
 * Swap the .card-swatch divs for <img> tags whenever you have real reference photos.
 */
export default function SkinProblems() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={`skin-section ${visible ? "is-visible" : ""}`}
      ref={sectionRef}
    >
      <div className="skin-section__header">
        <span className="skin-section__eyebrow">Know the signs</span>
        <h2 className="skin-section__title">Common Skin Problems</h2>
        <p className="skin-section__subtitle">
          A quick visual guide to conditions our scanner is trained to
          recognize.
        </p>
      </div>

      <div className="skin-grid">
        {PROBLEMS.map((p, i) => (
          <article
            className="skin-card"
            key={p.id}
            style={{ transitionDelay: `${i * 90}ms` }}
          >
            <div className="card-visual">
              <img src={p.image} alt={p.name} className="card-visual__img" />

              <span className="card-swatch__id">{p.id}</span>
            </div>
            <div className="card-body">
              <span className="card-tag">{p.tag}</span>
              <h3 className="card-name">{p.name}</h3>
              <p className="card-desc">{p.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
