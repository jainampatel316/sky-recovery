import { motion, useAnimation, Variants } from "motion/react";
import React, { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "../../../lib/utils";
import { LucideIcon } from "lucide-react";

export type IconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

export function createAnimatedIcon(Icon: LucideIcon, variants: Variants) {
  const AnimatedComponent = forwardRef<IconHandle, React.HTMLAttributes<HTMLDivElement> & { size?: number }>(
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
          className={cn("inline-flex items-center justify-center", className)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          {...props}
        >
          <motion.div
            className="flex items-center justify-center"
            initial="normal"
            animate={controls}
            variants={variants}
            style={{ transformOrigin: "center" }}
          >
            <Icon size={size} strokeWidth={2} />
          </motion.div>
        </div>
      );
    },
  );

  AnimatedComponent.displayName = `Animated${Icon.displayName || 'Icon'}`;
  return AnimatedComponent;
}
