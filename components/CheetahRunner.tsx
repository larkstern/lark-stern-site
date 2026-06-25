"use client";

/**
 * CheetahRunner — the brand's signature: a cheetah in full extended gallop,
 * sprinting across the hero with motion-blur afterimages for kinetic speed.
 * Composed SVG silhouette + CSS `sprint` keyframe; reduced-motion users get a
 * single static frame (global media query collapses the animation).
 *
 * The silhouette is built from filled body masses + stroked legs/tail so both
 * `fill` and `stroke` follow `currentColor` — letting each trailing copy fade
 * via its wrapper's text color.
 */

function CheetahShape({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 340 185"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <g
        fill="currentColor"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* legs — gallop: hind drive back-left, front reach forward-right */}
        <path d="M104 100 L44 170" strokeWidth="13" fill="none" />
        <path d="M126 102 L92 170" strokeWidth="13" fill="none" />
        <path d="M228 106 L300 170" strokeWidth="13" fill="none" />
        <path d="M210 106 L266 168" strokeWidth="13" fill="none" />
        {/* tail */}
        <path d="M76 94 C42 90 17 74 8 38 C5 31 16 31 19 42 C29 72 50 86 78 84 Z" />
        {/* lean body masses (deep chest + haunch, thin waist) */}
        <ellipse cx="158" cy="98" rx="88" ry="19" />
        <ellipse cx="100" cy="92" rx="40" ry="30" />
        <ellipse cx="226" cy="94" rx="34" ry="26" />
        {/* neck */}
        <ellipse cx="257" cy="88" rx="28" ry="15" transform="rotate(-16 257 88)" />
        {/* head + short muzzle */}
        <circle cx="290" cy="79" r="13" />
        <ellipse cx="306" cy="85" rx="12" ry="7" />
        {/* small low-set cat ears */}
        <circle cx="285" cy="67" r="4.5" />
        <circle cx="296" cy="68" r="4.5" />
      </g>
    </svg>
  );
}

export default function CheetahRunner({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <div className="animate-sprint absolute top-0 flex items-center will-change-transform">
        {/* motion-blur trails (faintest / oldest first) */}
        <span className="absolute right-[150px] text-cheetah/10">
          <CheetahShape className="h-28 w-56 blur-[3px] md:h-36 md:w-72" />
        </span>
        <span className="absolute right-[78px] text-cheetah/20">
          <CheetahShape className="h-28 w-56 blur-[2px] md:h-36 md:w-72" />
        </span>
        <span className="absolute right-[26px] text-cheetah/40">
          <CheetahShape className="h-28 w-56 blur-[1px] md:h-36 md:w-72" />
        </span>
        {/* lead silhouette */}
        <span className="relative text-cheetah-deep/70">
          <CheetahShape className="h-28 w-56 md:h-36 md:w-72" />
        </span>
      </div>
    </div>
  );
}
