"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./Button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronRight as ArrowRight,
  Star,
} from "lucide-react";

interface Slide {
  src: string;
  alt: string;
  headline: string;
  sub: string;
}

const slides: Slide[] = [
  {
    src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&q=80",
    alt: "Students engaged in classroom learning",
    headline: "The Smart Platform for Modern School Management",
    sub: "Awajimaa empowers schools, parents, students, teachers, sponsors, and regulators with a single connected platform.",
  },
  {
    src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80",
    alt: "Happy teacher guiding students",
    headline: "Connecting Teachers & Students Around the World",
    sub: "From e-learning to payroll, from admissions to scholarships — all in one place.",
  },
  {
    src: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1600&q=80",
    alt: "Happy students studying together",
    headline: "Thousands of Students. One Powerful Platform.",
    sub: "Track performance, pay fees, view timetables, and stay connected with your school in real time.",
  },
  {
    src: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=1600&q=80",
    alt: "Children excited about learning",
    headline: "Education Without Limits",
    sub: "Trusted by schools, Teachers, Ministries of Education, and Education regulators across the World.",
  },
];

const INTERVAL_MS = 5000;

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, next]);

  return (
    <section
      className="relative overflow-hidden min-h-[70vh] md:min-h-[85vh] flex items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          aria-hidden={i !== current}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover"
            priority={i === 0}
            sizes="100vw"
          />
          {/* Dark gradient overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>
      ))}

      {/* Content overlay */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-white">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <Star className="h-3.5 w-3.5 fill-brand-gold text-brand-gold" />
          Trusted by State Ministries of Education, and Schools across Africa
          and beyond
        </div>

        {/* Headline — crossfades with slide */}
        <div className="h-[8rem] sm:h-[6rem] md:h-[7.5rem] flex items-center justify-center">
          {slides.map((slide, i) => (
            <h1
              key={i}
              className={`absolute text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight transition-all duration-700 px-4 ${
                i === current
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4 pointer-events-none"
              }`}
            >
              {slide.headline}
            </h1>
          ))}
        </div>

        {/* Sub-headline */}
        <div className="h-[5rem] sm:h-[4rem] md:h-[3.5rem] flex items-center justify-center mt-2 mb-8">
          {slides.map((slide, i) => (
            <p
              key={i}
              className={`absolute text-base md:text-lg text-white/85 max-w-2xl mx-auto transition-all duration-700 delay-100 px-4 ${
                i === current
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4 pointer-events-none"
              }`}
            >
              {slide.sub}
            </p>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 justify-center mt-4">
          <Link href="/register?role=school_admin">
            <Button
              size="lg"
              className="bg-white text-brand hover:bg-brand/10 font-bold shadow-lg px-8"
            >
              Register Your School
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
          <Link href="/admissions">
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/20 font-bold px-8"
            >
              Browse Schools
            </Button>
          </Link>
        </div>
      </div>

      {/* Prev / Next arrows — hidden on mobile to avoid covering text */}
      <button
        onClick={prev}
        className="hidden sm:flex absolute left-6 top-1/2 -translate-y-1/2 z-30 rounded-full bg-black/30 hover:bg-black/55 text-white p-2.5 transition-colors backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 rounded-full bg-black/30 hover:bg-black/55 text-white p-2.5 transition-colors backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dot navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 h-2.5 bg-white"
                : "w-2.5 h-2.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
