"use client";
import React, { useState, useEffect } from "react";
import { Logo } from "@/components/ui/Logo";
import {
  GraduationCap,
  BookOpen,
  Users,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Slide data ────────────────────────────────────────────────────────────────

const SLIDES = [
  {
    label: "Students",
    tagline: "Every child deserves\na world-class education.",
    sub: "Track results, attendance, and growth — all in one place.",
    icon: GraduationCap,
    bg: "from-[#E84000] to-[#B83200]",
    shape1: "bg-white/10",
    shape2: "bg-brand-gold/20",
    dots: ["bg-white/80", "bg-white/30", "bg-white/30", "bg-white/30"],
  },
  {
    label: "Teachers",
    tagline: "Empower the teachers\nwho shape tomorrow.",
    sub: "Lesson plans, grading, timetables — simplified for every educator.",
    icon: BookOpen,
    bg: "from-[#1e3a5f] to-[#0D1B2A]",
    shape1: "bg-white/10",
    shape2: "bg-brand-gold/20",
    dots: ["bg-white/30", "bg-white/80", "bg-white/30", "bg-white/30"],
  },
  {
    label: "Parents",
    tagline: "Stay close to your\nchild's school life.",
    sub: "Real-time updates on fees, results, attendance and more.",
    icon: Users,
    bg: "from-[#1a6340] to-[#0f3d27]",
    shape1: "bg-white/10",
    shape2: "bg-brand-gold/20",
    dots: ["bg-white/30", "bg-white/30", "bg-white/80", "bg-white/30"],
  },
  {
    label: "Excellence",
    tagline: "Celebrate achievement.\nBuild a culture of success.",
    sub: "Scholarships, awards, and recognition — all managed here.",
    icon: Trophy,
    bg: "from-[#7c3800] to-[#4a2000]",
    shape1: "bg-white/10",
    shape2: "bg-brand-gold/20",
    dots: ["bg-white/30", "bg-white/30", "bg-white/30", "bg-white/80"],
  },
];

// ── Decorative SVG blobs ──────────────────────────────────────────────────────

function SceneIllustration({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="relative flex items-center justify-center w-full flex-1">
      {/* Large blurred circle backdrop */}
      <div className="absolute w-72 h-72 rounded-full bg-white/5 blur-3xl" />
      {/* Outer ring */}
      <div className="absolute w-56 h-56 rounded-full border border-white/10" />
      {/* Middle ring */}
      <div className="absolute w-40 h-40 rounded-full border border-white/15" />
      {/* Inner filled circle */}
      <div className="relative z-10 w-28 h-28 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/25">
        <Icon
          className="h-14 w-14 text-white drop-shadow-lg"
          strokeWidth={1.2}
        />
      </div>
      {/* Floating accent dots */}
      <div
        className="absolute top-8 right-12 w-3 h-3 rounded-full bg-brand-gold/60 animate-bounce"
        style={{ animationDelay: "0.2s" }}
      />
      <div
        className="absolute bottom-10 left-16 w-2 h-2 rounded-full bg-white/40 animate-bounce"
        style={{ animationDelay: "0.6s" }}
      />
      <div
        className="absolute top-20 left-10 w-4 h-4 rounded-full bg-white/20 animate-bounce"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute bottom-16 right-8 w-2.5 h-2.5 rounded-full bg-brand-gold/40 animate-bounce"
        style={{ animationDelay: "0.4s" }}
      />
    </div>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const goTo = (idx: number) => {
    if (idx === current || transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(idx);
      setTransitioning(false);
    }, 300);
  };

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);
  const next = () => goTo((current + 1) % SLIDES.length);

  // Auto-advance every 5 s
  useEffect(() => {
    const id = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % SLIDES.length);
        setTransitioning(false);
      }, 300);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const slide = SLIDES[current];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* ── Left panel — slider ───────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-1/2 flex-col overflow-hidden relative">
        {/* White logo strip at the very top */}
        <div className="relative z-20 bg-white flex items-center px-8 h-20 shrink-0 shadow-sm">
          <Logo height={42} />
        </div>

        {/* Slide area */}
        <div
          className={cn(
            "flex-1 flex flex-col bg-gradient-to-br transition-[background] duration-700",
            slide.bg,
          )}
        >
          {/* Decorative blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className={cn(
                "absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-30",
                slide.shape1,
              )}
            />
            <div
              className={cn(
                "absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-20",
                slide.shape2,
              )}
            />
          </div>

          {/* Slide content */}
          <div
            className={cn(
              "flex-1 flex flex-col px-10 pt-10 pb-6 transition-all duration-300",
              transitioning
                ? "opacity-0 translate-y-4"
                : "opacity-100 translate-y-0",
            )}
          >
            {/* Role badge */}
            <span className="inline-flex items-center gap-2 self-start rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80 border border-white/20 backdrop-blur-sm">
              <Icon className="h-3 w-3" />
              {slide.label}
            </span>

            {/* Illustration */}
            <SceneIllustration icon={Icon} />

            {/* Copy */}
            <div className="space-y-3 mt-auto">
              <h2 className="text-3xl xl:text-4xl font-bold leading-tight text-white whitespace-pre-line">
                {slide.tagline}
              </h2>
              <p className="text-white/65 text-base leading-relaxed">
                {slide.sub}
              </p>
            </div>

            {/* Feature tags */}
            <div className="flex flex-wrap gap-2 mt-6">
              {[
                "Schools",
                "E-Learning",
                "Fees",
                "Results",
                "Attendance",
                "Messaging",
              ].map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs text-white/70"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Slider controls */}
          <div className="relative z-10 flex items-center justify-between px-10 pb-8 pt-2">
            {/* Dots */}
            <div className="flex gap-2 items-center">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === current
                      ? "w-6 h-2 bg-white"
                      : "w-2 h-2 bg-white/35 hover:bg-white/60",
                  )}
                />
              ))}
            </div>
            {/* Arrows */}
            <div className="flex gap-2">
              <button
                onClick={prev}
                className="w-9 h-9 rounded-full border border-white/25 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={next}
                className="w-9 h-9 rounded-full border border-white/25 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-white/30 pb-4">
            © {new Date().getFullYear()} Awajimaa School Management. All rights
            reserved.
          </p>
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <Logo height={40} />
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
