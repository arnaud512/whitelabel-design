"use client";

import { GlassButton } from "@/components/whitelabel/GlassButton";
import { SFSymbol } from "@/components/icons/SFSymbol";
import { onboardingStep as s } from "./shared";

export function V1Centered() {
  return (
    <div className="flex h-full flex-col bg-background">
      <header className="flex items-center justify-between px-m pt-l">
        <button aria-label="Back">
          <SFSymbol name="chevron.left" size="s" className="text-foreground" />
        </button>
        <p className="text-body-label text-muted-foreground">
          {s.step} of {s.total}
        </p>
        <button className="text-body-label text-muted-foreground">Skip</button>
      </header>

      <div className="flex flex-1 flex-col justify-center gap-l px-l">
        <div className="flex flex-col gap-s text-center">
          <h1 className="font-display text-h1 text-foreground">{s.title}</h1>
          <p className="text-body-large text-muted-foreground">{s.subtitle}</p>
        </div>
        <input
          type="text"
          placeholder={s.placeholder}
          className="rounded-lg border border-border bg-card px-m py-s text-body-large text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="px-m pb-xl">
        <GlassButton variant="prominent" className="w-full !py-s">
          Continue
          <SFSymbol name="arrow.right" size="xs" />
        </GlassButton>
      </div>
    </div>
  );
}
