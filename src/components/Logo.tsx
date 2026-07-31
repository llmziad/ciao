/** Official ICAO logo lockup used in headers, with a "Digital Identity" tag. */
export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/icao-logo.png" alt="ICAO" className="h-8 w-auto" />
      <span className="border-l border-line pl-2.5 font-display text-xs font-semibold text-muted">
        Digital Identity
      </span>
    </div>
  );
}
