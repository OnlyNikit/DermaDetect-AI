import React, { useEffect, useRef, useState } from "react";

/**
 * DermaDetect AI — animated loader
 *
 * Usage:
 *   <Loader1 />
 *   <Loader1 size={160} showText={false} fullscreen />
 *
 * Props:
 *   size        number   icon size in px (default 120)
 *   showText    boolean  show "DermaDetect AI" wordmark + status line (default true)
 *   fullscreen  boolean  render as a fixed fullscreen overlay (default false)
 *   messages    string[] optional custom list of status messages to cycle through
 *   interval    number   ms between message changes (default 1800)
 */
export default function Loader1({
  size = 120,
  showText = true,
  fullscreen = true,
  messages,
  interval = 1800,
}) {
  const defaultMessages = [
    "Analyzing skin texture...",
    "Detecting surface patterns...",
    "Scanning for irregularities...",
    "Mapping pigmentation zones...",
    "Cross-checking with AI model...",
    "Evaluating skin condition...",
    "Finalizing prediction...",
  ];

  const list = messages && messages.length ? messages : defaultMessages;

  const [msgIndex, setMsgIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setFade(false); // fade out
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % list.length);
        setFade(true); // fade in next message
      }, 220); // matches CSS transition duration below
    }, interval);

    return () => clearInterval(timerRef.current);
  }, [list, interval]);

  return (
    <div
      role="status"
      aria-label="Loading DermaDetect AI"
      aria-live="polite"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 22,
        width: "100%",
        fontFamily:
          "'Segoe UI', system-ui, -apple-system, sans-serif",
        ...(fullscreen
          ? {
              position: "fixed",
              inset: 0,
              background: "#ffffff",
              zIndex: 9999,
            }
          : {
              minHeight: "100%",
            }),
      }}
    >
      <style>{`
        :root{
          --ddai-navy: #0d4f6b;
          --ddai-teal: #2aa79b;
          --ddai-teal-light: #7fd8cf;
        }
        .ddai-lens-group{
          transform-origin: 55px 55px;
          animation: ddai-sweep 2.2s ease-in-out infinite;
        }
        @keyframes ddai-sweep{
          0%   { transform: rotate(-6deg); }
          50%  { transform: rotate(6deg); }
          100% { transform: rotate(-6deg); }
        }
        .ddai-scan-line{
          stroke: var(--ddai-teal-light);
          stroke-width: 2.5;
          opacity: 0;
          animation: ddai-scan 2.2s ease-in-out infinite;
        }
        @keyframes ddai-scan{
          0%   { opacity:0; transform: translateY(-14px); }
          35%  { opacity:1; }
          65%  { opacity:1; }
          100% { opacity:0; transform: translateY(14px); }
        }
        .ddai-dot{ animation: ddai-blip 1.8s ease-in-out infinite; }
        .ddai-dot:nth-child(1){ animation-delay: 0s; }
        .ddai-dot:nth-child(2){ animation-delay: .15s; }
        .ddai-dot:nth-child(3){ animation-delay: .3s; }
        .ddai-dot:nth-child(4){ animation-delay: .45s; }
        .ddai-dot:nth-child(5){ animation-delay: .6s; }
        .ddai-dot:nth-child(6){ animation-delay: .75s; }
        .ddai-dot:nth-child(7){ animation-delay: .9s; }
        .ddai-dot:nth-child(8){ animation-delay: 1.05s; }
        @keyframes ddai-blip{
          0%, 100% { opacity:.35; r:2.6; }
          50%      { opacity:1;  r:4; }
        }
        .ddai-spark{ animation: ddai-twinkle 1.6s ease-in-out infinite; }
        .ddai-spark.small{ animation-delay:.4s; }
        @keyframes ddai-twinkle{
          0%, 100%{ opacity:.3; transform: scale(.7); }
          50%     { opacity:1;  transform: scale(1.05); }
        }
        .ddai-status-text{
          transition: opacity .22s ease, transform .22s ease;
        }
        .ddai-status-text.ddai-fade-in{
          opacity: 1;
          transform: translateY(0);
        }
        .ddai-status-text.ddai-fade-out{
          opacity: 0;
          transform: translateY(4px);
        }
        .ddai-status-bar{
          position: relative;
          width: 140px;
          height: 3px;
          border-radius: 3px;
          background: rgba(13,79,107,0.12);
          overflow: hidden;
        }
        .ddai-status-bar::after{
          content: "";
          position: absolute;
          top: 0; left: 0;
          height: 100%;
          width: 40%;
          border-radius: 3px;
          background: linear-gradient(90deg, var(--ddai-teal), var(--ddai-navy));
          animation: ddai-bar-sweep 1.4s ease-in-out infinite;
        }
        @keyframes ddai-bar-sweep{
          0%   { left: -40%; }
          100% { left: 100%; }
        }
        @media (prefers-reduced-motion: reduce){
          .ddai-lens-group, .ddai-scan-line, .ddai-dot, .ddai-spark, .ddai-status-bar::after{
            animation: none !important;
          }
          .ddai-status-text{ transition: none !important; }
        }
      `}</style>

      <div style={{ width: size, height: size }}>
        <svg viewBox="0 0 130 130" width="100%" height="100%" style={{ overflow: "visible" }}>
          <defs>
            <clipPath id="ddaiFaceClip">
              <circle cx="55" cy="55" r="34" />
            </clipPath>
          </defs>

          {/* sparkles */}
          <g className="ddai-spark" fill="var(--ddai-teal)">
            <path d="M108 18 L111 26 L119 29 L111 32 L108 40 L105 32 L97 29 L105 26 Z" />
          </g>
          <g className="ddai-spark small" fill="var(--ddai-teal-light)">
            <path d="M118 34 L119.5 38 L123.5 39.5 L119.5 41 L118 45 L116.5 41 L112.5 39.5 L116.5 38 Z" />
          </g>

          {/* magnifier: ring + handle + face + dots + scan line, all swaying together */}
          <g className="ddai-lens-group">
            <circle cx="55" cy="55" r="34" fill="none" stroke="var(--ddai-navy)" strokeWidth="6" />
            <circle
              cx="55"
              cy="55"
              r="34"
              fill="none"
              stroke="var(--ddai-teal)"
              strokeWidth="6"
              strokeDasharray="106 320"
              transform="rotate(-40 55 55)"
            />

            <g clipPath="url(#ddaiFaceClip)">
              <path
                d="M40 26 C30 30 24 42 24 55 C24 72 36 86 52 88 L52 78 L58 76 L56 70 L60 66 L58 60 L62 55 L58 24 C54 22 46 23 40 26 Z"
                fill="none"
                stroke="var(--ddai-navy)"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <g fill="var(--ddai-teal)">
                <circle className="ddai-dot" cx="36" cy="40" r="3" />
                <circle className="ddai-dot" cx="44" cy="36" r="2.6" />
                <circle className="ddai-dot" cx="33" cy="49" r="2.6" />
                <circle className="ddai-dot" cx="41" cy="47" r="3" />
                <circle className="ddai-dot" cx="48" cy="43" r="2.6" />
                <circle className="ddai-dot" cx="37" cy="58" r="2.6" />
                <circle className="ddai-dot" cx="45" cy="56" r="3" />
                <circle className="ddai-dot" cx="33" cy="66" r="2.6" />
              </g>
            </g>

            <line className="ddai-scan-line" x1="24" y1="55" x2="86" y2="55" />

            {/* handle: attaches at the ring's edge (45°) and extends outward */}
            <rect
              x="78"
              y="75.5"
              width="36"
              height="9"
              rx="4.5"
              fill="var(--ddai-navy)"
              transform="rotate(45 78 80)"
            />
          </g>
        </svg>
      </div>

      {showText && (
        <>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 0.2,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <span style={{ color: "var(--ddai-navy)" }}>Derma</span>
            <span style={{ color: "var(--ddai-teal)" }}>Detect</span>
            <span
              style={{
                background: "var(--ddai-navy)",
                color: "var(--ddai-teal-light)",
                fontSize: 13,
                padding: "2px 7px",
                borderRadius: 6,
                marginLeft: 6,
              }}
            >
              AI
            </span>
          </div>

          <div
            className={`ddai-status-text ${fade ? "ddai-fade-in" : "ddai-fade-out"}`}
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--ddai-navy)",
              letterSpacing: 0.2,
              minHeight: 18,
              textAlign: "center",
            }}
          >
            {list[msgIndex]}
          </div>

          <div className="ddai-status-bar" />
        </>
      )}
    </div>
  );
}