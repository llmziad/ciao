"use client";

/** Small accessible info tooltip (hover + keyboard focus). */
export function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex align-middle">
      <span
        tabIndex={0}
        role="img"
        aria-label={text}
        className="flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-muted text-[10px] font-bold leading-none text-muted"
      >
        i
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-6 z-20 w-60 -translate-x-1/2 rounded-lg bg-icao-navy px-3 py-2 text-xs font-normal leading-snug text-white opacity-0 shadow-pop transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}
