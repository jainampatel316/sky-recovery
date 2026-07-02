"use client";

import { motion, useAnimation } from "motion/react";
import type React from "react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "../../../lib/utils";

export interface UsersIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface UsersIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const USERS = forwardRef<UsersIconHandle, UsersIconProps>(
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
              normal: { scale: 1 },
              animate: { scale: [1, 0.9, 1.1, 1], transition: { duration: 0.4 } },
            }}
            style={{ transformOrigin: "12px 12px" }}
          >
            <motion.path
              d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
              variants={{
                normal: { pathLength: 1, opacity: 1 },
                animate: { pathLength: [0, 1], opacity: [0.5, 1], transition: { duration: 0.5 } },
              }}
            />
            <circle cx="9" cy="7" r="4" />
            <motion.path
              d="M22 21v-2a4 4 0 0 0-3-3.87"
              variants={{
                normal: { pathLength: 1, opacity: 1 },
                animate: { pathLength: [0, 1], opacity: [0.5, 1], transition: { duration: 0.6, delay: 0.1 } },
              }}
            />
            <motion.path
              d="M16 3.13a4 4 0 0 1 0 7.75"
              variants={{
                normal: { pathLength: 1, opacity: 1 },
                animate: { pathLength: [0, 1], opacity: [0.5, 1], transition: { duration: 0.6, delay: 0.1 } },
              }}
            />
          </motion.g>
        </motion.svg>
      </div>
    );
  },
);

USERS.displayName = "UsersIcon";

export { USERS as UsersIcon };
