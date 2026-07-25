import React from "react";

export default function ApplyPilotLogo({
  showTagline = false,
  iconOnly = false,
  iconSize = "w-9 h-9",
  textSize = "text-xl",
  textColor = "text-white",
  className = "",
}) {
  const iconMarkup = (
    <svg
      className={`${iconSize} shrink-0`}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Main "A" shape gradient (Cyan-Blue to Violet-Purple) - Boosted Vibrancy */}
        <linearGradient id="a-gradient" x1="60" y1="20" x2="160" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00d2ff" /> {/* Vibrant Cyan */}
          <stop offset="50%" stopColor="#0066ff" /> {/* Vibrant Royal Blue */}
          <stop offset="100%" stopColor="#7c3aed" /> {/* Vibrant Violet */}
        </linearGradient>

        {/* Speed lines gradient */}
        <linearGradient id="speed-gradient" x1="16" y1="0" x2="50" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00d2ff" /> {/* Vibrant Cyan */}
          <stop offset="100%" stopColor="#0066ff" /> {/* Vibrant Royal Blue */}
        </linearGradient>

        {/* Orbital arc gradient */}
        <linearGradient id="arc-gradient" x1="120" y1="40" x2="170" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0066ff" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>

        {/* Paper airplane fold shadow */}
        <linearGradient id="plane-shadow" x1="96" y1="128" x2="165" y2="65" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#102a73" /> {/* Very deep blue shadow */}
          <stop offset="100%" stopColor="#0055ff" /> {/* Royal Blue highlight */}
        </linearGradient>

        {/* Mask to cut the diagonal channel in the left leg */}
        <mask id="left-leg-split">
          {/* Render everything in white by default */}
          <rect x="0" y="0" width="200" height="160" fill="white" />
          {/* Sliced channel (black) */}
          <polygon points="28,118 88,94 94,103 34,127" fill="black" />
        </mask>
      </defs>

      {/* Group containing the A frame and crossbar, masked to create the left leg split */}
      <g mask="url(#left-leg-split)">
        {/* Main "A" Frame (Hollow Lambda Arch) */}
        <path
          d="M 46,140 L 91,30 C 93.5,24 106.5,24 109,30 L 154,140 C 155.5,143.5 153.5,147 149.5,147 L 125,147 C 122,147 120,144.5 119,141.5 L 100,74 L 81,141.5 C 80,144.5 78,147 75,147 L 50.5,147 C 46.5,147 44.5,143.5 46,140 Z"
          fill="url(#a-gradient)"
        />
        {/* Horizontal Crossbar (Merges with legs) */}
        <polygon points="85,98 115,98 118,109 82,109" fill="url(#a-gradient)" />
      </g>

      {/* 3. Speed / Velocity Lines (Left side) */}
      <rect x="24" y="90" width="22" height="6.5" rx="3.25" fill="url(#speed-gradient)" />
      <rect x="16" y="104" width="34" height="6.5" rx="3.25" fill="url(#speed-gradient)" />
      <rect x="32" y="118" width="16" height="6.5" rx="3.25" fill="url(#speed-gradient)" />

      {/* 4. Orbital Arc & Dot (Right side) */}
      <path
        d="M 128,48 A 46,46 0 0 1 176,95 A 46,46 0 0 1 152,134"
        stroke="url(#arc-gradient)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="152" cy="134" r="4.5" fill="#7c3aed" />

      {/* 5. Paper Airplane Speed Trail (Layered 3D glow: Purple shadow, Cyan highlight, White body) */}
      {/* Purple bottom glow */}
      <polygon
        points="76,114 56,122 62,124 40,132 46,134 24,142 32,144 14,151 30,143 24,141 46,133 40,131 62,123 56,121 78,113"
        fill="#7c3aed"
        transform="translate(1.5, 1.5)"
        opacity="0.65"
      />
      {/* Cyan top glow */}
      <polygon
        points="76,114 56,122 62,124 40,132 46,134 24,142 32,144 14,151 30,143 24,141 46,133 40,131 62,123 56,121 78,113"
        fill="#00d2ff"
        transform="translate(-1.5, -1.5)"
        opacity="0.85"
      />
      {/* Main white body */}
      <polygon
        points="76,114 56,122 62,124 40,132 46,134 24,142 32,144 14,151 30,143 24,141 46,133 40,131 62,123 56,121 78,113"
        fill="#ffffff"
      />

      {/* 6. Paper Airplane - Under Shadow / Fold (Deep Blue/Indigo) */}
      <path
        d="M 165,65 L 114,108 L 96,128 Z"
        fill="url(#plane-shadow)"
      />

      {/* 7. Paper Airplane - Main Wings (White & Gray highlight) */}
      <path
        d="M 165,65 L 74,116 L 114,108 Z"
        fill="#ffffff"
      />
      {/* Small blue bottom wing fold detail */}
      <path
        d="M 114,108 L 96,128 L 102,118 Z"
        fill="#0066ff"
      />
    </svg>
  );

  if (iconOnly) {
    return iconMarkup;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {iconMarkup}
      {/* Brand Typography & Tagline Container */}
      <div className="flex flex-col justify-center">
        <span className={`font-extrabold tracking-tight ${textSize} ${textColor} leading-none`}>
          ApplyPilot
        </span>
        {showTagline && (
          <span className="text-[10px] sm:text-xs text-[var(--text-secondary)] font-medium mt-1 tracking-wider uppercase">
            Apply Smarter. Get More Interviews.
          </span>
        )}
      </div>
    </div>
  );
}
