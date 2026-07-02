import * as React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Grow the field to fit its content instead of scrolling. */
  autoResize?: boolean;
  /** Minimum visible rows when `autoResize` is on (default 4). */
  minRows?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      autoResize = false,
      minRows = 4,
      rows,
      value,
      onChange,
      ...props
    },
    ref,
  ) => {
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null);

    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref)
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
            node;
      },
      [ref],
    );

    const resize = React.useCallback(() => {
      const el = innerRef.current;
      if (!el || !autoResize) return;
      
      const currentHeight = el.style.height;
      el.style.height = "auto";
      const newHeight = `${el.scrollHeight}px`;
      
      if (currentHeight === newHeight) {
        el.style.height = currentHeight;
        return;
      }
      
      el.style.height = newHeight;
    }, [autoResize]);

    React.useEffect(() => {
      resize();
    }, [resize, value]);

    return (
      <textarea
        ref={setRefs}
        rows={autoResize ? minRows : rows}
        value={value}
        onChange={(e) => {
          onChange?.(e);
          resize();
        }}
        className={cn(
          "w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus:border-zinc-500 dark:focus:ring-zinc-500 dark:focus-visible:border-zinc-500 dark:focus-visible:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-50",
          autoResize ? "resize-none overflow-hidden" : "min-h-28 resize-y",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
