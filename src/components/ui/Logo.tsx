import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// logo.jpeg: 445×443 — icon/symbol only
// full_logo.jpeg: 932×268 — full logo with text

interface LogoIconProps {
  /** Icon display size in px (square) */
  size?: number;
  /**
   * Set true when rendering on a dark/coloured background (e.g. brand-red
   * sidebar). Wraps the image in a white rounded pill so it stands out.
   */
  onDark?: boolean;
  className?: string;
}

/** Square icon mark — use in collapsed sidebar or tight spaces. */
export function LogoIcon({
  size = 32,
  onDark = false,
  className,
}: LogoIconProps) {
  const img = (
    <Image
      src="/logo.jpeg"
      alt="Awajimaa"
      width={size}
      height={size}
      className="block object-contain"
      priority
    />
  );

  if (onDark) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-white shadow",
          className,
        )}
        style={{ width: size + 14, height: size + 14 }}
      >
        {img}
      </div>
    );
  }

  return <div className={cn("shrink-0", className)}>{img}</div>;
}

interface LogoProps {
  /** Display height in px — width is calculated from 932/268 aspect ratio (~3.48:1). */
  height?: number;
  /**
   * Set true when rendering on a dark/coloured background. Wraps the full
   * logo image in a white rounded pill so text and colours remain visible.
   */
  onDark?: boolean;
  className?: string;
}

/** Full logo banner (icon + "Awajimaa School" text baked into the image). */
export function Logo({ height = 40, onDark = false, className }: LogoProps) {
  const displayWidth = Math.round((932 / 268) * height); // maintain aspect ratio

  const img = (
    <Image
      src="/full_logo.jpeg"
      alt="Awajimaa School"
      width={displayWidth}
      height={height}
      className="block object-contain"
      priority
    />
  );

  if (onDark) {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-xl bg-white px-3 py-2 shadow",
          className,
        )}
      >
        {img}
      </div>
    );
  }

  return <div className={cn("inline-flex items-center", className)}>{img}</div>;
}
