"use client";

import { motion, useAnimation, type Variants } from "motion/react";
import type React from "react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

export interface DashboardIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface DashboardIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

// Each card does the same subtle squish→pop. A staggered start makes
// the pulse travel clockwise around the dashboard, then everyone rests
// briefly before the wave restarts.
const PULSE = 0.6;
const STAGGER = 0.1;
const REST = 0.5;

const buildVariants = (delay: number): Variants => ({
  normal: {
    scale: 1,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  animate: {
    scale: [1, 0.92, 1.06, 1],
    transition: {
      duration: PULSE,
      delay,
      repeat: Infinity,
      repeatDelay: REST,
      ease: "easeInOut",
    },
  },
});

// Hoisted out of render — building these inside JSX would mint fresh
// objects every render and confuse motion's identity checks.
// Clockwise order: top-left → top-right → bottom-right → bottom-left.
const tlVariants = buildVariants(0);
const trVariants = buildVariants(STAGGER);
const brVariants = buildVariants(STAGGER * 2);
const blVariants = buildVariants(STAGGER * 3);

const rectStyle: React.CSSProperties = {
  transformOrigin: "center",
  transformBox: "fill-box",
};

const DashboardIcon = forwardRef<DashboardIconHandle, DashboardIconProps>(
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
          <motion.rect
            style={rectStyle}
            variants={tlVariants}
            width="7"
            height="9"
            x="3"
            y="3"
            rx="1"
          />
          <motion.rect
            style={rectStyle}
            variants={trVariants}
            width="7"
            height="5"
            x="14"
            y="3"
            rx="1"
          />
          <motion.rect
            style={rectStyle}
            variants={brVariants}
            width="7"
            height="9"
            x="14"
            y="12"
            rx="1"
          />
          <motion.rect
            style={rectStyle}
            variants={blVariants}
            width="7"
            height="5"
            x="3"
            y="16"
            rx="1"
          />
        </motion.svg>
      </div>
    );
  },
);

DashboardIcon.displayName = "DashboardIcon";

export { DashboardIcon };
