import { cn } from "@/lib/utils";

export type PillStyle = "neutral" | "accent" | "prominent";

const STYLES: Record<PillStyle, string> = {
  neutral: "bg-muted text-foreground",
  accent: "bg-accent text-accent-foreground",
  prominent: "bg-primary text-primary-foreground",
};

export function Pill({
  text,
  style = "neutral",
  className,
}: {
  text: string;
  style?: PillStyle;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full whitespace-nowrap px-s py-xxs text-body-label",
        STYLES[style],
        className,
      )}
    >
      {text}
    </span>
  );
}
