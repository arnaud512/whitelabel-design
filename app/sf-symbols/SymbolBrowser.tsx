"use client";

import { useMemo, useState } from "react";
import { SFSymbol } from "@/components/icons/SFSymbol";

const PAGE_SIZE = 240;

interface Props {
  symbols: string[];
}

export function SymbolBrowser({ symbols }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [copied, setCopied] = useState<string | null>(null);

  const categories = useMemo(() => buildCategories(symbols), [symbols]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return symbols.filter((s) => {
      if (q && !s.toLowerCase().includes(q)) return false;
      if (category && !s.startsWith(category + ".") && s !== category) return false;
      return true;
    });
  }, [symbols, query, category]);

  function copyName(name: string) {
    navigator.clipboard.writeText(name).then(() => {
      setCopied(name);
      window.setTimeout(() => setCopied((c) => (c === name ? null : c)), 1200);
    });
  }

  const slice = filtered.slice(0, visible);
  const hasMore = filtered.length > visible;

  return (
    <div>
      {/* Search + category dropdown */}
      <div className="sticky top-0 z-10 -mx-s flex flex-col gap-s rounded-lg bg-muted/80 px-s py-s backdrop-blur sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(PAGE_SIZE);
          }}
          placeholder="Search symbols (e.g. house, drop.fill, chevron)…"
          className="flex-1 rounded-m border border-border bg-card px-m py-s text-body-regular text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <select
          value={category ?? ""}
          onChange={(e) => {
            setCategory(e.target.value || null);
            setVisible(PAGE_SIZE);
          }}
          className="min-w-[180px] rounded-m border border-border bg-card px-m py-s text-body-regular text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All categories · {symbols.length.toLocaleString()}</option>
          {categories.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name} · {c.count}
            </option>
          ))}
        </select>

        {category && (
          <button
            onClick={() => setCategory(null)}
            className="rounded-m border border-border bg-card px-m py-s text-body-label text-muted-foreground hover:bg-muted"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results */}
      <div className="mt-m text-body-label uppercase tracking-wide text-muted-foreground">
        Showing {slice.length.toLocaleString()} of {filtered.length.toLocaleString()}
      </div>

      <ul className="mt-s grid grid-cols-2 gap-xs sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {slice.map((name) => (
          <li key={name}>
            <button
              onClick={() => copyName(name)}
              title={`Copy "${name}"`}
              className="group flex w-full flex-col items-center gap-xs rounded-m border border-border bg-card px-xs py-m text-foreground transition hover:border-primary hover:shadow-sm"
            >
              <SFSymbol name={name} size={32} />
              <span className="line-clamp-2 break-all px-xxs text-center text-body-label text-muted-foreground group-hover:text-foreground">
                {name}
              </span>
              {copied === name && (
                <span className="text-body-label-caps uppercase tracking-wide text-brand-mediumBlue">
                  Copied
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className="mt-l flex justify-center">
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="rounded-m border border-border bg-card px-l py-s text-body-regular text-foreground hover:bg-muted"
          >
            Show {Math.min(PAGE_SIZE, filtered.length - visible).toLocaleString()} more
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="mt-xl text-center text-body-regular text-muted-foreground">
          No symbols match{query ? ` "${query}"` : ""}
          {category ? ` in ${category}` : ""}.
        </div>
      )}
    </div>
  );
}

interface Category {
  name: string;
  count: number;
}

/**
 * Group symbols by their first dot-separated segment, but only keep groups
 * with at least 6 members so the chip list stays useful. Smaller groups roll
 * into "All" and remain searchable.
 */
function buildCategories(symbols: string[]): Category[] {
  const counts = new Map<string, number>();
  for (const s of symbols) {
    const seg = s.split(".")[0];
    counts.set(seg, (counts.get(seg) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .filter(([, c]) => c >= 6)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}
