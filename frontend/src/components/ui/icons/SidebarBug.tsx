"use client";

import { motion, type Variants } from "motion/react";
import type { CSSProperties, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

type Behavior = "idle" | "crawl" | "nibble" | "fly";

export interface SidebarBugProps {
  /** Element whose bounds the bug roams within. Defaults to the parent element. */
  containerRef?: RefObject<HTMLElement | null>;
  /** Bug size in CSS px. Default 20. */
  size?: number;
  /** Optional className for the outer wrapper. */
  className?: string;
}

// ─── Variants (one per behavior, per moving part) ───────────────────────

const bodyVariants: Variants = {
  idle: {
    x: 0,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  crawl: {
    y: [0, 0.3, 0, 0.3, 0],
    transition: { duration: 0.9, repeat: Infinity, ease: "easeInOut" },
  },
  nibble: {
    // Head lurches forward — bug is biting in the direction it's facing
    y: [0, -0.35, 0, -0.35, 0],
    transition: { duration: 0.35, repeat: Infinity, ease: "easeInOut" },
  },
  fly: {
    // Rapid sub-pixel buzz — wing-flap rate, independent of flight duration
    x: [0, 0.2, -0.2, 0.2, 0],
    y: [0, -0.2, 0.2, -0.2, 0],
    transition: { duration: 0.18, repeat: Infinity, ease: "linear" },
  },
};

const legIdle = {
  rotate: 0,
  transition: { duration: 0.3, ease: "easeOut" as const },
};
const legNibble = legIdle;

const tripodA_Left: Variants = {
  idle: legIdle,
  crawl: {
    rotate: [0, 16, 0, 0, 0],
    transition: { duration: 0.9, repeat: Infinity, ease: "easeInOut" },
  },
  nibble: legNibble,
  fly: {
    rotate: [0, -10, 6, -10, 0],
    transition: { duration: 0.2, repeat: Infinity, ease: "easeInOut" },
  },
};

const tripodA_Right: Variants = {
  idle: legIdle,
  crawl: {
    rotate: [0, -16, 0, 0, 0],
    transition: { duration: 0.9, repeat: Infinity, ease: "easeInOut" },
  },
  nibble: legNibble,
  fly: {
    rotate: [0, 10, -6, 10, 0],
    transition: { duration: 0.2, repeat: Infinity, ease: "easeInOut" },
  },
};

const tripodB_Left: Variants = {
  idle: legIdle,
  crawl: {
    rotate: [0, 0, 0, 16, 0],
    transition: { duration: 0.9, repeat: Infinity, ease: "easeInOut" },
  },
  nibble: legNibble,
  fly: {
    rotate: [0, 6, -10, 6, 0],
    transition: { duration: 0.2, repeat: Infinity, ease: "easeInOut" },
  },
};

const tripodB_Right: Variants = {
  idle: legIdle,
  crawl: {
    rotate: [0, 0, 0, -16, 0],
    transition: { duration: 0.9, repeat: Infinity, ease: "easeInOut" },
  },
  nibble: legNibble,
  fly: {
    rotate: [0, -6, 10, -6, 0],
    transition: { duration: 0.2, repeat: Infinity, ease: "easeInOut" },
  },
};

const leftAntenna: Variants = {
  idle: {
    rotate: [0, -8, 4, -6, 0],
    transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
  },
  crawl: {
    rotate: [0, -18, 6, -12, 0],
    transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
  },
  nibble: {
    rotate: [0, -24, 6, -24, 6, 0],
    transition: { duration: 0.45, repeat: Infinity, ease: "easeInOut" },
  },
  fly: {
    rotate: [-22, -30, -22, -30, -22],
    transition: { duration: 0.3, repeat: Infinity, ease: "easeInOut" },
  },
};

const rightAntenna: Variants = {
  idle: {
    rotate: [0, 8, -4, 6, 0],
    transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
  },
  crawl: {
    rotate: [0, 18, -6, 12, 0],
    transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
  },
  nibble: {
    rotate: [0, 24, -6, 24, -6, 0],
    transition: { duration: 0.45, repeat: Infinity, ease: "easeInOut" },
  },
  fly: {
    rotate: [22, 30, 22, 30, 22],
    transition: { duration: 0.3, repeat: Infinity, ease: "easeInOut" },
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────

// In screen coords (y-axis points down), angle 0 = north (up). The lucide
// bug's default orientation has its antennae pointing up, so this maps
// directly.
const headingFromVector = (dx: number, dy: number) =>
  (Math.atan2(dy, dx) * 180) / Math.PI + 90;

// Always rotate the short way around. Keeping rotation cumulative means
// motion never spins 350° when 10° will do.
const shortestRotation = (current: number, target: number): number => {
  const delta = ((((target - current) % 360) + 540) % 360) - 180;
  return current + delta;
};

// Randomized movement durations — sometimes fast, sometimes slow.
// Crawl's minimum (3.0s) is always slower than fly's maximum (2.6s),
// so a crawl segment is never quicker than any flight.
const randomFlyDuration = () => 1.6 + Math.random() * 1.0;
const randomCrawlDuration = () => 3.0 + Math.random() * 1.0;

const pickNextBehavior = (current: Behavior): Behavior => {
  const r = Math.random();
  switch (current) {
    case "fly":
      return "idle"; // always rest after landing
    case "idle":
      if (r < 0.5) return "crawl";
      if (r < 0.72) return "nibble";
      if (r < 0.84) return "fly";
      return "idle";
    case "crawl":
      if (r < 0.32) return "idle";
      if (r < 0.62) return "nibble";
      if (r < 0.85) return "crawl";
      return "fly";
    case "nibble":
      if (r < 0.5) return "idle";
      if (r < 0.86) return "crawl";
      return "fly";
  }
};

// ─── Component ──────────────────────────────────────────────────────────

export function SidebarBug({
  containerRef,
  size = 20,
  className,
}: SidebarBugProps) {
  const selfRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 28, y: 56, rotation: 0 });
  const [behavior, setBehavior] = useState<Behavior>("idle");
  const [bounds, setBounds] = useState({ width: 240, height: 600 });
  // The current movement's duration in seconds. Randomized each time the
  // bug starts a new fly or crawl, so individual journeys vary in pace.
  const [moveDuration, setMoveDuration] = useState(3.0);

  // Measure the roaming-bounds element (the container or parent).
  useEffect(() => {
    const el = containerRef?.current ?? selfRef.current?.parentElement ?? null;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setBounds({ width: r.width, height: r.height });
    };
    update();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [containerRef]);

  const pickTarget = useCallback(() => {
    const margin = size + 6;
    return {
      x: margin + Math.random() * Math.max(10, bounds.width - 2 * margin),
      y: margin + Math.random() * Math.max(10, bounds.height - 2 * margin),
    };
  }, [bounds, size]);

  // Start a move toward `target` with a specific duration (passed in by
  // the caller, e.g. randomFlyDuration() or randomCrawlDuration()).
  const moveTo = useCallback(
    (target: { x: number; y: number }, duration: number) => {
      setPos((prev) => {
        const dx = target.x - prev.x;
        const dy = target.y - prev.y;
        const dist = Math.hypot(dx, dy);
        const rotation =
          dist > 2
            ? shortestRotation(prev.rotation, headingFromVector(dx, dy))
            : prev.rotation;
        return { x: target.x, y: target.y, rotation };
      });
      setMoveDuration(duration);
    },
    [],
  );

  // Cycle through behaviors with weighted random transitions. Dwell time
  // is tied to the current move duration for fly and crawl, so the bug
  // always finishes moving before the next behavior fires.
  useEffect(() => {
    const dwell =
      behavior === "fly"
        ? (moveDuration + 0.15) * 1000
        : behavior === "crawl"
          ? (moveDuration + 0.3 + Math.random() * 1.2) * 1000
          : behavior === "nibble"
            ? 1300 + Math.random() * 1400
            : 900 + Math.random() * 1800;

    const t = window.setTimeout(() => {
      const next = pickNextBehavior(behavior);
      setBehavior(next);
      if (next === "crawl") moveTo(pickTarget(), randomCrawlDuration());
      else if (next === "fly") moveTo(pickTarget(), randomFlyDuration());
    }, dwell);
    return () => window.clearTimeout(t);
  }, [behavior, moveDuration, moveTo, pickTarget]);

  const startle = useCallback(() => {
    moveTo(pickTarget(), randomFlyDuration());
    setBehavior("fly");
  }, [moveTo, pickTarget]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    startle();
  };

  // Per-property transitions: rotation finishes fast so the bug faces the
  // target almost immediately, then position takes its (randomized) time.
  const transition =
    behavior === "fly"
      ? {
          x: {
            duration: moveDuration,
            ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number],
          },
          y: {
            duration: moveDuration,
            ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number],
          },
          rotate: { duration: 0.25, ease: "easeOut" as const },
        }
      : behavior === "crawl"
        ? {
            x: {
              duration: moveDuration,
              ease: [0.5, 0.05, 0.5, 0.95] as [number, number, number, number],
            },
            y: {
              duration: moveDuration,
              ease: [0.5, 0.05, 0.5, 0.95] as [number, number, number, number],
            },
            rotate: { duration: 0.3, ease: "easeOut" as const },
          }
        : { duration: 0.3, ease: "easeOut" as const };

  // Wrapper handles positioning only — it's transparent to pointer events so
  // menu items beneath the bug stay clickable. The inner <button> below is
  // the actual interactive target.
  const wrapperStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: size,
    height: size,
    marginLeft: -size / 2,
    marginTop: -size / 2,
    zIndex: 30,
    pointerEvents: "none",
  };

  const buttonStyle: CSSProperties = {
    pointerEvents: "auto",
    background: "transparent",
    border: 0,
    padding: 0,
    margin: 0,
    cursor: "pointer",
    display: "block",
    lineHeight: 0,
    color: "inherit",
    touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent",
  };

  return (
    <motion.div
      ref={selfRef}
      className={className}
      style={wrapperStyle}
      animate={{ x: pos.x, y: pos.y, rotate: pos.rotation }}
      transition={transition}
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label="Bug. Tap to startle it."
        style={buttonStyle}
      >
        <motion.svg
          animate={behavior}
          initial="idle"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          style={{ display: "block" }}
        >
          <motion.g variants={bodyVariants}>
            <motion.path
              d="m8 2 1.88 1.88"
              variants={leftAntenna}
              style={{ transformOrigin: "9.88px 3.88px" }}
            />
            <motion.path
              d="M14.12 3.88 16 2"
              variants={rightAntenna}
              style={{ transformOrigin: "14.12px 3.88px" }}
            />
            <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
            <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
            <path d="M12 20v-9" />
            <motion.path
              d="M6.53 9C4.6 8.8 3 7.1 3 5"
              variants={tripodA_Left}
              style={{ transformOrigin: "6.53px 9px" }}
            />
            <motion.path
              d="M6 13H2"
              variants={tripodB_Left}
              style={{ transformOrigin: "6px 13px" }}
            />
            <motion.path
              d="M3 21c0-2.1 1.7-3.9 3.8-4"
              variants={tripodA_Left}
              style={{ transformOrigin: "6.8px 17px" }}
            />
            <motion.path
              d="M20.97 5c0 2.1-1.6 3.8-3.5 4"
              variants={tripodB_Right}
              style={{ transformOrigin: "17.47px 9px" }}
            />
            <motion.path
              d="M22 13h-4"
              variants={tripodA_Right}
              style={{ transformOrigin: "18px 13px" }}
            />
            <motion.path
              d="M17.2 17c2.1.1 3.8 1.9 3.8 4"
              variants={tripodB_Right}
              style={{ transformOrigin: "17.2px 17px" }}
            />
          </motion.g>
        </motion.svg>
      </button>
    </motion.div>
  );
}

SidebarBug.displayName = "SidebarBug";
