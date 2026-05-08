import { cn } from "@/lib/utils";

const SIZE_MAP: Record<string, number> = { xs: 16, s: 24, m: 32, l: 40 };

// Apple keeps old SF Symbol names working as runtime aliases (e.g. when SF7
// renamed `clock.arrow.circlepath` → `clock.arrow.trianglehead.counterclockwise.rotate.90`).
// `sfsym` only exports each glyph under its canonical name, so we map iOS-faithful
// names back to the on-disk filename here. Add entries as you discover renames.
const ALIASES: Record<string, string> = {
  "clock.arrow.circlepath": "clock.arrow.trianglehead.counterclockwise.rotate.90",
  "arrow.triangle.2.circlepath": "arrow.trianglehead.2.clockwise.rotate.90",
  speedometer: "gauge.open.with.lines.needle.67percent.and.arrowtriangle",
};

export interface SFSymbolProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  name: string;
  size?: number | "xs" | "s" | "m" | "l";
}

/**
 * Renders an SF Symbol as a CSS mask, so it inherits `currentColor` like an
 * icon font but ships as the real Apple vector. Usable in client and server
 * components alike.
 */
export function SFSymbol({
  name,
  size = "s",
  className,
  style,
  ...rest
}: SFSymbolProps) {
  const px = typeof size === "number" ? size : SIZE_MAP[size];
  const resolved = ALIASES[name] ?? name;
  const url = `/sf-symbols/${resolved}.svg`;
  return (
    <span
      role="img"
      aria-hidden="true"
      className={cn("inline-block shrink-0 bg-current", className)}
      style={{
        width: px,
        height: px,
        WebkitMaskImage: `url("${url}")`,
        maskImage: `url("${url}")`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        ...style,
      }}
      {...rest}
    />
  );
}
