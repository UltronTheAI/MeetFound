"use client";

import Image from "next/image";
import {
  Camera,
  Check,
  ChevronDown,
  Globe,
  MapPinned,
  Phone,
  Search,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  buildPhoneValue,
  COMPANY_OPTIONS,
  FIELD_OPTIONS,
  formatCountryOption,
  getCities,
  getCountries,
  getCountryByName,
  getCountryPhoneOption,
  getStateByName,
  getStates,
  getSuggestedCountry,
  inferCountryFromPhone,
  ROLE_OPTIONS,
  stripPhoneCountryCode,
  type GeoCountry,
} from "@/lib/form-options";
import { readFileAsDataUrl } from "@/lib/image";
import type { Person, PersonInput } from "@/types/person";

type PersonFormProps = {
  initialValue?: Person | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (value: PersonInput) => Promise<void>;
};

type FormState = {
  name: string;
  age: string;
  phoneCountry: string;
  phoneNumber: string;
  email: string;
  company: string;
  role: string;
  field: string;
  country: string;
  state: string;
  city: string;
  description: string;
  website: string;
  profileImage: string;
  businessCardImage: string;
};

const countries = getCountries();

const emptyState = (defaultCountry?: GeoCountry): FormState => ({
  name: "",
  age: "",
  phoneCountry: defaultCountry ? getCountryPhoneOption(defaultCountry) : "",
  phoneNumber: "",
  email: "",
  company: "",
  role: "",
  field: "",
  country: defaultCountry ? formatCountryOption(defaultCountry) : "",
  state: "",
  city: "",
  description: "",
  website: "https://",
  profileImage: "",
  businessCardImage: "",
});

export default function PersonForm({
  initialValue,
  open,
  onClose,
  onSubmit,
}: PersonFormProps) {
  const [form, setForm] = useState<FormState>(emptyState());
  const [isSaving, setIsSaving] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || typeof window === "undefined") return;
    setIsAndroid(/android/i.test(navigator.userAgent));
    setIsMobile(window.matchMedia("(max-width: 767px)").matches);
  }, []);

  useEffect(() => {
    if (!open) return;

    const suggestedCountry = getSuggestedCountry();

    if (initialValue) {
      const matchedCountry =
        getCountryByName(initialValue.country ?? "") ||
        inferCountryFromPhone(initialValue.phone ?? "") ||
        suggestedCountry;

      setForm({
        name: initialValue.name,
        age: initialValue.age?.toString() ?? "",
        phoneCountry: matchedCountry ? getCountryPhoneOption(matchedCountry) : "",
        phoneNumber: stripPhoneCountryCode(initialValue.phone ?? "", matchedCountry),
        email: initialValue.email ?? "",
        company: initialValue.company ?? "",
        role: initialValue.role ?? "",
        field: initialValue.field ?? "",
        country:
          initialValue.country ||
          (matchedCountry ? formatCountryOption(matchedCountry) : ""),
        state: initialValue.state ?? "",
        city: initialValue.city ?? "",
        description: initialValue.description ?? "",
        website: initialValue.website ?? "https://",
        profileImage: initialValue.profileImage ?? "",
        businessCardImage: initialValue.businessCardImage ?? "",
      });
      return;
    }

    setForm(emptyState(suggestedCountry));
  }, [initialValue, open]);

  const selectedCountry = useMemo(
    () =>
      getCountryByName(form.country) || getCountryByName(form.phoneCountry),
    [form.country, form.phoneCountry]
  );

  const availableStates = useMemo(
    () => getStates(selectedCountry?.isoCode),
    [selectedCountry]
  );

  const selectedState = useMemo(
    () => getStateByName(selectedCountry?.isoCode, form.state),
    [form.state, selectedCountry]
  );

  const availableCities = useMemo(
    () => getCities(selectedCountry?.isoCode, selectedState?.isoCode),
    [selectedCountry, selectedState]
  );

  useEffect(() => {
    if (!selectedCountry && (form.state || form.city)) {
      setForm((current) => ({ ...current, state: "", city: "" }));
    }
  }, [form.city, form.state, selectedCountry]);

  if (!open) return null;

  async function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>,
    key: "profileImage" | "businessCardImage"
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const dataUrl = await readFileAsDataUrl(file);
    setForm((current) => ({ ...current, [key]: dataUrl }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) return;

    setIsSaving(true);

    try {
      await onSubmit({
        id: initialValue?.id,
        createdAt: initialValue?.createdAt,
        name: form.name.trim(),
        age: form.age ? Number(form.age) : undefined,
        phone:
          buildPhoneValue(
            getCountryByName(form.phoneCountry) || selectedCountry,
            form.phoneNumber
          ) || undefined,
        email: normalizeOptional(form.email),
        company: normalizeOptional(form.company),
        role: normalizeOptional(form.role),
        field: normalizeOptional(form.field),
        country: normalizeCountryName(form.country),
        state: normalizeOptional(form.state),
        city: normalizeOptional(form.city),
        description: normalizeOptional(form.description),
        website: normalizeWebsite(form.website),
        profileImage: form.profileImage || undefined,
        businessCardImage: form.businessCardImage || undefined,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/75 backdrop-blur-sm md:items-center">
      <div
        className={`form-scrollbar h-dvh w-screen overflow-hidden border border-line border-b-0 border-x-0 bg-[#050505] px-4 pt-5 pb-4 shadow-[var(--shadow)] sm:h-[92vh] sm:max-h-[980px] sm:w-full sm:max-w-5xl sm:rounded-[32px] sm:border sm:p-6 ${
          isAndroid ? "rounded-t-none" : "rounded-t-[90px]"
        }`}
      >
        <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col">
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-accent">
                Founder Memory CRM
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                {initialValue ? "Edit person" : "Add a new contact"}
              </h2>
              <p className="mt-2 text-sm text-muted">
                Faster on mobile, searchable lists, and camera-ready for profile and business card photos.
              </p>
            </div>
            <button
              suppressHydrationWarning
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-muted transition hover:border-white/20 hover:text-white"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="form-scrollbar min-h-0 flex-1 space-y-6 overflow-y-auto pr-1 sm:pr-2"
          >
            <section className="grid gap-4 lg:grid-cols-2">
              <Field
                label="Full name*"
                value={form.name}
                onChange={(value) =>
                  setForm((current) => ({ ...current, name: value }))
                }
                placeholder="Jane Founder"
              />
              <Field
                label="Age"
                type="number"
                value={form.age}
                onChange={(value) =>
                  setForm((current) => ({ ...current, age: value }))
                }
                placeholder="32"
              />
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <ChoiceField
                icon={Search}
                label="Role"
                value={form.role}
                onChange={(value) =>
                  setForm((current) => ({ ...current, role: value }))
                }
                options={ROLE_OPTIONS}
                placeholder="Search a role or type your own"
              />
              <ChoiceField
                icon={Search}
                label="Company"
                value={form.company}
                onChange={(value) =>
                  setForm((current) => ({ ...current, company: value }))
                }
                options={COMPANY_OPTIONS}
                placeholder="Search a company or type your own"
              />
              <ChoiceField
                icon={Search}
                label="Field"
                value={form.field}
                onChange={(value) =>
                  setForm((current) => ({ ...current, field: value }))
                }
                options={FIELD_OPTIONS}
                placeholder="Search a field or type your own"
              />
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) =>
                  setForm((current) => ({ ...current, email: value }))
                }
                placeholder="name@company.com"
              />
            </section>

            <section className="grid gap-4 lg:grid-cols-[1.05fr_1.35fr]">
              <ChoiceField
                icon={Phone}
                label="Phone country"
                value={form.phoneCountry}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    phoneCountry: value,
                    country: current.country || value,
                  }))
                }
                options={countries.map(getCountryPhoneOption)}
                placeholder="Search country code"
              />
              <Field
                label="Phone number"
                type="tel"
                value={form.phoneNumber}
                onChange={(value) =>
                  setForm((current) => ({ ...current, phoneNumber: value }))
                }
                placeholder="98765 43210"
                inputMode="tel"
              />
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
              <ChoiceField
                icon={MapPinned}
                label="Country"
                value={form.country}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    country: value,
                    state: "",
                    city: "",
                  }))
                }
                options={countries.map(formatCountryOption)}
                placeholder="Search country"
              />
              <ChoiceField
                icon={MapPinned}
                label="State"
                value={form.state}
                onChange={(value) =>
                  setForm((current) => ({ ...current, state: value, city: "" }))
                }
                options={availableStates.map((state) => state.name)}
                placeholder={
                  selectedCountry ? "Search state" : "Pick a country first"
                }
                disabled={!selectedCountry}
              />
              <ChoiceField
                icon={MapPinned}
                label="City"
                value={form.city}
                onChange={(value) =>
                  setForm((current) => ({ ...current, city: value }))
                }
                options={availableCities.map((city) => city.name)}
                placeholder={
                  selectedCountry ? "Search city" : "Pick a country first"
                }
                disabled={!selectedCountry}
              />
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <Field
                label="Website"
                value={form.website}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    website:
                      value === "" || value.startsWith("http")
                        ? value
                        : `https://${value.replace(/^https?:\/\//, "")}`,
                  }))
                }
                placeholder="https://company.com"
                icon={Globe}
              />
              <div className="rounded-[24px] border border-white/10 bg-[#101010] px-4 py-3 text-sm text-muted">
                <p className="font-medium text-white">Quick mobile tips</p>
                <p className="mt-1 leading-6">
                  On Android, this form opens full-screen. Use the camera buttons below to capture a person or business card without leaving the form.
                </p>
              </div>
            </section>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">
                Description / notes
              </span>
              <textarea
                suppressHydrationWarning
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={6}
                className="w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-4 py-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-accent/50"
                placeholder="How you met, what stood out, what to follow up on, and any memory triggers."
              />
            </label>

            <section className="grid gap-4 lg:grid-cols-2">
              <ImageField
                label="Profile photo"
                value={form.profileImage}
                onUpload={(event) => handleImageChange(event, "profileImage")}
                onCamera={(event) => handleImageChange(event, "profileImage")}
                onClear={() =>
                  setForm((current) => ({ ...current, profileImage: "" }))
                }
                cameraMode="user"
                showCameraButton={isMobile}
              />
              <ImageField
                label="Business card"
                value={form.businessCardImage}
                onUpload={(event) =>
                  handleImageChange(event, "businessCardImage")
                }
                onCamera={(event) =>
                  handleImageChange(event, "businessCardImage")
                }
                onClear={() =>
                  setForm((current) => ({
                    ...current,
                    businessCardImage: "",
                  }))
                }
                cameraMode="environment"
                showCameraButton={isMobile}
              />
            </section>

            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-white/10 bg-[#050505]/95 pt-4 pb-[max(env(safe-area-inset-bottom),0px)] sm:flex-row sm:justify-end">
              <button
                suppressHydrationWarning
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-muted transition hover:border-white/20 hover:text-white"
              >
                Cancel
              </button>
              <button
                suppressHydrationWarning
                type="submit"
                disabled={isSaving}
                className="rounded-full bg-accent-strong px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving
                  ? "Saving..."
                  : initialValue
                    ? "Save changes"
                    : "Create person"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  icon: Icon,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  icon?: typeof Globe;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <div className="relative">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        ) : null}
        <input
          suppressHydrationWarning
          type={type}
          value={value}
          inputMode={inputMode}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-4 py-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-accent/50 ${
            Icon ? "pl-11" : ""
          }`}
        />
      </div>
    </label>
  );
}

function ChoiceField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[] | string[];
  placeholder: string;
  disabled?: boolean;
  icon: typeof Search;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    const normalized = value.trim().toLowerCase();
    const base = normalized
      ? options.filter((option) => option.toLowerCase().includes(normalized))
      : [...options];

    return base.slice(0, 8);
  }, [options, value]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <div ref={wrapperRef} className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          suppressHydrationWarning
          value={value}
          disabled={disabled}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-11 py-3 pr-11 text-sm outline-none transition placeholder:text-slate-500 focus:border-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {isOpen && !disabled ? (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#080808] shadow-[0_18px_45px_rgba(0,0,0,0.45)]">
            <div className="border-b border-white/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted">
              Search results
            </div>
            <div className="form-scrollbar max-h-56 overflow-y-auto p-2">
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
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-white transition hover:bg-white/8"
                  >
                    <span>{option}</span>
                    {value.trim().toLowerCase() === option.toLowerCase() ? (
                      <Check className="h-4 w-4 text-accent" />
                    ) : null}
                  </button>
                ))
              ) : (
                <div className="rounded-xl px-3 py-2 text-sm text-muted">
                  Keep typing to use a custom value.
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </label>
  );
}

function ImageField({
  label,
  value,
  onUpload,
  onCamera,
  onClear,
  cameraMode,
  showCameraButton,
}: {
  label: string;
  value: string;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCamera: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  cameraMode: "user" | "environment";
  showCameraButton: boolean;
}) {
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-[28px] border border-white/10 bg-[#101010] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-200">{label}</span>
        {value ? (
          <button
            suppressHydrationWarning
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-rose-300 transition hover:text-rose-200"
          >
            Remove
          </button>
        ) : null}
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-dashed border-white/15 bg-[#0b0b0b] p-4">
        <div className="flex flex-wrap gap-2">
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => uploadRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-accent/40"
          >
            <Upload className="h-4 w-4" />
            Upload
          </button>
          {showCameraButton ? (
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-accent/40"
            >
              <Camera className="h-4 w-4" />
              Camera
            </button>
          ) : null}
        </div>

        <input
          suppressHydrationWarning
          ref={uploadRef}
          type="file"
          accept="image/*"
          onChange={onUpload}
          className="hidden"
        />
        <input
          suppressHydrationWarning
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture={cameraMode}
          onChange={onCamera}
          className="hidden"
        />

        {value ? (
          <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
            <Image
              src={value}
              alt={label}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">
            Upload from files or capture directly with the camera.
          </p>
        )}
      </div>
    </div>
  );
}

function normalizeOptional(value: string) {
  return value.trim() || undefined;
}

function normalizeCountryName(value: string) {
  const country = getCountryByName(value);
  return country?.name || normalizeOptional(value);
}

function normalizeWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "https://") return undefined;
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed;
  }
  return `https://${trimmed.replace(/^\/+/, "")}`;
}
