"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";

import PersonCard from "@/components/PersonCard";
import { getAllPeople } from "@/lib/db";
import type { Person } from "@/types/person";

const PEOPLE_BATCH_SIZE = 24;

type Filters = {
  name: string;
  company: string;
  role: string;
  field: string;
  country: string;
  state: string;
  city: string;
};

export default function SearchPage() {
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [filters, setFilters] = useState<Filters>({
    name: "",
    company: "",
    role: "",
    field: "",
    country: "",
    state: "",
    city: "",
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [visiblePeopleCount, setVisiblePeopleCount] = useState(PEOPLE_BATCH_SIZE);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isCancelled = false;

    void getAllPeople().then((nextPeople) => {
      if (isCancelled) return;
      setPeople(nextPeople);
      setIsLoaded(true);
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  const filteredPeople = useMemo(() => {
    const activeFilters = Object.entries(filters).filter(([, value]) => value.trim());

    if (!activeFilters.length) return people;

    return people.filter((person) => {
      return activeFilters.every(([key, filterValue]) => {
        const personValue = person[key as keyof Person]?.toString().toLowerCase() || "";
        return personValue.includes(filterValue.toLowerCase());
      });
    });
  }, [filters, people]);

  useEffect(() => {
    setVisiblePeopleCount(Math.min(PEOPLE_BATCH_SIZE, filteredPeople.length));
  }, [filteredPeople.length]);

  useEffect(() => {
    setVisiblePeopleCount((current) => Math.min(current, filteredPeople.length));
  }, [filteredPeople.length]);

  const visiblePeople = useMemo(
    () => filteredPeople.slice(0, visiblePeopleCount),
    [filteredPeople, visiblePeopleCount]
  );

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;
    if (visiblePeopleCount >= filteredPeople.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        setVisiblePeopleCount((current) =>
          Math.min(current + PEOPLE_BATCH_SIZE, filteredPeople.length)
        );
      },
      { root: null, rootMargin: "900px 0px", threshold: 0.01 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredPeople.length, visiblePeopleCount]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      name: "",
      company: "",
      role: "",
      field: "",
      country: "",
      state: "",
      city: "",
    });
  };

  return (
    <main className="min-h-screen bg-black px-3 py-4 pb-28 sm:px-6 sm:py-6 sm:pb-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        {/* Header */}
        <section className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-[#111111] p-3 text-white transition hover:border-accent/40 hover:bg-[#161616]"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-white">Search People</h1>
            <p className="text-sm text-muted">Filter and find people in your network</p>
          </div>
        </section>

        {/* Filters */}
        <section className="rounded-[28px] border border-line bg-[#0d0d0d] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Filters</h2>
            <button
              onClick={clearFilters}
              className="text-sm text-accent hover:text-accent/80"
            >
              Clear all
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <FilterInput
              label="Name"
              value={filters.name}
              onChange={(value) => handleFilterChange("name", value)}
              placeholder="Enter name"
            />
            <FilterInput
              label="Company"
              value={filters.company}
              onChange={(value) => handleFilterChange("company", value)}
              placeholder="Enter company"
            />
            <FilterInput
              label="Role"
              value={filters.role}
              onChange={(value) => handleFilterChange("role", value)}
              placeholder="Enter role"
            />
            <FilterInput
              label="Field"
              value={filters.field}
              onChange={(value) => handleFilterChange("field", value)}
              placeholder="Enter field"
            />
            <FilterInput
              label="Country"
              value={filters.country}
              onChange={(value) => handleFilterChange("country", value)}
              placeholder="Enter country"
            />
            <FilterInput
              label="State"
              value={filters.state}
              onChange={(value) => handleFilterChange("state", value)}
              placeholder="Enter state"
            />
            <FilterInput
              label="City"
              value={filters.city}
              onChange={(value) => handleFilterChange("city", value)}
              placeholder="Enter city"
            />
          </div>
        </section>

        {/* Results */}
        <section className="rounded-[32px] border border-line bg-[#0d0d0d] p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Results</h2>
            <div className="text-right">
              {!isLoaded ? (
                <p className="text-sm text-muted">Loading from your browser...</p>
              ) : (
                <p className="text-sm text-muted">
                  {filteredPeople.length} {filteredPeople.length === 1 ? "result" : "results"}
                </p>
              )}
            </div>
          </div>

          {filteredPeople.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visiblePeople.map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  onClick={(clickedPerson) =>
                    router.push(
                      `/view?id=${encodeURIComponent(clickedPerson.id)}`
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState hasFilters={Object.values(filters).some(v => v.trim())} />
          )}

          {visiblePeopleCount < filteredPeople.length ? (
            <div className="mt-6">
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-sm text-muted">
                  Showing {visiblePeople.length} of {filteredPeople.length}
                </p>
                <p className="text-sm font-medium text-slate-200">
                  Scroll to load more
                </p>
              </div>
              <div ref={loadMoreRef} className="h-6" />
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-white mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-accent focus:outline-none"
      />
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-[28px] border border-dashed border-white/12 bg-[#0a0a0a] px-6 py-12 text-center">
      <Search className="mx-auto h-12 w-12 text-slate-500" />
      <p className="mt-4 text-lg font-medium text-white">
        {hasFilters ? "No matches for those filters." : "Start by adding some filters."}
      </p>
      <p className="mt-2 text-sm text-muted">
        {hasFilters
          ? "Try adjusting your filters or clearing them to see all people."
          : "Use the filters above to find specific people in your network."}
      </p>
    </div>
  );
}