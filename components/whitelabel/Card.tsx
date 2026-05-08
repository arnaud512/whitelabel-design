import { cn } from "@/lib/utils";

export type CardVariant = "default" | "glass" | "tinted" | "prominent";

export function Card({
  variant = "default",
  className,
  children,
}: {
  variant?: CardVariant;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg p-m",
        variant === "default" && "bg-card text-card-foreground border border-border",
        variant === "glass" && "glass text-foreground",
        variant === "tinted" && "glass-tinted text-foreground",
        variant === "prominent" && "glass-prominent",
        className,
      )}
    >
      {children}
    </div>
  );
}
