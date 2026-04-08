"use client";

import { Suspense } from "react";

import ViewPageContent from "./ViewPageContent";

export default function ViewPage() {
  return (
    <Suspense fallback={null}>
      <ViewPageContent />
    </Suspense>
  );
}
