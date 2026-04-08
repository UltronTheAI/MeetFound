"use client";

import { Suspense } from "react";

import FormPageContent from "./FormPageContent";

export default function FormPage() {
  return (
    <Suspense fallback={null}>
      <FormPageContent />
    </Suspense>
  );
}
