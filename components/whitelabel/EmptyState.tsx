import { SFSymbol } from "@/components/icons/SFSymbol";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon = "tray",
  title,
  description,
  action,
  className,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-s p-l text-center",
        className,
      )}
    >
      <SFSymbol name={icon} size="m" className="text-muted-foreground" />
      <div className="flex flex-col gap-xxs">
        <p className="text-body-large font-medium text-foreground">{title}</p>
        {description && (
          <p className="text-body-regular text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
