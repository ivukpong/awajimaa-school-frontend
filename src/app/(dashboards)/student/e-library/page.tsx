"use client";

import React from "react";
import { ELibraryHub } from "@/components/ui/ELibraryHub";

export default function StudentELibraryPage() {
  return (
    <ELibraryHub
      title="All E-Libraries"
      subtitle="Find your state resources and trusted external libraries for self-study."
      internalPathPrefix="/student/e-learning"
    />
  );
}
