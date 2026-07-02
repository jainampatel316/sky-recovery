"use client";

import { motion, useAnimation } from "motion/react";
import type React from "react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "../../../lib/utils";

export interface MegaphoneIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface MegaphoneIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const MEGAPHONE = forwardRef<MegaphoneIconHandle, MegaphoneIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
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
          <motion.g
            variants={{
              normal: { rotate: 0, scale: 1 },
              animate: { rotate: [0, -15, 15, -10, 0], scale: [1, 1.1, 1], transition: { duration: 0.5 } },
            }}
            style={{ transformOrigin: "12px 12px" }}
          >
            <motion.path
              d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
              variants={{
                normal: { pathLength: 1, opacity: 1 },
                animate: { pathLength: [0, 1], opacity: [0.5, 1], transition: { duration: 0.6 } }
              }}
            />
            <motion.path
              d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"
              variants={{
                normal: { pathLength: 1, opacity: 1 },
                animate: { pathLength: [0, 1], opacity: [0.5, 1], transition: { duration: 0.6, delay: 0.2 } }
              }}
            />
            <motion.path
              d="M8 6v8"
              variants={{
                normal: { pathLength: 1, opacity: 1 },
                animate: { pathLength: [0, 1], opacity: [0.5, 1], transition: { duration: 0.6, delay: 0.3 } }
              }}
            />
          </motion.g>
        </motion.svg>
      </div>
    );
  },
);

MEGAPHONE.displayName = "MegaphoneIcon";

export { MEGAPHONE as MegaphoneIcon };
