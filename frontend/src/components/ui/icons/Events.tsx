"use client";

import { motion, useAnimation } from "motion/react";
import type React from "react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "../../../lib/utils";

export interface EventsIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface EventsIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const EVENTS = forwardRef<EventsIconHandle, EventsIconProps>(
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
            style={{ transformOrigin: "12px 12px" }}
            variants={{
              normal: { scale: 1 },
              animate: {
                scale: [1, 0.9, 1.05, 1],
                transition: {
                  duration: 0.4,
                  ease: "easeInOut" as const,
                },
              },
            }}
          >
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M16 2v4" />
            <path d="M8 2v4" />
            <path d="M3 10h18" />
            
            <motion.g
              variants={{
                normal: { pathLength: 1, opacity: 1 },
                animate: {
                  pathLength: [0, 1],
                  opacity: [0.5, 1],
                  transition: { duration: 0.5, delay: 0.1, ease: "easeOut" },
                },
              }}
            >
              <path d="M17 14h-6" />
              <path d="M13 18H7" />
              <path d="M7 14h.01" />
              <path d="M17 18h.01" />
            </motion.g>
          </motion.g>
        </motion.svg>
      </div>
    );
  },
);

EVENTS.displayName = "EventsIcon";

export { EVENTS as EventsIcon };
