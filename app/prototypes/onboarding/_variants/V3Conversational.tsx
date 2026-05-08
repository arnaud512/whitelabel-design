"use client";

import { GlassButton } from "@/components/whitelabel/GlassButton";
import { SFSymbol } from "@/components/icons/SFSymbol";
import { onboardingStep as s } from "./shared";

export function V3Conversational() {
  return (
    <div className="flex h-full flex-col bg-background">
      <header className="flex items-center justify-between px-m pt-l">
        <button aria-label="Back">
          <SFSymbol name="chevron.left" size="s" className="text-foreground" />
        </button>
        <p className="text-body-label text-muted-foreground">
          Step {s.step}/{s.total}
        </p>
        <span className="w-icon-s" />
      </header>

      <div className="flex flex-col gap-l px-m pt-xl">
        <div className="flex items-start gap-s">
          <span className="flex h-icon-m w-icon-m items-center justify-center rounded-full bg-accent">
            <SFSymbol
              name="bubble.left.fill"
              size="xs"
              className="text-accent-foreground"
            />
          </span>
          <div className="glass-tinted flex flex-col gap-xxs rounded-lg rounded-tl-xs p-m">
            <p className="text-body-large text-foreground">{s.title}</p>
            <p className="text-body-regular text-muted-foreground">
              {s.subtitle}
            </p>
          </div>
        </div>

        <div className="ml-icon-l flex justify-end">
          <input
            type="text"
            placeholder={s.placeholder}
            className="w-full max-w-[80%] rounded-lg rounded-tr-xs border border-border bg-card px-m py-s text-body-large text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="mt-auto px-m pb-xl">
        <GlassButton variant="prominent" className="w-full !py-s">
          Send
          <SFSymbol name="arrow.up.circle.fill" size="s" />
        </GlassButton>
      </div>
    </div>
  );
}
