"use client";

import { Search } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  total: number;
  filtered: number;
};

export default function SearchBar({
  value,
  onChange,
  total,
  filtered,
}: SearchBarProps) {
  return (
    <div className="rounded-[28px] border border-line bg-white/5 p-4 shadow-[0_12px_30px_rgba(8,15,29,0.22)] backdrop-blur">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            suppressHydrationWarning
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Name, company, role, field, country, state, or city"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-slate-500"
          />
        </label>
        <div className="text-sm text-muted">
          Showing <span className="font-semibold text-foreground">{filtered}</span>{" "}
          of <span className="font-semibold text-foreground">{total}</span>
        </div>
      </div>
    </div>
  );
}
