"use client";

import Image from "next/image";
import { Building2, MapPin, UserRound } from "lucide-react";

import type { Person } from "@/types/person";

type PersonCardProps = {
  person: Person;
  onClick: (person: Person) => void;
};

export default function PersonCard({ person, onClick }: PersonCardProps) {
  return (
    <button
      suppressHydrationWarning
      type="button"
      onClick={() => onClick(person)}
      className="group flex h-full min-h-[19rem] flex-col overflow-hidden rounded-[28px] border border-line bg-card text-left shadow-[var(--shadow)] transition duration-200 hover:-translate-y-1 hover:border-accent/40 hover:bg-[#151515]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#080808]">
        {person.profileImage ? (
          <Image
            src={person.profileImage}
            alt={person.name}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#111111] text-white/80">
            <UserRound className="h-10 w-10" />
            <span className="text-4xl font-semibold">
              {person.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-xl font-semibold text-white">{person.name}</p>
          <div className="mt-2 space-y-2 text-sm text-muted">
            <p className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-500" />
              <span>
                {person.role || "Role not saved"}
                {person.company ? ` at ${person.company}` : ""}
              </span>
            </p>
            {person.city || person.state || person.country ? (
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" />
                <span>{[person.city, person.state, person.country].filter(Boolean).join(", ")}</span>
              </p>
            ) : null}
          </div>
        </div>
        <div className="mt-auto flex flex-wrap gap-2 text-xs">
          {person.field ? (
            <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-accent">
              {person.field}
            </span>
          ) : null}
          {person.phone ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
              {person.phone}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
