"use client";

export default function GradientLoader({ size = 24 }) {
  const ring = Math.max(3, Math.round(size * 0.14));

  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `conic-gradient(from 90deg at 50% 50%, rgba(115, 103, 240, 0) 0deg, #7367F0 359.96deg, rgba(115, 103, 240, 0) 360deg)`,
        WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${ring}px - 0.5px), #000 calc(100% - ${ring}px))`,
        mask: `radial-gradient(farthest-side, transparent calc(100% - ${ring}px - 0.5px), #000 calc(100% - ${ring}px))`,
        animation: "gradientSpin 1s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}
