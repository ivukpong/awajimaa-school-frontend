"use client";

import React from "react";
import { BookOpen, ExternalLink, LibraryBig, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type LibraryItem = {
  name: string;
  type: "internal" | "external";
  description: string;
  href: string;
};

interface ELibraryHubProps {
  title: string;
  subtitle: string;
  internalPathPrefix: string;
}

const EXTERNAL_LIBRARIES: LibraryItem[] = [
  {
    name: "National Virtual Library (Nigeria)",
    type: "external",
    description: "Digital books, journals, and educational references.",
    href: "https://www.nvl.nln.gov.ng/",
  },
  {
    name: "World Digital Library",
    type: "external",
    description: "Free multilingual cultural and educational resources.",
    href: "https://www.wdl.org/",
  },
  {
    name: "Open Library",
    type: "external",
    description: "Borrow and read millions of books online.",
    href: "https://openlibrary.org/",
  },
];

const STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
];

export function ELibraryHub({
  title,
  subtitle,
  internalPathPrefix,
}: ELibraryHubProps) {
  const stateLibraries: LibraryItem[] = STATES.map((state) => ({
    name: `${state} State E-Library`,
    type: "internal",
    description: `Browse ${state} curriculum texts, exam prep, and teacher resources.`,
    href: `${internalPathPrefix}?state=${encodeURIComponent(state)}`,
  }));

  const libraries = [...stateLibraries, ...EXTERNAL_LIBRARIES];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" /> Access Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            You must stay signed in to access any E-Library content on Awajimaa.
            External libraries may require additional registration on their
            websites.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {libraries.map((library) => {
          const isExternal = library.type === "external";
          return (
            <a
              key={library.name}
              href={library.href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noreferrer" : undefined}
              className="group rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-brand/50 hover:bg-brand/5 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand/50 dark:hover:bg-brand/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {isExternal ? (
                    <ExternalLink className="h-4 w-4 text-brand" />
                  ) : (
                    <LibraryBig className="h-4 w-4 text-brand" />
                  )}
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {library.name}
                  </p>
                </div>
                <Badge variant={isExternal ? "purple" : "blue"}>
                  {isExternal ? "External" : "Internal"}
                </Badge>
              </div>

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {library.description}
              </p>

              <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand">
                Open Library{" "}
                <BookOpen className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
