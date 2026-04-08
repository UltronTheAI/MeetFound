"use client";

import Image from "next/image";
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  Maximize2,
  PencilLine,
  RotateCcw,
  Smartphone,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { Person } from "@/types/person";

export default function PersonDetailModal({
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
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/75 p-0 backdrop-blur-sm sm:items-center sm:p-4">
        <div className="detail-scrollbar relative max-h-[95vh] w-full max-w-4xl overflow-y-auto overflow-x-hidden rounded-t-[28px] border border-line bg-[#0b0b0b] shadow-[var(--shadow)] sm:rounded-[32px]">
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
                  onOpen={(src) =>
                    setViewerImage({ src, title: `${person.name} profile photo` })
                  }
                />
                <ImagePanel
                  title="Business card"
                  src={person.businessCardImage}
                  fallback="Card"
                  onOpen={(src) =>
                    setViewerImage({ src, title: `${person.name} business card` })
                  }
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
                  value={[person.city, person.state, person.country]
                    .filter(Boolean)
                    .join(", ")}
                  icon={MapPin}
                />
              </dl>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-[#101010] p-4">
                <p className="text-sm font-medium text-white">Notes</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {person.description || "No notes saved yet."}
                </p>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={onEdit}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent-strong px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accent"
                >
                  <PencilLine className="h-4 w-4" />
                  Edit
                </button>
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={onDelete}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/15"
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
            <p className="text-xs text-muted">
              Click or tap outside the image to close.
            </p>
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
          className="detail-scrollbar flex-1 overflow-y-auto overflow-x-hidden p-4 text-left sm:p-6"
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
