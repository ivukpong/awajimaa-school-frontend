"use client";

import React from "react";
import { ELibraryHub } from "@/components/ui/ELibraryHub";

export default function SchoolAdminELibraryPage() {
  return (
    <ELibraryHub
      title="All E-Libraries"
      subtitle="Access state and external libraries for your school teams and learners."
      internalPathPrefix="/school-admin/e-learning"
    />
  );
}
