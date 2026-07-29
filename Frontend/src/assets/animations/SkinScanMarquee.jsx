import "./SkinScanMarquee.css";

const diseases = [
  "Eczema",
  "Psoriasis",
  "Melanoma",
  "Acne Vulgaris",
  "Rosacea",
  "Vitiligo",
  "Dermatitis",
  "Ringworm",
  "Basal Cell Carcinoma",
  "Urticaria",
  "Impetigo",
  "Lichen Planus",
];

export default function SkinScanMarquee() {
  // duplicate the list once so the -50% translateX loop is seamless
  const items = [...diseases, ...diseases];

  return (
    <div className="cards2">
      <div className="card2">
        <div className="marquee-label">
          <span className="dot"></span>Scanning Database
        </div>

        <div className="marquee-wrap">
          <div className="marquee-track">
            {items.map((name, i) => (
              <div className="item-group" key={i}>
                <div className={`item ${i % 3 === 1 ? "alert" : ""}`}>
                  <span className="ring"></span>
                  <span>{name}</span>
                </div>
                <span className="sep">&#8226;</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
