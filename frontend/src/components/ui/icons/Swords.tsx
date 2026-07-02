"use client";

import { motion, useAnimation, type Variants } from "motion/react";
import type React from "react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

export interface SwordsIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface SwordsIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

// Sword 1: blade points up-left, hilt sits at the bottom-right.
// Pivot is on the pommel so the blade swings naturally from the hand.
const sword1Variants: Variants = {
  normal: {
    rotate: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  animate: {
    rotate: [0, -8, 0, -4, 0],
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

// Sword 2: mirror of sword 1. Slight delay so the two strikes layer.
const sword2Variants: Variants = {
  normal: {
    rotate: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  animate: {
    rotate: [0, 8, 0, 4, 0],
    transition: { duration: 0.7, ease: "easeOut", delay: 0.05 },
  },
};

const SwordsIcon = forwardRef<SwordsIconHandle, SwordsIconProps>(
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
          <motion.g
            style={{ transformOrigin: "20px 20px" }}
            variants={sword1Variants}
          >
            <polyline points="14.5,17.5 3,6 3,3 6,3 17.5,14.5" />
            <line x1="13" y1="19" x2="19" y2="13" />
            <line x1="16" y1="16" x2="20" y2="20" />
            <line x1="19" y1="21" x2="21" y2="19" />
          </motion.g>
          <motion.g
            style={{ transformOrigin: "4px 20px" }}
            variants={sword2Variants}
          >
            <polyline points="14.5,6.5 18,3 21,3 21,6 17.5,9.5" />
            <line x1="5" y1="14" x2="9" y2="18" />
            <line x1="7" y1="17" x2="4" y2="20" />
            <line x1="3" y1="19" x2="5" y2="21" />
          </motion.g>
        </motion.svg>
      </div>
    );
  },
);

SwordsIcon.displayName = "SwordsIcon";

export { SwordsIcon };
