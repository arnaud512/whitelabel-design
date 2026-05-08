"use client";

import { useTweakBool } from "@/components/frame/LiveTweaks";
import { useUrlAxis } from "@/components/frame/Switcher";
import { Card } from "@/components/whitelabel/Card";
import { GlassButton } from "@/components/whitelabel/GlassButton";
import { Pill } from "@/components/whitelabel/Pill";
import { SFSymbol } from "@/components/icons/SFSymbol";
import { feedItemById } from "@/lib/fixtures/example";

export function FeedDetail() {
  const itemId = useUrlAxis("itemId") ?? "1";
  const expanded = useTweakBool("expanded");
  const item = feedItemById(itemId);

  if (!item) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <p className="text-body-regular text-muted-foreground">
          Item not found
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-l bg-background pb-xl">
      <header className="flex items-center gap-s px-m pt-l">
        <GlassButton variant="glass" className="!p-xs" aria-label="Back">
          <SFSymbol name="chevron.left" size="s" />
        </GlassButton>
        <p className="text-body-label text-muted-foreground">Feed</p>
      </header>

      <div className="flex flex-col gap-s px-m">
        <div className="flex items-center gap-s">
          <SFSymbol name={item.icon} size="m" className="text-foreground" />
          {item.tag && <Pill text={item.tag} style="accent" />}
        </div>
        <h1 className="font-display text-h1 text-foreground">{item.title}</h1>
        <p className="text-body-large text-muted-foreground">{item.body}</p>
      </div>

      {expanded && (
        <div className="px-m">
          <Card variant="tinted">
            <p className="text-body-regular text-foreground">
              Expanded content. Toggle the &quot;expanded&quot; tweak to hide
              this section. Each screen owns its own tweaks — same tweak id
              (&quot;expanded&quot;) on a different screen would be a different
              namespace.
            </p>
          </Card>
        </div>
      )}

      <div className="flex flex-col gap-s px-m">
        <Card variant="glass" className="flex items-center gap-s">
          <SFSymbol name="info.circle" size="s" className="text-muted-foreground" />
          <span className="text-body-regular text-foreground">
            URL: <span className="text-muted-foreground">?selected=feed-detail&amp;feed-detail:itemId={item.id}</span>
          </span>
        </Card>
      </div>
    </div>
  );
}
