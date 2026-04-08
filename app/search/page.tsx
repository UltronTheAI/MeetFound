"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, Filter, Search, X } from "lucide-react";

import PersonCard from "@/components/PersonCard";
import { COMPANY_OPTIONS, FIELD_OPTIONS, ROLE_OPTIONS, getCountries, getStates, getCities } from "@/lib/form-options";
import { getAllPeople } from "@/lib/db";
import type { Person } from "@/types/person";

const PEOPLE_BATCH_SIZE = 24;

type Filters = {
  company: string;
  role: string;
  field: string;
  country: string;
  state: string;
  city: string;
};

type LocationFilters = {
  countryCode?: string;
  stateCode?: string;
};

export default function SearchPage() {
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({
    company: "",
    role: "",
    field: "",
    country: "",
    state: "",
    city: "",
  });
  const [locationFilters, setLocationFilters] = useState<LocationFilters>({
    countryCode: undefined,
    stateCode: undefined,
  });
  const [showFilters, setShowFilters] = useState(false);
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
    let result = people;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((person) => {
        const haystack = [
          person.name,
          person.company,
          person.role,
          person.field,
          person.email,
          person.country,
          person.state,
          person.city,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    // Apply filters
    const activeFilters = Object.entries(filters).filter(([, value]) => value.trim());
    if (activeFilters.length) {
      result = result.filter((person) => {
        return activeFilters.every(([key, filterValue]) => {
          const personValue = person[key as keyof Person]?.toString().toLowerCase() || "";
          return personValue.includes(filterValue.toLowerCase());
        });
      });
    }

    return result;
  }, [searchQuery, filters, people]);

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

  const handleCountryChange = (countryName: string) => {
    const countries = getCountries();
    const selectedCountry = countries.find(c => c.name === countryName);
    
    setFilters((prev) => ({ 
      ...prev, 
      country: countryName,
      state: "",
      city: ""
    }));
    setLocationFilters({
      countryCode: selectedCountry?.isoCode,
      stateCode: undefined,
    });
  };

  const handleStateChange = (stateName: string) => {
    const states = getStates(locationFilters.countryCode);
    const selectedState = states.find(s => s.name === stateName);
    
    setFilters((prev) => ({ 
      ...prev, 
      state: stateName,
      city: ""
    }));
    setLocationFilters((prev) => ({
      ...prev,
      stateCode: selectedState?.isoCode,
    }));
  };

  const handleCityChange = (cityName: string) => {
    setFilters((prev) => ({ ...prev, city: cityName }));
  };

  const clearFilters = () => {
    setFilters({
      company: "",
      role: "",
      field: "",
      country: "",
      state: "",
      city: "",
    });
    setLocationFilters({
      countryCode: undefined,
      stateCode: undefined,
    });
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const hasActiveFilters = Object.values(filters).some(v => v.trim());
  const hasActiveSearch = searchQuery.trim();

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

        {/* Search Bar */}
        <section className="rounded-[28px] border border-line bg-white/5 p-4 shadow-[0_12px_30px_rgba(8,15,29,0.22)] backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                suppressHydrationWarning
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name, company, role, field, country, state, or city"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-slate-500"
              />
              {hasActiveSearch && (
                <button
                  onClick={clearSearch}
                  className="text-slate-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                showFilters
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-white/10 bg-slate-950/40 text-white hover:border-accent/40"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 h-2 w-2 rounded-full bg-accent"></span>
              )}
            </button>
          </div>
        </section>

        {/* Filters */}
        {showFilters && (
          <section className="rounded-[28px] border border-line bg-[#0d0d0d] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Advanced Filters</h2>
              <button
                onClick={clearFilters}
                className="text-sm text-accent hover:text-accent/80"
              >
                Clear all
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ChoiceFilterInput
                label="Company"
                value={filters.company}
                onChange={(value) => handleFilterChange("company", value)}
                options={COMPANY_OPTIONS}
                placeholder="Search a company or type your own"
              />
              <ChoiceFilterInput
                label="Role"
                value={filters.role}
                onChange={(value) => handleFilterChange("role", value)}
                options={ROLE_OPTIONS}
                placeholder="Search a role or type your own"
              />
              <ChoiceFilterInput
                label="Field"
                value={filters.field}
                onChange={(value) => handleFilterChange("field", value)}
                options={FIELD_OPTIONS}
                placeholder="Search a field or type your own"
              />
              <ChoiceFilterInput
                label="Country"
                value={filters.country}
                onChange={handleCountryChange}
                options={getCountries().map(c => c.name)}
                placeholder="Search a country or type your own"
              />
              <ChoiceFilterInput
                label="State"
                value={filters.state}
                onChange={handleStateChange}
                options={getStates(locationFilters.countryCode).map(s => s.name)}
                placeholder="Search a state or type your own"
                disabled={!locationFilters.countryCode}
              />
              <ChoiceFilterInput
                label="City"
                value={filters.city}
                onChange={handleCityChange}
                options={getCities(locationFilters.countryCode, locationFilters.stateCode).map(c => c.name)}
                placeholder="Search a city or type your own"
                disabled={!locationFilters.countryCode}
              />
            </div>
          </section>
        )}

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

function ChoiceFilterInput({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[] | string[];
  placeholder: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = useMemo(() => {
    const normalized = value.trim().toLowerCase();
    const base = normalized
      ? options.filter((option) => option.toLowerCase().includes(normalized))
      : [...options];

    return base.slice(0, 8);
  }, [options, value]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Element;
      if (!target.closest('.choice-filter-wrapper')) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div className="choice-filter-wrapper">
      <label className="block text-sm font-medium text-white mb-2">
        {label}
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          suppressHydrationWarning
          value={value}
          disabled={disabled}
          onFocus={() => !disabled && setIsOpen(true)}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-white/10 bg-slate-950/40 px-10 py-2 text-sm text-white placeholder:text-slate-500 focus:border-accent focus:outline-none ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
        {isOpen && !disabled && (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-white/10 bg-[#080808] shadow-[0_18px_45px_rgba(0,0,0,0.45)]">
            <div className="border-b border-white/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted">
              Search results
            </div>
            <div className="max-h-56 overflow-y-auto p-2">
              {filteredOptions.length ? (
                filteredOptions.map((option) => (
                  <button
                    suppressHydrationWarning
                    key={option}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-white transition hover:bg-white/8"
                  >
                    <span>{option}</span>
                    {value.toLowerCase() === option.toLowerCase() && (
                      <span className="text-accent">✓</span>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted">
                  No matches found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
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