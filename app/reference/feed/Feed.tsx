"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useScenario } from "@/components/frame/Switcher";
import { useTweakBool } from "@/components/frame/LiveTweaks";
import { Card } from "@/components/whitelabel/Card";
import { GlassButton } from "@/components/whitelabel/GlassButton";
import { Pill } from "@/components/whitelabel/Pill";
import { SectionHeader } from "@/components/whitelabel/SectionHeader";
import { EmptyState } from "@/components/whitelabel/EmptyState";
import { SFSymbol } from "@/components/icons/SFSymbol";
import { buildFeed, type FeedScenarioKey } from "@/lib/fixtures/example";

export function Feed() {
  const scenario = (useScenario() ?? "populated") as FeedScenarioKey;
  const compact = useTweakBool("compact");
  const state = buildFeed(scenario);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function openDetail(itemId: string) {
    const next = new URLSearchParams(params.toString());
    next.set("selected", "feed-detail");
    next.set("feed-detail:itemId", itemId);
    router.replace(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="flex flex-col gap-s bg-background pb-xl">
      <header className="flex items-center justify-between px-m pt-l">
        <h1 className="font-display text-h1 text-foreground">Feed</h1>
        <GlassButton variant="glass" className="!p-xs" aria-label="Filter">
          <SFSymbol name="line.3.horizontal.decrease" size="s" />
        </GlassButton>
      </header>

      <SectionHeader title="Latest" />

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
            title="Empty feed"
            description="New posts will land here."
          />
        </Card>
      ) : (
        <ul className="flex flex-col gap-s px-m">
          {state.items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => openDetail(item.id)}
                className="w-full text-left"
              >
                <Card
                  variant="glass"
                  className="glass-pressable flex items-start gap-s"
                >
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
                    {!compact && (
                      <p className="text-body-regular text-muted-foreground">
                        {item.body}
                      </p>
                    )}
                  </div>
                  <SFSymbol
                    name="chevron.right"
                    size="xs"
                    className="mt-xxs text-muted-foreground"
                  />
                </Card>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
