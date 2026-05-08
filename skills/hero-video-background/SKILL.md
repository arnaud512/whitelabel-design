---
name: hero-video-background
description: Build a cinematic landing-page hero around a user-supplied video — set up the `<video>` element with the right attributes (muted, loop, playsinline, autoplay, poster, preload), layer accessible overlay copy and a CTA on top, generate or use a poster image so first paint isn't a black box, design the rest of the page in a register that matches the video's mood, and keep mobile bandwidth reasonable. Use this skill whenever the user provides a video file or URL and asks for it in the hero, says "video background", "cinematic hero", "video-led landing page", "make the hero feel immersive with this clip", or drops a video into the project. Also trigger when the user asks for a hero that "feels like a movie / Apple-style / cinematic" even if they haven't supplied a video yet — in that case, ask for the video before building. This skill is the workflow that makes one-shot "use this video as the hero, build the rest" prompts actually work.
---

# Hero Video Background

Build a landing page where a video carries the hero — mood, motion, message — and the rest of the page is designed *around* the video's tone, not slapped on top of it.

The point: a video hero done badly is a black rectangle for 4 seconds, then a janky autoplay with sound that the user mutes, scrolls past, and forgets. Done well, it's the strongest first impression a marketing page can deliver. The difference is mostly in the boring details below.

## When to trigger

Trigger when:
- The user provides a video file or URL and mentions "hero" or "landing page"
- The user says "video background", "video hero", "cinematic", "video-led", "Apple-style hero", "use this clip in the hero"
- The user drops a video file into the project directory and asks "build a landing page around this"

Skip when:
- The user wants a video *embedded as content* (player with controls, in a section) — that's a normal `<video controls>`, not this skill
- The hero is supposed to be a Lottie / animated SVG / CSS animation — wrong tool
- The user explicitly said "no video" or wants a static hero
- The video is longer than ~30s and is meant to be watched — make it a click-to-play feature, not a background

## Preconditions

Before building, confirm:

1. **The video exists.** Either a file in the project, an absolute path the user gave, or a URL. If the user said "I'll add it later," ask for it now — placeholder videos waste a build cycle.
2. **You know what's in the video.** Watch it (or have the user describe it in one sentence) before designing around it. A video of a product UI calls for one register; abstract waves call for another. *Don't guess.*
3. **You have or can generate a poster image.** Browsers show a black rectangle for the first frame otherwise. Either the user provides one, or you extract a frame with `ffmpeg` (see below).
4. **Format and size are reasonable.** > 10 MB is too big for a hero — flag it. Codec should be H.264 / MP4 (universal) with WebM as a progressive enhancement. If the source is a 4K ProRes file, ask the user where the encoded web version is.

## Workflow

### Step 1 — Inspect the video

Find out duration, dimensions, file size, codec. This drives every decision downstream.

```bash
ffprobe -v error -show_entries stream=width,height,codec_name,duration -show_entries format=size,bit_rate -of default=noprint_wrappers=1 "$VIDEO"
```

Flag any of:
- Duration > 30s → suggest trimming or making it click-to-play
- File size > 10 MB → suggest re-encoding (or generate a smaller version, see Step 2)
- Aspect ratio significantly off 16:9 → confirm with the user before letterboxing
- Has audio track → it'll be muted in the hero anyway; mention this

Then **describe what's in the video back to the user in one sentence** to confirm you understood it before designing the page register around it. The video transcript example: the agent had to be corrected once on what the video depicted before the rest of the design clicked. Don't skip this confirmation.

### Step 2 — Generate a poster and a mobile-friendly version (if missing)

A poster image is what the user sees during the first ~200ms before the video plays. Without one, you get a black rectangle. Pull frame ~1s in (avoids any fade-in) and save next to the video:

```bash
ffmpeg -y -ss 00:00:01 -i "$VIDEO" -vframes 1 -q:v 2 "${VIDEO%.*}-poster.jpg"
```

If the source is heavy, generate a mobile version too (≤ 720p, lower bitrate):

```bash
ffmpeg -y -i "$VIDEO" -vf "scale='min(1280,iw)':-2" -c:v libx264 -crf 28 -preset slow -an -movflags +faststart "${VIDEO%.*}-mobile.mp4"
```

Two notes that matter:
- `-movflags +faststart` puts the moov atom at the start so the video can stream before fully downloaded. Without it, autoplay waits for the full file.
- `-an` strips audio (the hero will be muted anyway — saves bytes).

Tell the user what you generated and where it lives. Don't silently mutate their assets.

### Step 3 — Build the hero markup

The five `<video>` attributes that all matter — miss one and autoplay breaks on iOS or accessibility tools complain:

```html
<section class="relative h-screen w-full overflow-hidden">
  <video
    class="absolute inset-0 h-full w-full object-cover"
    src="/hero.mp4"
    poster="/hero-poster.jpg"
    autoplay
    muted
    loop
    playsinline
    preload="metadata"
    aria-hidden="true"
  ></video>

  <!-- Readability overlay — gradient is usually better than a flat scrim -->
  <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>

  <!-- Hero content -->
  <div class="relative z-10 flex h-full flex-col items-start justify-center px-6 md:px-16 max-w-5xl">
    <h1 class="text-5xl md:text-7xl font-semibold text-white leading-[1.05]">
      {{HEADLINE}}
    </h1>
    <p class="mt-4 text-lg md:text-xl text-white/80 max-w-xl">
      {{SUBHEAD}}
    </p>
    <a href="{{CTA_HREF}}" class="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-black font-medium hover:bg-white/90 transition">
      {{CTA_TEXT}}
    </a>
  </div>
</section>
```

The non-obvious decisions in there:

| Attribute | Why it's there |
|---|---|
| `muted` | Required for autoplay on every modern browser. Non-negotiable. |
| `playsinline` | Required for inline autoplay on iOS Safari. Without it, video opens fullscreen on tap. |
| `loop` | Hero video should restart seamlessly. Cut the source so the loop point isn't jarring. |
| `poster` | First-paint image. Without it, ~200ms of black rectangle. |
| `preload="metadata"` | Loads enough to start playing without front-loading the whole file. `auto` is wasteful for a hero. |
| `aria-hidden="true"` | The video is decorative. Screen readers should skip it and read the hero copy directly. If the video conveys meaning, drop this and add a transcript. |
| `object-cover` | Crops to fill — won't letterbox on narrow viewports. |
| Gradient overlay | A flat black-40 scrim looks like a mistake. A gradient (darker top + bottom, lighter middle) hides the seams between video and overlay copy. |

### Step 4 — Mobile bandwidth + autoplay

Mobile users on cellular are the most common visitor and the most expensive to serve a 10 MB video to. Two mitigations:

**(a) Don't autoplay on metered/slow connections.** Use the Network Information API where available; fall back to autoplay otherwise:

```ts
const video = document.querySelector<HTMLVideoElement>("[data-hero-video]");
if (!video) return;

const conn = (navigator as any).connection;
const isSlow = conn?.saveData || /(2g|slow-2g)/.test(conn?.effectiveType || "");

if (!isSlow) {
  video.play().catch(() => {
    // Autoplay was rejected (rare with muted+playsinline). Show poster + play button.
  });
}
```

**(b) Serve the mobile version on small viewports.** Use `<source media="...">`:

```html
<video ...>
  <source src="/hero-mobile.mp4" media="(max-width: 768px)" type="video/mp4" />
  <source src="/hero.mp4" type="video/mp4" />
</video>
```

`<source media>` is honored only at element parse time, so it works for picking the right initial file. If the viewport changes after load, the browser doesn't re-pick — that's fine for a hero.

### Step 5 — Match the rest of the page to the video's register

The hero sets the tone. The page below has to match or it reads as two different sites stitched together. Use this checklist after the hero is done:

- **Palette.** Pull 2–3 dominant colors from the video (poster frame helps). Use one as a body accent, one as a contrast accent.
- **Type.** Cinematic videos pair best with restrained, large display type. Don't mix in a playful display font below the hero.
- **Motion.** If the video is calm, the page should be calm — no scroll-pinned reveals. If the video is energetic, scroll motion is fair game (consult `scrollytelling`).
- **Density.** A video hero burns vertical space — sections below should breathe similarly. Don't immediately drop into a dense feature grid.
- **Imagery.** Stock-photo cards under a moody video hero look broken. Use abstract gradients, screenshots, or commissioned imagery instead.

### Step 6 — Hand off to verify-build

Tell `verify-build` specifically what to check:

> Verify the hero video loads, autoplays muted, loops without a visible seam, and the poster shows during initial load. Check at desktop / tablet / mobile viewports. Watch the network tab for the video file size. Confirm `prefers-reduced-motion` pauses or hides the video.

The two failure modes verify-build will most likely catch:
- Video downloads but never plays (missing `muted` or `playsinline`)
- Mobile viewport ships the desktop file (4K video on a phone — flag the size)

### Step 7 — Reduced motion

Users with `prefers-reduced-motion: reduce` should not get an autoplaying video. Two acceptable behaviors:

```css
@media (prefers-reduced-motion: reduce) {
  video[data-hero-video] {
    display: none;          /* Or: opacity: 0; */
  }
}
/* Show the poster instead — it's already on the <video> tag, but we need a fallback img: */
@media (prefers-reduced-motion: reduce) {
  .hero-poster-fallback { display: block; }
}
.hero-poster-fallback { display: none; }
```

Or, in JS, don't call `video.play()` if `matchMedia('(prefers-reduced-motion: reduce)').matches` is true.

Either is fine; pick one and stick to it. This is the most-skipped step in video-hero work and the easiest one to get right.

## Anti-patterns

- **No `muted` + no `playsinline`.** Autoplay will silently fail. Easiest hero bug to ship.
- **Black rectangle for 4 seconds.** That's a missing poster image. Always ship one.
- **Sound on by default.** Even if `muted` is dropped, browsers won't autoplay with audio. Don't try to fight this — keep it muted, full stop.
- **Shipping the 80 MB master to mobile.** Always re-encode and serve a smaller variant on mobile.
- **No `object-cover`.** The video will letterbox on aspect-ratio mismatches and look broken.
- **White text on a busy video without an overlay.** Pick any frame at random and check legibility — if you can't read it, neither can users.
- **Hero copy reading something the video already shows.** "Watch it move" under a video of motion is filler. Hero copy should add information the video doesn't.
- **Designing the rest of the page first, then dropping a video in.** Then nothing matches. Build hero → set the register → design the rest.
- **Using a YouTube embed.** YouTube serves controls, branding, and tracking. For a hero you want a self-hosted file (or CDN-hosted). Embeds are for content videos, not hero backgrounds.
- **Forgetting reduced motion.** Vestibular accessibility issue, not optional.
