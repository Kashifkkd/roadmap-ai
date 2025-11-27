// ScrollingLoader.jsx
import React, { useMemo } from "react";

/**
 * ScrollingLoader
 *
 * Props:
 *  - lines: string[] (required)   // list of loader lines (3-4 words each)
 *  - height: string (optional)    // container height (Tailwind-like or CSS), default "h-40"
 *  - speed: number (optional)     // seconds per item (higher = slower). default 1.2
 *  - highlightIndex: number|null  // optional index to visually emphasize a line while it scrolls
 *  - className: string (optional) // additional classes for wrapper
 *
 * Usage:
 * <ScrollingLoader lines={LINES} height="h-48" speed={1.1} highlightIndex={2} />
 */

export default function ScrollingLoader({
  lines = [],
  height = "h-48",
  speed = 1.2,
  highlightIndex = null,
  className = "",
}) {
  // if no lines provided, avoid animation
  const effectiveLines = Array.isArray(lines) && lines.length ? lines : [];

  // Duplicate the list to allow seamless scroll
  // Duration calculation: timePerItem * numberOfLines * factor (we use 2 loops of list)
  const duration = useMemo(() => {
    // Minimum duration guard
    const base = Math.max(0.5, Number(speed) || 1.2);
    return base * Math.max(1, effectiveLines.length);
  }, [speed, effectiveLines.length]);

  return (
    <div
      className={`w-full ${height} overflow-hidden relative flex items-center justify-center ${className}`}
      aria-hidden={false}
      aria-live="polite"
    >
      {/* visual center column */}
      <div className="w-full max-w-2xl mx-auto px-6">
        <div
          className="relative overflow-hidden"
          style={{ minHeight: 0 }}
        >
          {/* scroller inner: duplicates content for looping */}
          <div
            className="scroller-inner"
            style={{
              // animation-name, duration, timing controlled via CSS class below
              animationDuration: `${duration}s`,
            }}
          >
            {/* original list */}
            <ul className="flex flex-col gap-3 py-2">
              {effectiveLines.map((text, idx) => (
                <li
                  key={`line-a-${idx}`}
                  className={`loader-line text-sm sm:text-base font-medium flex items-center gap-3 opacity-90 ${
                    highlightIndex === idx ? "loader-highlight" : ""
                  }`}
                >
                  <span className="loader-dot shrink-0" aria-hidden />
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            {/* duplicated list for seamless looping */}
            <ul className="flex flex-col gap-3 py-2" aria-hidden="true">
              {effectiveLines.map((text, idx) => (
                <li
                  key={`line-b-${idx}`}
                  className={`loader-line text-sm sm:text-base font-medium flex items-center gap-3 opacity-90 ${
                    highlightIndex === idx ? "loader-highlight" : ""
                  }`}
                >
                  <span className="loader-dot shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        /* Outer scroller-inner will animate downward (items flow top -> bottom).
           We duplicate the list and animate translateY from -50% -> 0 so the second half appears seamless.
           The animation is linear and repeats infinitely.
         */
        .scroller-inner {
          display: block;
          will-change: transform;
          animation-name: scrolldown;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        @keyframes scrolldown {
          /* we travel from -50% to 0 to move content downward (loop because content is duplicated) */
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0%);
          }
        }

        /* small dot/circle to the left */
        .loader-dot {
          width: 14px;
          height: 14px;
          border-radius: 9999px;
          background: linear-gradient(180deg, #fff7cc 0%, #ffe082 100%); /* gentle warm dot */
          box-shadow: 0 0 0 4px rgba(245, 244, 252, 0.6);
        }

        /* highlighted line styling (you can tune color to match your purple theme) */
        .loader-highlight {
          color: #4c2bd9; /* purple text */
          font-weight: 600;
        }

        /* subtle fade at top/bottom to make it look glassy */
        .scroller-inner::before,
        .scroller-inner::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          height: 24%;
          pointer-events: none;
          z-index: 10;
        }
        .scroller-inner::before {
          top: 0;
          background: linear-gradient(180deg, rgba(255,255,255,1), rgba(255,255,255,0));
        }
        .scroller-inner::after {
          bottom: 0;
          background: linear-gradient(0deg, rgba(255,255,255,1), rgba(255,255,255,0));
        }

        /* responsive typography adjust */
        @media (min-width: 768px) {
          .loader-line {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
