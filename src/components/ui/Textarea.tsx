"use client";
import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, ...props }, ref) => (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className="block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-brand focus:ring focus:ring-brand/20 sm:text-sm dark:bg-gray-900 dark:text-white"
        {...props}
      />
    </div>
  ),
);
Textarea.displayName = "Textarea";
