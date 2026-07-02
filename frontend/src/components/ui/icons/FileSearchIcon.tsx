"use client";

import { motion, useAnimation } from "motion/react";
import type React from "react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "../../../lib/utils";

export interface FileSearchIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface FileSearchIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const FILE_SEARCH = forwardRef<FileSearchIconHandle, FileSearchIconProps>(
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
              animate: { scale: [1, 0.9, 1.05, 1], transition: { duration: 0.4 } },
            }}
            style={{ transformOrigin: "12px 12px" }}
          >
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M4.268 21a2 2 0 0 0 1.727 1H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3" />
            
            <motion.g
              variants={{
                normal: { x: 0, y: 0 },
                animate: { x: [0, 2, -2, 0], y: [0, 2, -2, 0], transition: { duration: 0.5, delay: 0.1 } },
              }}
            >
              <path d="m9 18-1.5-1.5" />
              <circle cx="5" cy="14" r="3" />
            </motion.g>
          </motion.g>
        </motion.svg>
      </div>
    );
  },
);

FILE_SEARCH.displayName = "FileSearchIcon";

export { FILE_SEARCH as FileSearchIcon };
