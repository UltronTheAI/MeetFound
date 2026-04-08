"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArchiveRestore,
  Building2,
  Download,
  FileSpreadsheet,
  Globe,
  ImageUp,
  MapPin,
  Mail,
  Maximize2,
  PencilLine,
  Plus,
  RotateCcw,
  Smartphone,
  Trash2,
  UserRound,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import PersonCard from "@/components/PersonCard";
import PersonForm from "@/components/PersonForm";
import SearchBar from "@/components/SearchBar";
import { appPlan, FREE_PLAN_PERSON_LIMIT } from "@/config/plan";
import { buildImagesZip, exportPeopleToCsv, parsePeopleCsv } from "@/lib/csv";
import { saveBlobAsWithPicker } from "@/lib/saveAs";
import {
  deletePerson,
  getAllPeople,
  importPeople,
  savePerson,
  updatePerson,
} from "@/lib/db";
import type { Person, PersonInput } from "@/types/person";

type Toast = {
  id: string;
  message: string;
  tone: "success" | "error";
};

const SEARCH_DELAY = 220;

function getCurrentTimestamp() {
  return Date.now();
}

export default function FounderMemoryApp() {
  const [people, setPeople] = useState<Person[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
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

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim().toLowerCase());
    }, SEARCH_DELAY);

    return () => window.clearTimeout(timer);
  }, [search]);

  const filteredPeople = useMemo(() => {
    if (!debouncedSearch) return people;

    return people.filter((person) => {
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

      return haystack.includes(debouncedSearch);
    });
  }, [debouncedSearch, people]);

  const recentPeople = useMemo(() => people.slice(0, 3), [people]);

  async function handleSavePerson(input: PersonInput) {
    if (!input.id && !canAddMorePeople) {
      pushToast(
        `Free plan supports up to ${FREE_PLAN_PERSON_LIMIT} people.`,
        "error"
      );
      return;
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
      pushToast("Person updated.", "success");
    } else {
      await savePerson(person);
      pushToast("Person added.", "success");
    }

    await refreshPeople();
    setIsFormOpen(false);
    setEditingPerson(null);
    setSelectedPerson(person);
  }

  async function handleDeletePerson(id: string) {
    await deletePerson(id);
    await refreshPeople();
    setSelectedPerson((current) => (current?.id === id ? null : current));
    pushToast("Person deleted.", "success");
  }

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
    setEditingPerson(null);
    setIsFormOpen(true);
  }

  function openEditModal(person: Person) {
    setEditingPerson(person);
    setSelectedPerson(null);
    setIsFormOpen(true);
  }

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
          <SearchBar
            value={search}
            onChange={setSearch}
            total={people.length}
            filtered={filteredPeople.length}
          />

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
                  onClick={setSelectedPerson}
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

          {filteredPeople.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredPeople.map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  onClick={setSelectedPerson}
                />
              ))}
            </div>
          ) : (
            <EmptyState hasPeople={people.length > 0} />
          )}
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

      <PersonForm
        open={isFormOpen}
        initialValue={editingPerson}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPerson(null);
        }}
        onSubmit={handleSavePerson}
      />

      {selectedPerson ? (
        <DetailModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          onEdit={() => openEditModal(selectedPerson)}
          onDelete={() => void handleDeletePerson(selectedPerson.id)}
        />
      ) : null}

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

function DetailModal({
  person,
  onClose,
  onEdit,
  onDelete,
}: {
  person: Person;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [viewerImage, setViewerImage] = useState<{
    src: string;
    title: string;
  } | null>(null);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/75 p-0 sm:items-center sm:p-4 backdrop-blur-sm">
        <div className="relative max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-t-[28px] border border-line bg-[#0b0b0b] shadow-[var(--shadow)] sm:rounded-[32px]">
          <button
            suppressHydrationWarning
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#111111]/95 text-muted transition hover:border-white/20 hover:text-white sm:right-5 sm:top-5"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="grid gap-0 lg:grid-cols-[1.1fr_1fr]">
            <div className="bg-[#080808] px-5 pt-18 pb-5 sm:p-5 sm:pt-20">
              <div className="grid gap-4 sm:grid-cols-2">
                <ImagePanel
                  title="Profile"
                  src={person.profileImage}
                  fallback={person.name}
                  onOpen={(src) => setViewerImage({ src, title: `${person.name} profile photo` })}
                />
                <ImagePanel
                  title="Business card"
                  src={person.businessCardImage}
                  fallback="Card"
                  onOpen={(src) => setViewerImage({ src, title: `${person.name} business card` })}
                />
              </div>
            </div>
            <div className="p-5 pt-8 sm:p-6 sm:pt-16">
              <div className="flex items-start gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-accent">
                    {person.field || "Founder profile"}
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">
                    {person.name}
                  </h2>
                  <p className="mt-2 text-base text-slate-300">
                    {person.role || "Role not saved"}
                    {person.company ? ` at ${person.company}` : ""}
                  </p>
                </div>
              </div>

              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <Info label="Phone" value={person.phone} icon={Smartphone} />
                <Info label="Email" value={person.email} icon={Mail} />
                <Info label="Website" value={person.website} icon={Globe} />
                <Info label="Age" value={person.age?.toString()} />
                <Info
                  label="Added"
                  value={new Date(person.createdAt).toLocaleDateString()}
                />
                <Info label="Field" value={person.field} icon={Building2} />
                <Info
                  label="Location"
                  value={[person.city, person.state, person.country].filter(Boolean).join(", ")}
                  icon={MapPin}
                />
              </dl>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-[#101010] p-4">
                <p className="text-sm font-medium text-white">Notes</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {person.description || "No notes saved yet."}
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={onEdit}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-strong px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accent"
                >
                  <PencilLine className="h-4 w-4" />
                  Edit
                </button>
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={onDelete}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/15"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {viewerImage ? (
        <FullscreenImageViewer
          src={viewerImage.src}
          title={viewerImage.title}
          onClose={() => setViewerImage(null)}
        />
      ) : null}
    </>
  );
}

function ImagePanel({
  title,
  src,
  fallback,
  onOpen,
}: {
  title: string;
  src?: string;
  fallback: string;
  onOpen: (src: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-900/80">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-sm font-medium text-white">
        <span>{title}</span>
        {src ? (
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => onOpen(src)}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            View
          </button>
        ) : null}
      </div>
      <div className="flex aspect-[4/3] items-center justify-center bg-slate-950">
        {src ? (
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => onOpen(src)}
            className="relative h-full w-full cursor-zoom-in"
          >
            <Image
              src={src}
              alt={title}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </button>
        ) : (
          <span className="text-xl font-semibold text-white/50">{fallback}</span>
        )}
      </div>
    </div>
  );
}

function FullscreenImageViewer({
  src,
  title,
  onClose,
}: {
  src: string;
  title: string;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function zoomIn() {
    setZoom((current) => Math.min(current + 0.25, 4));
  }

  function zoomOut() {
    setZoom((current) => Math.max(current - 0.25, 0.5));
  }

  function resetZoom() {
    setZoom(1);
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-sm">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm font-medium text-white">{title}</p>
            <p className="text-xs text-muted">Click or tap outside the image to close.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              suppressHydrationWarning
              type="button"
              onClick={zoomOut}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#111111] text-white transition hover:border-white/20"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              suppressHydrationWarning
              type="button"
              onClick={resetZoom}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#111111] text-white transition hover:border-white/20"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              suppressHydrationWarning
              type="button"
              onClick={zoomIn}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#111111] text-white transition hover:border-white/20"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              suppressHydrationWarning
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#111111] text-white transition hover:border-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <button
          suppressHydrationWarning
          type="button"
          onClick={onClose}
          className="flex-1 overflow-auto p-4 text-left sm:p-6"
        >
          <div className="flex min-h-full items-center justify-center">
            <div
              className="relative transition-transform duration-200 ease-out"
              style={{ transform: `scale(${zoom})` }}
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={src}
                alt={title}
                width={1600}
                height={1200}
                unoptimized
                className="max-h-[78vh] w-auto max-w-[92vw] rounded-[20px] object-contain"
              />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string;
  icon?: typeof MapPin;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
      <dt className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted">
        {Icon ? <Icon className="h-3.5 w-3.5 text-accent" /> : null}
        {label}
      </dt>
      <dd className="mt-2 text-sm text-white">{value || "Not saved"}</dd>
    </div>
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
