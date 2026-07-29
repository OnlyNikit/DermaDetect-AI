import { useEffect, useRef, useState } from "react";

// Drop this component anywhere, e.g. <SkinScanHero /> inside your hero section.
// No external deps — pure SVG + React state/refs for the animation.

const POINTS = [
  { x: 170, y: 175, risk: "Low", label: "Even border, uniform tone" },
  { x: 235, y: 160, risk: "Watch", label: "Irregular edge detected" },
  { x: 210, y: 245, risk: "Low", label: "Symmetrical, stable" },
  { x: 150, y: 235, risk: "Watch", label: "Color variation flagged" },
];

const VB = 400;

export default function SkinScanHero() {
  const scannerRef = useRef(null);
  const beamRef = useRef(null);
  const lensRef = useRef(null);
  const lensInnerRef = useRef(null);
  const crossVRef = useRef(null);
  const crossHRef = useRef(null);

  const [visibleMarkers, setVisibleMarkers] = useState([]);
  const [tooltip, setTooltip] = useState(null); // { x, y, risk, label }
  const [texture] = useState(() =>
    Array.from({ length: 70 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 115;
      return {
        cx: 200 + Math.cos(angle) * r,
        cy: 200 + Math.sin(angle) * r * 0.95,
        r: Math.random() * 1.4 + 0.4,
      };
    })
  );

  const targetPos = useRef({ x: 200, y: 200 });
  const curPos = useRef({ x: 200, y: 200 });
  const beamY = useRef(-90);
  const idleTimer = useRef(null);

  // reveal markers one by one, like the scan is "finding" them
  useEffect(() => {
    const timers = POINTS.map((_, i) =>
      setTimeout(() => {
        setVisibleMarkers((prev) => [...prev, i]);
      }, 900 + i * 650)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // rAF loop: lens follows pointer (with easing), beam scrolls vertically
  useEffect(() => {
    let raf;
    const tick = () => {
      curPos.current.x += (targetPos.current.x - curPos.current.x) * 0.12;
      curPos.current.y += (targetPos.current.y - curPos.current.y) * 0.12;
      const { x, y } = curPos.current;

      if (lensRef.current) {
        lensRef.current.setAttribute("cx", x.toFixed(1));
        lensRef.current.setAttribute("cy", y.toFixed(1));
      }
      if (lensInnerRef.current) {
        lensInnerRef.current.setAttribute("cx", x.toFixed(1));
        lensInnerRef.current.setAttribute("cy", y.toFixed(1));
      }
      if (crossVRef.current) {
        crossVRef.current.setAttribute("x1", x.toFixed(1));
        crossVRef.current.setAttribute("x2", x.toFixed(1));
        crossVRef.current.setAttribute("y1", (y - 46).toFixed(1));
        crossVRef.current.setAttribute("y2", (y + 46).toFixed(1));
      }
      if (crossHRef.current) {
        crossHRef.current.setAttribute("y1", y.toFixed(1));
        crossHRef.current.setAttribute("y2", y.toFixed(1));
        crossHRef.current.setAttribute("x1", (x - 46).toFixed(1));
        crossHRef.current.setAttribute("x2", (x + 46).toFixed(1));
      }

      beamY.current += 1.6;
      if (beamY.current > 400) beamY.current = -90;
      if (beamRef.current) beamRef.current.setAttribute("y", beamY.current.toFixed(1));

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  function handlePointerMove(e) {
    const rect = scannerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * VB;
    const y = ((e.clientY - rect.top) / rect.height) * VB;
    targetPos.current = {
      x: Math.max(50, Math.min(350, x)),
      y: Math.max(50, Math.min(350, y)),
    };

    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      targetPos.current = { x: 200, y: 200 };
    }, 1400);

    let hovered = null;
    for (const p of POINTS) {
      const dx = p.x - targetPos.current.x;
      const dy = p.y - targetPos.current.y;
      if (Math.sqrt(dx * dx + dy * dy) < 20) {
        hovered = p;
        break;
      }
    }
    if (hovered) {
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        risk: hovered.risk,
        label: hovered.label,
      });
    } else {
      setTooltip(null);
    }
  }

  function handlePointerLeave() {
    targetPos.current = { x: 200, y: 200 };
    setTooltip(null);
  }

  const spotCount = visibleMarkers.length;
  const confidence = spotCount ? `${92 + spotCount}%` : "—";

  return (
    <div className="ssh-hero">
      <style>{`
        .ssh-hero {
          --bg: #0A1414;
          --bg-2: #0F1D1D;
          --panel: #101f1f;
          --line: rgba(79, 209, 197, 0.18);
          --scan: #4FD1C5;
          --alert: #FF7A59;
          --text: #EAF3F1;
          --muted: #7FA79E;
          --font-display: Georgia, 'Iowan Old Style', serif;
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: 56px;
          max-width: 1080px;
          width: 100%;
          margin: 0 auto;
          align-items: center;
          padding: 40px 20px;
          color: var(--text);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        @media (max-width: 860px) { .ssh-hero { grid-template-columns: 1fr; } }

        .ssh-copy .ssh-eyebrow {
          font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--scan); font-weight: 600; margin-bottom: 14px;
        }
        .ssh-copy h1 {
          font-family: var(--font-display);
          font-size: clamp(34px, 4.4vw, 54px);
          line-height: 1.05; margin: 0 0 18px; font-weight: 500;
        }
        .ssh-copy h1 em { font-style: normal; color: var(--scan); }
        .ssh-copy p {
          color: var(--muted); font-size: 16px; line-height: 1.6;
          max-width: 46ch; margin: 0 0 28px;
        }
        .ssh-cta {
          display: inline-flex; align-items: center; gap: 10px;
          background: var(--scan); color: #06201d; border: none;
          padding: 13px 22px; border-radius: 999px; font-weight: 600;
          font-size: 14px; cursor: pointer;
        }

        .ssh-scanner {
          position: relative; height:400px; max-width: none !important; 
          width:550px !important; width:100%;
          margin: 0 auto; border-radius: 28px; background: var(--panel);
          border: 1px solid var(--line); overflow: hidden; cursor: crosshair;
          box-shadow: 0 30px 80px -30px rgba(0,0,0,0.6);
        }
        .ssh-scanner svg { width: 100%; height: 100%; display: block; }

        .ssh-hud {
          position: absolute; top: 16px; left: 16px; right: 16px;
          display: flex; justify-content: space-between; font-size: 11px;
          letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted);
          pointer-events: none; z-index: 5;
        }
        .ssh-hud .ssh-rec { color: var(--alert); display: flex; align-items: center; gap: 6px; }
        .ssh-hud .ssh-rec::before {
          content: ''; width: 6px; height: 6px; border-radius: 50%;
          background: var(--alert); animation: ssh-blink 1.4s infinite;
        }
        @keyframes ssh-blink { 50% { opacity: .25; } }

        .ssh-readout {
          position: absolute; bottom: 16px; left: 16px; right: 16px;
          display: flex; justify-content: space-between; align-items: flex-end;
          font-size: 11px; color: var(--muted); z-index: 5; pointer-events: none;
        }
        .ssh-readout .ssh-count {
          font-family: var(--font-display); font-size: 26px; color: var(--text); line-height: 1;
        }

        .ssh-tooltip {
          position: absolute; transform: translate(-50%, -130%);
          background: rgba(10,20,20,0.92); border: 1px solid var(--line);
          color: var(--text); font-size: 11px; padding: 6px 10px;
          border-radius: 8px; white-space: nowrap; pointer-events: none; z-index: 10;
        }
        .ssh-tooltip .ssh-risk { color: var(--alert); font-weight: 600; }
        @media (max-width:1275px){
        .ssh-scanner{
        width:459px !important;
        }}

        @media (max-width:1100px){
        .ssh-scanner{
        width:400px !important;
        }}
        @media (max-width:990px){
        .ssh-scanner{
        
        width:550px !important;
        }}

        @media (max-width:1275px){
        .ssh-scanner{
        width:459px !important;
        }}
        @media (max-width:540px){
        .ssh-scanner{
        width:300px !important;
        }}
      `}</style>

     

      <div
        className="ssh-scanner"
        ref={scannerRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <div className="ssh-hud">
          <span className="ssh-rec">Scanning</span>
          <span>Analyzing texture…</span>
        </div>

        <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="ssh-skinGrad" cx="50%" cy="42%" r="65%">
              <stop offset="0%" stopColor="#F0C4A4" />
              <stop offset="55%" stopColor="#E0A47F" />
              <stop offset="100%" stopColor="#B97A5C" />
            </radialGradient>

            <linearGradient id="ssh-beamGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4FD1C5" stopOpacity="0" />
              <stop offset="45%" stopColor="#4FD1C5" stopOpacity="0.55" />
              <stop offset="55%" stopColor="#4FD1C5" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#4FD1C5" stopOpacity="0" />
            </linearGradient>

            <pattern id="ssh-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(79,209,197,0.08)" strokeWidth="1" />
            </pattern>

            <clipPath id="ssh-cardClip">
              <rect x="0" y="0" width="400" height="400" />
            </clipPath>
          </defs>

          <g clipPath="url(#ssh-cardClip)">
            <rect width="400" height="400" fill="#0F1D1D" />

            <path
              d="M 200 90
                 C 270 88, 320 130, 322 200
                 C 324 270, 275 320, 202 318
                 C 130 316, 80 268, 80 200
                 C 80 132, 130 92, 200 90 Z"
              fill="url(#ssh-skinGrad)"
              opacity="0.9"
            />

            <g opacity="0.35">
              {texture.map((t, i) => (
                <circle key={i} cx={t.cx.toFixed(1)} cy={t.cy.toFixed(1)} r={t.r.toFixed(1)} fill="#7a4a34" />
              ))}
            </g>

            <g>
              {POINTS.map((p, i) => {
                const isVisible = visibleMarkers.includes(i);
                const isWatch = p.risk === "Watch";
                const color = isWatch ? "var(--alert)" : "var(--scan)";
                return (
                  <g key={i} opacity={isVisible ? 1 : 0} style={{ transition: "opacity .4s ease" }}>
                    <circle cx={p.x} cy={p.y} r={10} fill="none" stroke={color} strokeWidth="1.4">
                      {isWatch && (
                        <>
                          <animate attributeName="r" values="8;16;8" dur="2.2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.9;0;0.9" dur="2.2s" repeatCount="indefinite" />
                        </>
                      )}
                    </circle>
                    <circle cx={p.x} cy={p.y} r={2.2} fill={color} />
                  </g>
                );
              })}
            </g>

            <rect width="400" height="400" fill="url(#ssh-grid)" />

            <rect ref={beamRef} x="0" y="0" width="400" height="90" fill="url(#ssh-beamGrad)" />

            <circle ref={lensRef} cx="200" cy="200" r="46" fill="none" stroke="#4FD1C5" strokeWidth="1.5" opacity="0.9" />
            <circle ref={lensInnerRef} cx="200" cy="200" r="2" fill="#4FD1C5" />
            <line ref={crossVRef} x1="200" y1="154" x2="200" y2="246" stroke="#4FD1C5" strokeWidth="0.6" opacity="0.5" />
            <line ref={crossHRef} x1="154" y1="200" x2="246" y2="200" stroke="#4FD1C5" strokeWidth="0.6" opacity="0.5" />

            <rect x="1" y="1" width="398" height="398" fill="none" stroke="rgba(79,209,197,0.25)" strokeWidth="1" />
          </g>
        </svg>

        {tooltip && (
          <div
            className="ssh-tooltip"
            style={{ left: tooltip.x, top: tooltip.y, opacity: 1 }}
          >
            <span className="ssh-risk">{tooltip.risk === "Watch" ? "⚠ Watch" : "✓ Low risk"}</span>
            {" — "}
            {tooltip.label}
          </div>
        )}

        <div className="ssh-readout">
          <div>
            <div>Spots detected</div>
            <div className="ssh-count">{spotCount}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div>Confidence</div>
            <div style={{ color: "var(--text)", fontSize: 14 }}>{confidence}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
