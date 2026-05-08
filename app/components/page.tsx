"use client";

import { Card } from "@/components/whitelabel/Card";
import { GlassButton } from "@/components/whitelabel/GlassButton";
import { Pill } from "@/components/whitelabel/Pill";
import { SectionHeader } from "@/components/whitelabel/SectionHeader";
import { EmptyState } from "@/components/whitelabel/EmptyState";
import { SFSymbol } from "@/components/icons/SFSymbol";

function Demo({
  title,
  source,
  children,
}: {
  title: string;
  source: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-s rounded-lg border border-border bg-card p-m">
      <header className="flex items-center justify-between">
        <h2 className="font-display text-h3 text-foreground">{title}</h2>
        <code className="text-body-label text-muted-foreground">{source}</code>
      </header>
      <div className="flex flex-col gap-s rounded-sm bg-background p-m">
        {children}
      </div>
    </section>
  );
}

export default function ComponentsPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-l p-l">
      <header className="flex flex-col gap-xxs">
        <p className="text-body-label-caps uppercase text-muted-foreground">
          Components
        </p>
        <h1 className="font-display text-h1 text-foreground">Primitives</h1>
        <p className="text-body-large text-muted-foreground">
          Each demo shows a primitive in a few states. Source under
          <code className="ml-xxs">components/whitelabel/</code>.
        </p>
      </header>

      <Demo title="Card" source="components/whitelabel/Card.tsx">
        <Card variant="default">
          <p className="text-body-regular">Default · bordered</p>
        </Card>
        <Card variant="glass">
          <p className="text-body-regular">Glass · liquid surface</p>
        </Card>
        <Card variant="tinted">
          <p className="text-body-regular">Tinted · accent wash</p>
        </Card>
        <Card variant="prominent">
          <p className="text-body-regular">Prominent · inverted</p>
        </Card>
      </Demo>

      <Demo title="GlassButton" source="components/whitelabel/GlassButton.tsx">
        <div className="flex flex-wrap gap-xs">
          <GlassButton variant="glass">
            <SFSymbol name="sparkles" size="xs" />
            Glass
          </GlassButton>
          <GlassButton variant="tinted">
            <SFSymbol name="heart.fill" size="xs" />
            Tinted
          </GlassButton>
          <GlassButton variant="prominent">
            Prominent
            <SFSymbol name="arrow.right" size="xs" />
          </GlassButton>
        </div>
      </Demo>

      <Demo title="Pill" source="components/whitelabel/Pill.tsx">
        <div className="flex flex-wrap gap-xs">
          <Pill text="Neutral" style="neutral" />
          <Pill text="Accent" style="accent" />
          <Pill text="Prominent" style="prominent" />
        </div>
      </Demo>

      <Demo title="SectionHeader" source="components/whitelabel/SectionHeader.tsx">
        <SectionHeader title="Section title" />
        <SectionHeader
          title="With trailing"
          trailing={
            <button className="text-body-label text-muted-foreground">
              Edit
            </button>
          }
        />
      </Demo>

      <Demo title="EmptyState" source="components/whitelabel/EmptyState.tsx">
        <EmptyState
          icon="tray"
          title="Nothing here"
          description="When this list has items they'll show up here."
          action={<GlassButton variant="prominent">Add the first one</GlassButton>}
        />
      </Demo>
    </main>
  );
}
