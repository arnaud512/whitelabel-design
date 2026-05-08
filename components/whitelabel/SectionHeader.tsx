import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  trailing,
  className,
}: {
  title: string;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between px-m", className)}>
      <h2 className="text-body-label-caps uppercase text-muted-foreground">
        {title}
      </h2>
      {trailing}
    </div>
  );
}
