"use client";
import React, { useRef, KeyboardEvent, ClipboardEvent } from "react";
import { cn } from "@/lib/utils";

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  masked?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function PinInput({
  value,
  onChange,
  length = 6,
  masked = false,
  disabled = false,
  autoFocus = false,
}: PinInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value
    .split("")
    .concat(Array(length).fill(""))
    .slice(0, length);

  function handleKeyDown(idx: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[idx]) {
        const next = value.slice(0, idx) + value.slice(idx + 1);
        onChange(next.slice(0, length));
      } else if (idx > 0) {
        refs.current[idx - 1]?.focus();
        const next = value.slice(0, idx - 1) + value.slice(idx);
        onChange(next.slice(0, length));
      }
      return;
    }

    if (e.key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      refs.current[idx - 1]?.focus();
      return;
    }

    if (e.key === "ArrowRight" && idx < length - 1) {
      e.preventDefault();
      refs.current[idx + 1]?.focus();
      return;
    }

    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      const next = value.slice(0, idx) + e.key + value.slice(idx + 1);
      onChange(next.slice(0, length));
      if (idx < length - 1) refs.current[idx + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (pasted) {
      onChange(pasted);
      const nextIdx = Math.min(pasted.length, length - 1);
      refs.current[nextIdx]?.focus();
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => {
            refs.current[idx] = el;
          }}
          type={masked ? "password" : "text"}
          inputMode="numeric"
          maxLength={1}
          value={digit}
          readOnly
          autoFocus={autoFocus && idx === 0}
          disabled={disabled}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onClick={() => refs.current[idx]?.focus()}
          className={cn(
            "w-11 h-12 text-center text-lg font-semibold rounded-lg border-2 outline-none transition-colors",
            "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
            digit ? "border-brand" : "border-gray-300 dark:border-gray-600",
            "focus:border-brand focus:ring-2 focus:ring-brand/30",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        />
      ))}
    </div>
  );
}
