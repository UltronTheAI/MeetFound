"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import PersonForm from "@/components/PersonForm";
import { appPlan, FREE_PLAN_PERSON_LIMIT } from "@/config/plan";
import { getAllPeople, getPerson, savePerson, updatePerson } from "@/lib/db";
import type { Person, PersonInput } from "@/types/person";

function getCurrentTimestamp() {
  return Date.now();
}

export default function FormPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const personId = useMemo(() => searchParams.get("id") ?? "", [searchParams]);
  const [initialValue, setInitialValue] = useState<Person | null>(null);
  const [isReady, setIsReady] = useState(false);
  const isPaidPlan = appPlan.isPaid;

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      if (!personId) {
        if (!isCancelled) {
          setInitialValue(null);
          setIsReady(true);
        }
        return;
      }

      try {
        const person = await getPerson(personId);
        if (!isCancelled) {
          setInitialValue(person ?? null);
          setIsReady(true);
        }
      } catch {
        if (!isCancelled) {
          setInitialValue(null);
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
    if (personId && !initialValue) router.replace("/");
  }, [initialValue, isReady, personId, router]);

  async function handleSubmit(input: PersonInput) {
    if (!input.id && !isPaidPlan) {
      const existingPeople = await getAllPeople();
      if (existingPeople.length >= FREE_PLAN_PERSON_LIMIT) {
        window.alert(`Free plan supports up to ${FREE_PLAN_PERSON_LIMIT} people.`);
        router.replace("/");
        return;
      }
    }

    const person: Person = {
      id: input.id ?? uuidv4(),
      createdAt: input.createdAt ?? getCurrentTimestamp(),
      name: input.name,
      age: input.age,
      phone: input.phone,
      email: input.email,
      company: input.company,
      role: input.role,
      field: input.field,
      country: input.country,
      state: input.state,
      city: input.city,
      description: input.description,
      website: input.website,
      profileImage: input.profileImage,
      businessCardImage: input.businessCardImage,
    };

    if (input.id) {
      await updatePerson(person);
    } else {
      await savePerson(person);
    }

    router.replace(`/view?id=${encodeURIComponent(person.id)}`);
  }

  if (!isReady) return null;
  if (personId && !initialValue) return null;

  return (
    <PersonForm
      open
      initialValue={initialValue}
      onClose={() => router.replace("/")}
      onSubmit={handleSubmit}
    />
  );
}