"use client";

import React from "react";
import { ELibraryHub } from "@/components/ui/ELibraryHub";

export default function TeacherELibraryPage() {
  return (
    <ELibraryHub
      title="All E-Libraries"
      subtitle="Quick access to state libraries and external repositories for lesson prep."
      internalPathPrefix="/teacher/e-learning"
    />
  );
}
