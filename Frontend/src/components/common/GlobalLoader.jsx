import React from "react";

/**
 * GlobalLoader — simple animated loader for DermaDetect AI
 * No logo/icon — just a themed spinner. Meant to be reused
 * across every page (route transitions, data fetches, etc.)
 *
 * Usage:
 *   <GlobalLoader />
 *   <GlobalLoader label="Analyzing image..." fullscreen={false} size={48} />
 *
 * Props:
 *   size        number   spinner diameter in px (default 64)
 *   label       string   optional text under the spinner (default "Loading...")
 *   fullscreen  boolean  fixed overlay centered on the page (default true)
 */
export default function GlobalLoader({
  size = 64,
  label = "Loading...",
  fullscreen = true,
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label || "Loading"}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        width: "100%",
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        ...(fullscreen
          ? {
              position: "fixed",
              inset: 0,
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(2px)",
              zIndex: 9999,
            }
          : { minHeight: "100%" }),
      }}
    >
      <style>{`
        :root{
          --gl-navy: #0d4f6b;
          --gl-teal: #2aa79b;
          --gl-teal-light: #7fd8cf;
        }
        .gl-ring{
          border-radius: 50%;
          border: 4px solid rgba(13, 79, 107, 0.12);
          border-top-color: var(--gl-navy);
          border-right-color: var(--gl-teal);
          animation: gl-spin 0.9s linear infinite;
        }
        .gl-core{
          border-radius: 50%;
          background: radial-gradient(circle, var(--gl-teal-light) 0%, var(--gl-teal) 70%);
          animation: gl-pulse 1.4s ease-in-out infinite;
        }
        @keyframes gl-spin{
          to { transform: rotate(360deg); }
        }
        @keyframes gl-pulse{
          0%, 100% { transform: scale(0.72); opacity: .55; }
          50%      { transform: scale(1);    opacity: 1;  }
        }
        .gl-label{
          font-size: 14px;
          font-weight: 600;
          color: var(--gl-navy);
          letter-spacing: .2px;
        }
        .gl-dots span{
          animation: gl-dotfade 1.2s ease-in-out infinite;
        }
        .gl-dots span:nth-child(1){ animation-delay: 0s; }
        .gl-dots span:nth-child(2){ animation-delay: .2s; }
        .gl-dots span:nth-child(3){ animation-delay: .4s; }
        @keyframes gl-dotfade{
          0%, 80%, 100% { opacity: .25; }
          40%           { opacity: 1;   }
        }
        @media (prefers-reduced-motion: reduce){
          .gl-ring, .gl-core, .gl-dots span{ animation: none !important; }
        }
      `}</style>

      <div style={{ position: "relative", width: size, height: size }}>
        <div
          className="gl-ring"
          style={{ position: "absolute", inset: 0 }}
        />
        <div
          className="gl-core"
          style={{
            position: "absolute",
            width: size * 0.32,
            height: size * 0.32,
            top: "50%",
            left: "50%",
            marginTop: -(size * 0.16),
            marginLeft: -(size * 0.16),
          }}
        />
      </div>

      {label && (
        <div className="gl-label">
          {label}
          <span className="gl-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </div>
      )}
    </div>
  );
}