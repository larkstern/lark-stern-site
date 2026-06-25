/**
 * Lark & Stern logo — dotted-sphere mark + serif wordmark.
 * Recreated as inline SVG from the brand logo; dots render in `pale`
 * (#C7CDDA) for dark backgrounds, navy (#1E3768) on light.
 */

export function SphereMark({
  className = "h-9 w-9",
  fill = "#1E3768",
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill={fill} aria-hidden="true">
      <circle cx="32" cy="32" r="6.5" />
      <circle cx="49" cy="35.8" r="5" />
      <circle cx="39.6" cy="47.6" r="5" />
      <circle cx="24.5" cy="47.7" r="5" />
      <circle cx="15.1" cy="35.9" r="5" />
      <circle cx="18.4" cy="21.2" r="5" />
      <circle cx="31.9" cy="14.6" r="5" />
      <circle cx="45.6" cy="21.1" r="5" />
      <circle cx="57.1" cy="32" r="2.9" />
      <circle cx="54.6" cy="42.9" r="2.9" />
      <circle cx="47.7" cy="51.6" r="2.9" />
      <circle cx="37.6" cy="56.5" r="2.9" />
      <circle cx="26.4" cy="56.5" r="2.9" />
      <circle cx="16.3" cy="51.6" r="2.9" />
      <circle cx="9.4" cy="42.9" r="2.9" />
      <circle cx="6.9" cy="32" r="2.9" />
      <circle cx="9.4" cy="21.1" r="2.9" />
      <circle cx="16.3" cy="12.4" r="2.9" />
      <circle cx="26.4" cy="7.5" r="2.9" />
      <circle cx="37.6" cy="7.5" r="2.9" />
      <circle cx="47.7" cy="12.4" r="2.9" />
      <circle cx="54.6" cy="21.1" r="2.9" />
    </svg>
  );
}

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <SphereMark className={compact ? "h-9 w-9" : "h-11 w-11"} />
      <span className={`w-px bg-[#3A3D42]/25 ${compact ? "h-9" : "h-11"}`} aria-hidden="true" />
      <span className="flex flex-col leading-none">
        <span
          className={`font-serif font-bold tracking-[0.06em] text-[#383B40] ${
            compact ? "text-lg" : "text-xl"
          }`}
        >
          LARK &amp; STERN
        </span>
        <span
          className={`mt-1.5 font-serif tracking-[0.34em] text-[#5A5E66] ${
            compact ? "text-[9px]" : "text-[11px]"
          }`}
        >
          CONSULTING INC.
        </span>
      </span>
    </span>
  );
}
