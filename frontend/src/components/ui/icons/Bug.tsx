"use client";

import { motion, useAnimation, type Variants } from "motion/react";
import type React from "react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

export interface BugIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface BugIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

// One full leg-pair cycle. Tripod A swings in the first half, B in the second.
const CYCLE = 0.9;

// ─── Body ──────────────────────────────────────────────────────────────
// Gentle bob — body dips slightly each time a tripod is at peak lift
// (half the legs in the air = body settles a touch).
const bodyVariants: Variants = {
  normal: {
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  animate: {
    y: [0, 0.3, 0, 0.3, 0],
    transition: { duration: CYCLE, repeat: Infinity, ease: "easeInOut" },
  },
};

// ─── Legs (tripod gait) ────────────────────────────────────────────────
// A = {top-left, middle-right, bottom-left}: lifts in 1st quarter, plants in 2nd.
// B = {middle-left, top-right, bottom-right}: lifts in 3rd quarter, plants in 4th.
//
// A left-side leg rotates positive (CW around its body attachment) to lift its tip.
// A right-side leg rotates negative (CCW around its body attachment) to lift its tip.
// Same gait, opposite signs.
const tripodA_Left: Variants = {
  normal: { rotate: 0, transition: { duration: 0.25, ease: "easeOut" } },
  animate: {
    rotate: [0, 16, 0, 0, 0],
    transition: { duration: CYCLE, repeat: Infinity, ease: "easeInOut" },
  },
};
const tripodA_Right: Variants = {
  normal: { rotate: 0, transition: { duration: 0.25, ease: "easeOut" } },
  animate: {
    rotate: [0, -16, 0, 0, 0],
    transition: { duration: CYCLE, repeat: Infinity, ease: "easeInOut" },
  },
};
const tripodB_Left: Variants = {
  normal: { rotate: 0, transition: { duration: 0.25, ease: "easeOut" } },
  animate: {
    rotate: [0, 0, 0, 16, 0],
    transition: { duration: CYCLE, repeat: Infinity, ease: "easeInOut" },
  },
};
const tripodB_Right: Variants = {
  normal: { rotate: 0, transition: { duration: 0.25, ease: "easeOut" } },
  animate: {
    rotate: [0, 0, 0, -16, 0],
    transition: { duration: CYCLE, repeat: Infinity, ease: "easeInOut" },
  },
};

// ─── Antennae ──────────────────────────────────────────────────────────
// Continuous gentle twitch, pivoting where they actually meet the head.
const leftAntenna: Variants = {
  normal: { rotate: 0, transition: { duration: 0.25, ease: "easeOut" } },
  animate: {
    rotate: [0, -18, 6, -12, 0],
    transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
  },
};
const rightAntenna: Variants = {
  normal: { rotate: 0, transition: { duration: 0.25, ease: "easeOut" } },
  animate: {
    rotate: [0, 18, -6, 12, 0],
    transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
  },
};

const BugIcon = forwardRef<BugIconHandle, BugIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    // Only flips to true when a parent attaches a ref — React skips the
    // useImperativeHandle factory entirely when ref is null/undefined.
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;
      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) onMouseEnter?.(e);
        else controls.start("animate");
      },
      [controls, onMouseEnter],
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) onMouseLeave?.(e);
        else controls.start("normal");
      },
      [controls, onMouseLeave],
    );

    return (
      <div
        className={cn(className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <motion.svg
          animate={controls}
          fill="none"
          height={size}
          initial="normal"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.g variants={bodyVariants}>
            {/* antennae — pivot at the base where they meet the head */}
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

            {/* head */}
            <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
            {/* body */}
            <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
            <path d="M12 20v-9" />

            {/* Left legs — each rotates around its own body attachment */}
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

            {/* Right legs */}
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
      </div>
    );
  },
);

BugIcon.displayName = "BugIcon";

export { BugIcon };
