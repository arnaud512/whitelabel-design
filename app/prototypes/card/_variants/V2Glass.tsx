"use client";

import { GlassButton } from "@/components/whitelabel/GlassButton";
import { Pill } from "@/components/whitelabel/Pill";
import { SFSymbol } from "@/components/icons/SFSymbol";
import { sampleCard as data } from "./shared";

export function V2Glass() {
  return (
    <div className="flex flex-col gap-l bg-background pb-xl">
      <header className="px-m pt-l">
        <h1 className="font-display text-h1 text-foreground">Card · Glass</h1>
        <p className="text-body-regular text-muted-foreground">
          Liquid-glass surface with hairline border and soft shadow.
        </p>
      </header>

      <div className="px-m">
        <article className="glass flex flex-col gap-s rounded-lg p-m">
          <div className="flex items-center justify-between">
            <Pill text={data.eyebrow} style="accent" />
            <SFSymbol
              name={data.icon}
              size="s"
              className="text-muted-foreground"
            />
          </div>
          <h2 className="font-display text-h2 text-foreground">{data.title}</h2>
          <p className="text-body-regular text-muted-foreground">{data.body}</p>
          <div className="flex items-center justify-between pt-xs">
            <span className="text-body-label text-muted-foreground">
              {data.meta}
            </span>
            <GlassButton variant="prominent" className="!py-xxs">
              {data.cta}
            </GlassButton>
          </div>
        </article>
      </div>
    </div>
  );
}
