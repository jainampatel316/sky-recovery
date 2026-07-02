import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type UserAvatarSize = "sm" | "md" | "lg";

type UserAvatarProps = {
  name: string;
  src?: string;
  alt?: string;
  size?: UserAvatarSize;
  className?: string;
  fallbackClassName?: string;
};

const avatarSizeClassName: Record<UserAvatarSize, string> = {
  sm: "size-6",
  md: "size-8",
  lg: "size-9",
};

const fallbackSizeClassName: Record<UserAvatarSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-sm",
};

export function UserAvatar({
  name,
  src = "",
  alt,
  size = "md",
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <Avatar
      className={cn(
        avatarSizeClassName[size],
        "bg-primary/10 text-primary",
        className,
      )}
    >
      <AvatarImage src={src} alt={alt ?? name} />
      <AvatarFallback
        className={cn(
          fallbackSizeClassName[size],
          "bg-primary/10 font-semibold text-primary",
          fallbackClassName,
        )}
      >
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
