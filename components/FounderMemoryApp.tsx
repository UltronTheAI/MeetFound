"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArchiveRestore,
  Download,
  FileSpreadsheet,
  ImageUp,
  Plus,
  Search,
  Smartphone,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import PersonCard from "@/components/PersonCard";
import SearchBar from "@/components/SearchBar";
import { appPlan, FREE_PLAN_PERSON_LIMIT } from "@/config/plan";
import { buildImagesZip, exportPeopleToCsv, parsePeopleCsv } from "@/lib/csv";
import { saveBlobAsWithPicker } from "@/lib/saveAs";
import { getAllPeople, importPeople } from "@/lib/db";
import type { Person } from "@/types/person";

type Toast = {
  id: string;
  message: string;
  tone: "success" | "error";
};

const PEOPLE_BATCH_SIZE = 24;

export default function FounderMemoryApp() {
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [visiblePeopleCount, setVisiblePeopleCount] = useState(PEOPLE_BATCH_SIZE);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isPaidPlan = appPlan.isPaid;
  const canUseImportExport = isPaidPlan;
  const canAddMorePeople = isPaidPlan || people.length < FREE_PLAN_PERSON_LIMIT;

  async function refreshPeople() {
    const nextPeople = await getAllPeople();
    setPeople(nextPeople);
    setIsLoaded(true);
  }

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

  const recentPeople = useMemo(() => people.slice(0, 3), [people]);

  useEffect(() => {
    setVisiblePeopleCount(Math.min(PEOPLE_BATCH_SIZE, people.length));
  }, [people.length]);

  useEffect(() => {
    setVisiblePeopleCount((current) => Math.min(current, people.length));
  }, [people.length]);

  const visiblePeople = useMemo(
    () => people.slice(0, visiblePeopleCount),
    [people, visiblePeopleCount]
  );

  async function handleExportCsv() {
    if (!canUseImportExport) {
      pushToast("CSV export is available on the paid plan only.", "error");
      return;
    }

    if (!people.length) {
      pushToast("Add a few people before exporting CSV.", "error");
      return;
    }

    const didSave = await downloadFile(
      new Blob([exportPeopleToCsv(people)], {
        type: "text/csv;charset=utf-8;",
      }),
      "meetfound-people.csv"
    );

    if (didSave) {
      pushToast("CSV exported.", "success");
    }
  }

  async function handleImportCsv(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!canUseImportExport) {
      pushToast("CSV import is available on the paid plan only.", "error");
      return;
    }

    try {
      const parsedPeople = await parsePeopleCsv(file);
      if (!isPaidPlan) {
        const remainingSlots = Math.max(FREE_PLAN_PERSON_LIMIT - people.length, 0);
        if (remainingSlots <= 0) {
          pushToast(
            `Free plan supports up to ${FREE_PLAN_PERSON_LIMIT} people.`,
            "error"
          );
          return;
        }

        if (parsedPeople.length > remainingSlots) {
          pushToast(
            `Free plan can import only ${remainingSlots} more people.`,
            "error"
          );
          return;
        }
      }

      await importPeople(parsedPeople);
      await refreshPeople();
      pushToast(`Imported ${parsedPeople.length} people.`, "success");
    } catch {
      pushToast("Could not import that CSV.", "error");
    }
  }

  async function handleExportImages() {
    if (!canUseImportExport) {
      pushToast("Image export is available on the paid plan only.", "error");
      return;
    }

    if (!people.length) {
      pushToast("Add a few people before exporting images.", "error");
      return;
    }

    const zipBlob = await buildImagesZip(people);
    const didSave = await downloadFile(zipBlob, "meetfound-images.zip");
    if (didSave) {
      pushToast("Images ZIP exported.", "success");
    }
  }

  function pushToast(message: string, tone: Toast["tone"]) {
    const id = uuidv4();
    setToasts((current) => [...current, { id, message, tone }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2800);
  }

  function openCreateModal() {
    router.push("/form");
  }

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;
    if (visiblePeopleCount >= people.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        setVisiblePeopleCount((current) =>
          Math.min(current + PEOPLE_BATCH_SIZE, people.length)
        );
      },
      { root: null, rootMargin: "900px 0px", threshold: 0.01 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [people.length, visiblePeopleCount]);

  return (
    <main className="min-h-screen bg-black px-3 py-4 pb-28 sm:px-6 sm:py-6 sm:pb-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b0b] p-5 shadow-[var(--shadow)] sm:rounded-[36px] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.35em] text-accent">
                MeetFound
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Keep every founder conversation within reach.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                A client-only memory CRM for the people you meet. Save contact
                details, profile photos, business cards, and the context that
                helps you remember what matters.
              </p>
              {!isPaidPlan ? (
                <div className="mt-4 inline-flex items-center rounded-full border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200">
                  You are using a free plan
                </div>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard
                label="People saved"
                value={people.length.toString()}
                icon={UserRound}
              />
              <StatCard
                label="Recently added"
                value={recentPeople.length.toString()}
                icon={ArchiveRestore}
              />
              <StatCard
                label="Current plan"
                value={isPaidPlan ? "Paid" : "Free"}
                accent={isPaidPlan}
                icon={Smartphone}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
          <div className="rounded-[28px] border border-line bg-white/5 p-4 shadow-[0_12px_30px_rgba(8,15,29,0.22)] backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Search People</h2>
                <p className="text-sm text-muted">Find specific people using advanced filters</p>
              </div>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 px-4 py-2 text-sm font-medium text-white transition hover:border-accent/40 hover:bg-slate-900"
              >
                <Search className="h-4 w-4" />
                Search
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-line bg-[#0d0d0d] p-4">
            <div className="flex h-full flex-wrap items-center gap-3">
              <ActionButton
                label="Export CSV"
                onClick={handleExportCsv}
                icon={FileSpreadsheet}
                disabled={!canUseImportExport}
              />
              <ActionButton
                label="Export Images ZIP"
                onClick={handleExportImages}
                icon={Download}
                disabled={!canUseImportExport}
              />
              <label
                className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                  canUseImportExport
                    ? "cursor-pointer border-white/10 bg-slate-950/50 text-white hover:border-accent/40 hover:bg-slate-900"
                    : "cursor-not-allowed border-white/8 bg-[#111111] text-slate-500"
                }`}
              >
                <ImageUp className="h-4 w-4" />
                Import CSV
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleImportCsv}
                  disabled={!canUseImportExport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-line bg-[#0d0d0d] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-white">Legal</p>
              <p className="mt-1 text-sm text-muted">
                Review the privacy policy and app terms anytime.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/privacy"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-[#111111] px-4 py-2.5 text-sm font-medium text-white transition hover:border-accent/40 hover:bg-[#161616]"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-[#111111] px-4 py-2.5 text-sm font-medium text-white transition hover:border-accent/40 hover:bg-[#161616]"
              >
                Terms
              </Link>
            </div>
          </div>
        </section>

        {recentPeople.length ? (
          <section className="rounded-[32px] border border-line bg-[#0d0d0d] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Recently added
              </h2>
              <p className="text-sm text-muted">
                Quick re-entry points for your freshest connections.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {recentPeople.map((person) => (
                <PersonCard
                  key={`recent-${person.id}`}
                  person={person}
                  onClick={(clickedPerson) =>
                    router.push(
                      `/view?id=${encodeURIComponent(clickedPerson.id)}`
                    )
                  }
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="rounded-[32px] border border-line bg-[#0d0d0d] p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">People</h2>
            <div className="text-right">
              {!isLoaded ? (
                <p className="text-sm text-muted">Loading from your browser...</p>
              ) : null}
              {!isPaidPlan ? (
                <p className="text-sm font-medium text-slate-300">
                  {people.length}/{FREE_PLAN_PERSON_LIMIT}
                </p>
              ) : null}
            </div>
          </div>

          {people.length ? (
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
            <EmptyState hasPeople={people.length > 0} />
          )}

          {visiblePeopleCount < people.length ? (
            <div className="mt-6">
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-sm text-muted">
                  Showing {visiblePeople.length} of {people.length}
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

      <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 sm:pointer-events-none sm:inset-auto sm:bottom-6 sm:right-6 sm:left-auto sm:px-0 sm:pb-0 sm:pt-0">
        <button
          suppressHydrationWarning
          type="button"
          onClick={openCreateModal}
          disabled={!canAddMorePeople}
          className={`pointer-events-auto flex w-full items-center justify-center gap-2 rounded-[22px] px-5 py-4 text-sm font-semibold transition sm:w-auto sm:rounded-full sm:px-6 sm:py-4 ${
            canAddMorePeople
              ? "bg-accent-strong text-slate-950 shadow-[0_18px_40px_rgba(56,189,248,0.25)] active:scale-[0.99] sm:hover:scale-[1.02] sm:hover:bg-accent"
              : "cursor-not-allowed bg-[#1b1b1b] text-slate-500"
          }`}
        >
          <Plus className="h-4 w-4" />
          {canAddMorePeople ? "Add Person" : "Free Limit Reached"}
        </button>
      </div>

      <ToastViewport toasts={toasts} />
    </main>
  );
}

function EmptyState({ hasPeople }: { hasPeople: boolean }) {
  return (
    <div className="rounded-[28px] border border-dashed border-white/12 bg-[#0a0a0a] px-6 py-12 text-center">
      <p className="text-lg font-medium text-white">
        {hasPeople ? "No matches for that search yet." : "Your founder memory bank starts here."}
      </p>
      <p className="mt-2 text-sm text-muted">
        {hasPeople
          ? "Try a different company, role, or field."
          : "Use Add Person to save the first person you want to remember."}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = false,
  icon: Icon,
}: {
  label: string;
  value: string;
  accent?: boolean;
  icon: typeof UserRound;
}) {
  return (
    <div
      className={`rounded-[24px] border p-4 ${
        accent ? "border-accent/30 bg-accent/10" : "border-white/10 bg-[#111111]"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-accent" />
        <p className="text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  icon: Icon,
  disabled = false,
}: {
  label: string;
  onClick: () => void | Promise<void>;
  icon: typeof Download;
  disabled?: boolean;
}) {
  return (
    <button
      suppressHydrationWarning
      type="button"
      disabled={disabled}
      onClick={() => void onClick()}
      className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
        disabled
          ? "cursor-not-allowed border-white/8 bg-[#111111] text-slate-500"
          : "border-white/10 bg-[#111111] text-white hover:border-accent/40 hover:bg-[#161616]"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function ToastViewport({ toasts }: { toasts: Toast[] }) {
  return (
      <div className="fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${
            toast.tone === "success"
              ? "border-emerald-400/20 bg-emerald-500/15 text-emerald-100"
              : "border-rose-400/20 bg-rose-500/15 text-rose-100"
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

async function downloadFile(blob: Blob, filename: string) {
  const status = await saveBlobAsWithPicker(blob, filename, blob.type);
  if (status === "saved") return true;
  if (status !== "unsupported") return false;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
  return true;
}
