import * as React from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type PrimaryButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "variant"
> & {
  loading?: boolean;
  loadingText?: string;
};

function PrimaryButton({
  className,
  loading = false,
  loadingText,
  disabled,
  asChild = false,
  children,
  ...props
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Button
      variant="default"
      asChild={asChild}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-loading={loading ? "" : undefined}
      className={cn(
        "h-auto rounded-md px-3 py-1.5 text-xs font-medium",
        "bg-primary text-primary-foreground cursor-pointer",
        "transition-colors hover:bg-primary/90",
        "active:bg-primary/80 active:translate-y-0",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none",
        className,
      )}
      {...props}
    >
      {!asChild && loading ? (
        <>
          <Spinner className="size-3.5" />
          {loadingText && <span>{loadingText}</span>}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export { PrimaryButton };
export type { PrimaryButtonProps };
