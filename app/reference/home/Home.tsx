"use client";

import { useScenario } from "@/components/frame/Switcher";
import { useTweakBool, useTweakNumber } from "@/components/frame/LiveTweaks";
import { Card } from "@/components/whitelabel/Card";
import { GlassButton } from "@/components/whitelabel/GlassButton";
import { Pill } from "@/components/whitelabel/Pill";
import { SectionHeader } from "@/components/whitelabel/SectionHeader";
import { EmptyState } from "@/components/whitelabel/EmptyState";
import { SFSymbol } from "@/components/icons/SFSymbol";
import { buildFeed, type FeedScenarioKey } from "@/lib/fixtures/example";
import { cn } from "@/lib/utils";

export function Home() {
  const scenario = (useScenario() ?? "populated") as FeedScenarioKey;
  const itemCount = useTweakNumber("itemCount", 6);
  const darkChrome = useTweakBool("darkChrome");
  const state = buildFeed(scenario, itemCount);

  return (
    <div
      className={cn(
        "flex flex-col gap-l bg-background pb-xl",
        darkChrome && "dark-chrome",
      )}
    >
      <header className="flex flex-col gap-xxs px-m pt-l">
        <p className="text-body-label-caps uppercase text-muted-foreground">
          Today
        </p>
        <h1 className="font-display text-h1 text-foreground">Hello there</h1>
      </header>

      <section className="flex flex-col gap-s">
        <SectionHeader
          title="Quick actions"
          trailing={
            <button className="text-body-label text-muted-foreground">
              Edit
            </button>
          }
        />
        <div className="grid grid-cols-3 gap-s px-m">
          {[
            { icon: "sparkles", label: "New" },
            { icon: "magnifyingglass", label: "Search" },
            { icon: "bell", label: "Alerts" },
          ].map((action) => (
            <GlassButton
              key={action.label}
              variant="glass"
              className="flex-col rounded-lg !py-m"
            >
              <SFSymbol name={action.icon} size="s" />
              <span className="text-body-label">{action.label}</span>
            </GlassButton>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-s">
        <SectionHeader title="Recent" />
        {state.loading ? (
          <Card className="mx-m">
            <div className="flex items-center gap-s text-muted-foreground">
              <SFSymbol
                name="arrow.triangle.2.circlepath"
                size="xs"
                className="animate-spin"
              />
              <span className="text-body-regular">Loading…</span>
            </div>
          </Card>
        ) : state.items.length === 0 ? (
          <Card className="mx-m">
            <EmptyState
              icon="tray"
              title="Nothing here yet"
              description="Items you add will show up in this list."
              action={
                <GlassButton variant="prominent">Add your first</GlassButton>
              }
            />
          </Card>
        ) : (
          <ul className="flex flex-col gap-s px-m">
            {state.items.map((item) => (
              <li key={item.id}>
                <Card variant="glass" className="flex items-start gap-s">
                  <SFSymbol
                    name={item.icon}
                    size="s"
                    className="mt-xxs text-foreground"
                  />
                  <div className="flex flex-1 flex-col gap-xxs">
                    <div className="flex items-center justify-between gap-s">
                      <p className="text-body-large font-medium text-foreground">
                        {item.title}
                      </p>
                      {item.tag && <Pill text={item.tag} style="neutral" />}
                    </div>
                    <p className="text-body-regular text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                  <SFSymbol
                    name="chevron.right"
                    size="xs"
                    className="mt-xxs text-muted-foreground"
                  />
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
