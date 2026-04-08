"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import PersonDetailModal from "@/components/PersonDetailModal";
import { deletePerson, getPerson } from "@/lib/db";
import type { Person } from "@/types/person";

export default function ViewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const personId = useMemo(() => searchParams.get("id") ?? "", [searchParams]);
  const [person, setPerson] = useState<Person | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      if (!personId) {
        if (!isCancelled) setIsReady(true);
        return;
      }

      try {
        const found = await getPerson(personId);
        if (!isCancelled) {
          setPerson(found ?? null);
          setIsReady(true);
        }
      } catch {
        if (!isCancelled) {
          setPerson(null);
          setIsReady(true);
        }
      }
    }

    void load();

    return () => {
      isCancelled = true;
    };
  }, [personId]);

  useEffect(() => {
    if (!isReady) return;
    if (!personId || !person) router.replace("/");
  }, [isReady, person, personId, router]);

  if (!isReady) return null;
  if (!person) return null;

  return (
    <PersonDetailModal
      person={person}
      onClose={() => router.replace("/")}
      onEdit={() => router.push(`/form?id=${encodeURIComponent(person.id)}`)}
      onDelete={async () => {
        await deletePerson(person.id);
        router.replace("/");
      }}
    />
  );
}