import { cn } from "@/lib/utils";

export type GlassButtonVariant = "glass" | "tinted" | "prominent";

export function GlassButton({
  variant = "glass",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: GlassButtonVariant;
}) {
  return (
    <button
      type="button"
      className={cn(
        "glass-pressable inline-flex items-center justify-center gap-xs rounded-full px-m py-xs text-body-regular font-medium",
        variant === "glass" && "glass text-foreground",
        variant === "tinted" && "glass-tinted text-foreground",
        variant === "prominent" && "glass-prominent",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
