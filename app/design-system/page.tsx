"use client";

import { Card } from "@/components/whitelabel/Card";
import { GlassButton } from "@/components/whitelabel/GlassButton";
import { Pill } from "@/components/whitelabel/Pill";
import { SectionHeader } from "@/components/whitelabel/SectionHeader";
import { SFSymbol } from "@/components/icons/SFSymbol";
import Link from "next/link";

const spacingScale = [
  { token: "xxs", px: 4 },
  { token: "xs", px: 8 },
  { token: "s", px: 12 },
  { token: "m", px: 16 },
  { token: "l", px: 24 },
  { token: "xl", px: 32 },
  { token: "xxl", px: 48 },
];

const radiusScale = [
  { token: "xxs", px: 2 },
  { token: "xs", px: 4 },
  { token: "sm", px: 8 },
  { token: "m", px: 12 },
  { token: "lg", px: 16 },
  { token: "xl", px: 24 },
];

const iconSizes = [
  { token: "icon-xs", px: 16 },
  { token: "icon-s", px: 24 },
  { token: "icon-m", px: 32 },
  { token: "icon-l", px: 40 },
];

const semanticPairs = [
  { bg: "bg-background", fg: "text-foreground", label: "background / foreground" },
  { bg: "bg-card", fg: "text-card-foreground", label: "card / card-foreground" },
  { bg: "bg-muted", fg: "text-muted-foreground", label: "muted / muted-foreground" },
  { bg: "bg-primary", fg: "text-primary-foreground", label: "primary / primary-foreground" },
  { bg: "bg-secondary", fg: "text-secondary-foreground", label: "secondary / secondary-foreground" },
  { bg: "bg-accent", fg: "text-accent-foreground", label: "accent / accent-foreground" },
  { bg: "bg-destructive", fg: "text-destructive-foreground", label: "destructive / destructive-foreground" },
];

const sampleSymbols = [
  "sparkles",
  "heart.fill",
  "star.fill",
  "bell",
  "magnifyingglass",
  "gear",
  "person.fill",
  "house.fill",
  "paperplane.fill",
  "chevron.right",
  "moon.fill",
  "sun.max.fill",
];

export default function DesignSystemPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-xl bg-background p-l">
      <header className="flex flex-col gap-xxs">
        <p className="text-body-label-caps uppercase text-muted-foreground">
          Foundations
        </p>
        <h1 className="font-display text-h1 text-foreground">Design system</h1>
        <p className="text-body-large text-muted-foreground">
          Tokens that survived the whitelabel strip — replace HSL values in
          globals.css to brand the system.
        </p>
      </header>

      <section className="flex flex-col gap-s">
        <SectionHeader title="Semantic colors" />
        <div className="grid grid-cols-1 gap-xs">
          {semanticPairs.map((p) => (
            <div
              key={p.label}
              className={`${p.bg} ${p.fg} flex items-center justify-between rounded-m px-m py-s`}
            >
              <span className="text-body-regular">{p.label}</span>
              <SFSymbol name="circle.fill" size="xs" />
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-s">
        <SectionHeader title="Spacing" />
        <div className="flex flex-col gap-xs px-m">
          {spacingScale.map((s) => (
            <div key={s.token} className="flex items-center gap-s">
              <span className="w-12 text-body-label text-muted-foreground">
                {s.token}
              </span>
              <span className="w-10 text-right text-body-label text-muted-foreground">
                {s.px}px
              </span>
              <span
                className="h-2 rounded-full bg-foreground"
                style={{ width: `${s.px * 4}px` }}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-s">
        <SectionHeader title="Radius" />
        <div className="grid grid-cols-3 gap-s px-m @md:grid-cols-6">
          {radiusScale.map((r) => (
            <div key={r.token} className="flex flex-col items-center gap-xxs">
              <div
                className="h-12 w-12 bg-muted"
                style={{ borderRadius: `${r.px}px` }}
              />
              <span className="text-body-label text-muted-foreground">
                {r.token}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-s">
        <SectionHeader title="Icon sizes" />
        <div className="flex items-end gap-l px-m">
          {iconSizes.map((s) => (
            <div key={s.token} className="flex flex-col items-center gap-xxs">
              <SFSymbol
                name="sparkles"
                size={s.token.replace("icon-", "") as "xs" | "s" | "m" | "l"}
                className="text-foreground"
              />
              <span className="text-body-label text-muted-foreground">
                {s.token}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-s">
        <SectionHeader title="Typography" />
        <div className="flex flex-col gap-s px-m">
          <p className="font-display text-h1 text-foreground">Heading 1 · 32px</p>
          <p className="font-display text-h2 text-foreground">Heading 2 · 24px</p>
          <p className="font-display text-h3 text-foreground">Heading 3 · 20px</p>
          <p className="text-body-large text-foreground">Body large · 17px</p>
          <p className="text-body-regular text-foreground">Body regular · 15px</p>
          <p className="text-body-label text-muted-foreground">Body label · 12px</p>
          <p className="text-body-label-caps uppercase text-muted-foreground">
            Body label caps · 12px
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-s">
        <SectionHeader title="Glass surfaces" />
        <div className="grid grid-cols-2 gap-s px-m">
          <div className="glass rounded-lg p-m">
            <p className="text-body-regular text-foreground">.glass</p>
          </div>
          <div className="glass-tinted rounded-lg p-m">
            <p className="text-body-regular text-foreground">.glass-tinted</p>
          </div>
          <div className="glass-prominent rounded-lg p-m">
            <p className="text-body-regular">.glass-prominent</p>
          </div>
          <button className="glass glass-pressable rounded-lg p-m text-left">
            <p className="text-body-regular text-foreground">.glass-pressable</p>
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-s">
        <SectionHeader
          title="SF Symbols"
          trailing={
            <Link
              href="/sf-symbols"
              className="text-body-label text-muted-foreground hover:text-foreground"
            >
              Browse all →
            </Link>
          }
        />
        <div className="grid grid-cols-6 gap-s px-m">
          {sampleSymbols.map((name) => (
            <div
              key={name}
              className="flex flex-col items-center gap-xxs rounded-sm border border-border p-s"
            >
              <SFSymbol name={name} size="s" className="text-foreground" />
              <span className="truncate text-[10px] text-muted-foreground">
                {name}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-s">
        <SectionHeader title="Primitives" />
        <div className="flex flex-col gap-s px-m">
          <Card variant="default">
            <p className="text-body-regular text-foreground">Card · default</p>
          </Card>
          <Card variant="glass">
            <p className="text-body-regular text-foreground">Card · glass</p>
          </Card>
          <div className="flex flex-wrap gap-xs">
            <GlassButton variant="glass">Glass</GlassButton>
            <GlassButton variant="tinted">Tinted</GlassButton>
            <GlassButton variant="prominent">Prominent</GlassButton>
          </div>
          <div className="flex flex-wrap gap-xs">
            <Pill text="Neutral" style="neutral" />
            <Pill text="Accent" style="accent" />
            <Pill text="Prominent" style="prominent" />
          </div>
        </div>
      </section>
    </main>
  );
}
