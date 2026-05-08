/**
 * Generic example fixtures for the whitelabel reference pages.
 *
 * Replace these with your own domain types and data when you fork this
 * workspace. The structure (named scenarios + helpers that build state
 * for each) is the pattern; the contents are placeholder.
 */

export interface FeedItem {
  id: string;
  title: string;
  body: string;
  /** SF Symbol name (see /sf-symbols). */
  icon: string;
  /** Soft category label rendered as a Pill. */
  tag?: string;
}

export interface FeedState {
  items: FeedItem[];
  loading: boolean;
}

const sampleItems: FeedItem[] = [
  {
    id: "1",
    title: "Welcome to your workspace",
    body: "Pan with two fingers, pinch to zoom. Click any phone to focus it.",
    icon: "sparkles",
    tag: "New",
  },
  {
    id: "2",
    title: "Scenarios swap whole worlds",
    body: "Pick a scenario in the inspector to load a different fixture.",
    icon: "square.stack.3d.up",
    tag: "Tip",
  },
  {
    id: "3",
    title: "Tweaks compose with scenarios",
    body: "Turn knobs to mutate part of the current state without leaving it.",
    icon: "slider.horizontal.3",
    tag: "Tip",
  },
  {
    id: "4",
    title: "URL state is shareable",
    body: "Every selection is in the URL — copy a link to share an exact view.",
    icon: "link",
  },
  {
    id: "5",
    title: "Two tracks, one workspace",
    body: "iOS phone canvas at /reference; web canvas at /web.",
    icon: "rectangle.split.2x1",
  },
  {
    id: "6",
    title: "Liquid-glass surfaces",
    body: "Use .glass, .glass-tinted, or .glass-prominent on rounded containers.",
    icon: "drop",
  },
];

export type FeedScenarioKey = "populated" | "empty" | "loading";

export function buildFeed(scenario: FeedScenarioKey | null, count = 6): FeedState {
  switch (scenario) {
    case "empty":
      return { items: [], loading: false };
    case "loading":
      return { items: [], loading: true };
    case "populated":
    default:
      return { items: sampleItems.slice(0, Math.max(0, Math.min(count, sampleItems.length))), loading: false };
  }
}

export function feedItemById(id: string): FeedItem | undefined {
  return sampleItems.find((item) => item.id === id);
}
