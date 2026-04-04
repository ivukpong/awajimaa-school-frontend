"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "./Button";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button — visible on mobile only */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-brand transition-colors"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile dropdown panel */}
      {open && (
        <div className="absolute top-16 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-lg px-4 py-4 flex flex-col gap-3 md:hidden">
          <a
            href="#features"
            onClick={() => setOpen(false)}
            className="py-2 text-sm font-medium text-gray-700 hover:text-brand transition-colors"
          >
            Features
          </a>
          <a
            href="#who"
            onClick={() => setOpen(false)}
            className="py-2 text-sm font-medium text-gray-700 hover:text-brand transition-colors"
          >
            Who We Serve
          </a>
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="py-2 text-sm font-medium text-gray-700 hover:text-brand transition-colors"
          >
            Contact
          </a>
          <hr className="border-gray-100" />
          <Link href="/login" onClick={() => setOpen(false)}>
            <Button
              variant="outline"
              className="w-full border-brand/40 text-brand hover:bg-brand/10"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/register" onClick={() => setOpen(false)}>
            <Button className="w-full bg-brand hover:bg-brand-dark text-white">
              Get Started
            </Button>
          </Link>
        </div>
      )}
    </>
  );
}
