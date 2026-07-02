"use client";

import { motion, useAnimation, type Variants } from "motion/react";
import type React from "react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

export interface GraduationCapIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface GraduationCapIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

// A celebratory "cap toss": the mortarboard lifts and tilts with a damped
// wobble, then settles — mirrors the beat used by the other nav icons.
const capVariants: Variants = {
  normal: {
    rotate: 0,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  animate: {
    rotate: [0, -7, 6, -4, 0],
    y: [0, -2, -1, -0.5, 0],
    transition: {
      duration: 0.9,
      ease: "easeOut",
      repeat: Infinity,
      repeatDelay: 0.7,
    },
  },
};

const capStyle: React.CSSProperties = {
  transformOrigin: "12px 10px",
};

const GraduationCapIcon = forwardRef<
  GraduationCapIconHandle,
  GraduationCapIconProps
>(({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
  const controls = useAnimation();
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
        <motion.g style={capStyle} variants={capVariants}>
          <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
          <path d="M22 10v6" />
          <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
        </motion.g>
      </motion.svg>
    </div>
  );
});

GraduationCapIcon.displayName = "GraduationCapIcon";

export { GraduationCapIcon };
