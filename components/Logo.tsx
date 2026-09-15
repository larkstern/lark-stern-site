/**
 * Lark & Stern logo - the actual brand lockup (sphere mark + wordmark),
 * pulled from lark-stern.com so it renders pixel-identical to the live site.
 */

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <img
      src="/logo.png"
      alt="Lark & Stern Consulting Inc."
      width={900}
      height={340}
      className={compact ? "h-16 w-auto" : "h-14 w-auto"}
    />
  );
}
