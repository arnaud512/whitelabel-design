"use client";

import { Card } from "@/components/whitelabel/Card";
import { SectionHeader } from "@/components/whitelabel/SectionHeader";
import { SFSymbol } from "@/components/icons/SFSymbol";
import { cn } from "@/lib/utils";

interface Row {
  icon: string;
  iconBg?: string;
  label: string;
  value?: string;
  destructive?: boolean;
}

const account: Row[] = [
  { icon: "person.fill", iconBg: "bg-accent", label: "Profile", value: "Jordan" },
  { icon: "envelope.fill", iconBg: "bg-primary", label: "Email", value: "jordan@example.com" },
  { icon: "key.fill", iconBg: "bg-muted-foreground", label: "Sign-in & security" },
];

const preferences: Row[] = [
  { icon: "bell.fill", iconBg: "bg-accent", label: "Notifications", value: "On" },
  { icon: "moon.fill", iconBg: "bg-primary", label: "Appearance", value: "System" },
  { icon: "globe", iconBg: "bg-muted-foreground", label: "Language", value: "English" },
];

const danger: Row[] = [
  { icon: "rectangle.portrait.and.arrow.right", label: "Sign out" },
  { icon: "trash.fill", label: "Delete account", destructive: true },
];

function RowList({ rows }: { rows: Row[] }) {
  return (
    <Card className="mx-m !p-0 overflow-hidden">
      <ul className="divide-y divide-border">
        {rows.map((row) => (
          <li key={row.label}>
            <button
              type="button"
              className="flex w-full items-center gap-s px-m py-s text-left"
            >
              <span
                className={cn(
                  "flex h-icon-s w-icon-s items-center justify-center rounded-sm text-primary-foreground",
                  row.iconBg ?? "bg-muted-foreground",
                )}
              >
                <SFSymbol name={row.icon} size="xs" className="text-white" />
              </span>
              <span
                className={cn(
                  "flex-1 text-body-regular",
                  row.destructive ? "text-destructive" : "text-foreground",
                )}
              >
                {row.label}
              </span>
              {row.value && (
                <span className="text-body-regular text-muted-foreground">
                  {row.value}
                </span>
              )}
              <SFSymbol
                name="chevron.right"
                size="xs"
                className="text-muted-foreground"
              />
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function Settings() {
  return (
    <div className="flex flex-col gap-l bg-background pb-xl">
      <header className="px-m pt-l">
        <h1 className="font-display text-h1 text-foreground">Settings</h1>
      </header>

      <section className="flex flex-col gap-s">
        <SectionHeader title="Account" />
        <RowList rows={account} />
      </section>

      <section className="flex flex-col gap-s">
        <SectionHeader title="Preferences" />
        <RowList rows={preferences} />
      </section>

      <section className="flex flex-col gap-s">
        <SectionHeader title="Danger zone" />
        <RowList rows={danger} />
      </section>

      <p className="px-m text-center text-body-label text-muted-foreground">
        Version 1.0.0 · whitelabel-design
      </p>
    </div>
  );
}
