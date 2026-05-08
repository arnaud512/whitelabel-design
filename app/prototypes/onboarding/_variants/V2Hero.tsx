"use client";

import { GlassButton } from "@/components/whitelabel/GlassButton";
import { SFSymbol } from "@/components/icons/SFSymbol";
import { onboardingStep as s } from "./shared";

export function V2Hero() {
  return (
    <div className="flex h-full flex-col bg-background">
      <header className="flex items-center justify-between px-m pt-l">
        <div className="flex h-1 flex-1 max-w-[60%] gap-xxs">
          {Array.from({ length: s.total }).map((_, i) => (
            <span
              key={i}
              className={`h-full flex-1 rounded-full ${
                i < s.step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <button className="text-body-label text-muted-foreground">Skip</button>
      </header>

      <div className="px-m pt-xl">
        <div className="glass-tinted flex h-40 items-center justify-center rounded-lg">
          <SFSymbol
            name="person.crop.circle.badge.questionmark"
            size="l"
            className="text-foreground"
          />
        </div>
      </div>

      <div className="flex flex-col gap-s px-m pt-l">
        <h1 className="font-display text-h1 text-foreground">{s.title}</h1>
        <p className="text-body-regular text-muted-foreground">{s.subtitle}</p>
        <input
          type="text"
          placeholder={s.placeholder}
          className="mt-s rounded-lg border border-border bg-card px-m py-s text-body-large text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-auto px-m pb-xl">
        <GlassButton variant="prominent" className="w-full !py-s">
          Continue
        </GlassButton>
      </div>
    </div>
  );
}
