"use client";

import { City, Country, State, type ICountry, type IState } from "country-state-city";

export const ROLE_OPTIONS = [
  "Founder",
  "Co-Founder",
  "CEO",
  "CTO",
  "COO",
  "CPO",
  "VP Engineering",
  "Product Manager",
  "Design Lead",
  "Investor",
  "Angel Investor",
  "Advisor",
  "Growth Lead",
  "Marketing Lead",
  "Sales Lead",
  "Operations Lead",
  "Software Engineer",
  "Community Builder",
  "Other",
] as const;

export const FIELD_OPTIONS = [
  "AI",
  "SaaS",
  "Fintech",
  "Healthtech",
  "Edtech",
  "Climate",
  "E-commerce",
  "Consumer",
  "Developer Tools",
  "Robotics",
  "Cybersecurity",
  "Biotech",
  "Marketplaces",
  "Media",
  "Logistics",
  "Deep Tech",
  "Other",
] as const;

export const COMPANY_OPTIONS = [
  "OpenAI",
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "Stripe",
  "NVIDIA",
  "Anthropic",
  "Perplexity",
  "Y Combinator",
  "Sequoia",
  "Accel",
  "Notion",
  "Figma",
  "Canva",
  "Atlassian",
  "HubSpot",
  "Zoho",
  "Other",
] as const;

const countries = Country.getAllCountries().sort((a, b) =>
  a.name.localeCompare(b.name)
);

export function getCountries() {
  return countries;
}

export function getCountryByName(name: string) {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return undefined;

  return countries.find((country) => {
    const countryName = country.name.toLowerCase();
    return (
      countryName === normalized ||
      normalized.startsWith(`${countryName} (`) ||
      normalized.endsWith(` ${countryName}`) ||
      normalized.includes(` ${countryName} (+`)
    );
  });
}

export function getStates(countryCode?: string) {
  if (!countryCode) return [];
  return (State.getStatesOfCountry(countryCode) ?? []).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export function getStateByName(countryCode: string | undefined, name: string) {
  return getStates(countryCode).find(
    (state) => state.name.toLowerCase() === name.trim().toLowerCase()
  );
}

export function getCities(countryCode?: string, stateCode?: string) {
  if (countryCode && stateCode) {
    return (City.getCitiesOfState(countryCode, stateCode) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  if (countryCode) {
    return (City.getCitiesOfCountry(countryCode) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  return [];
}

export function formatCountryOption(country: ICountry) {
  return country.name;
}

export function getCountryPhoneOption(country: ICountry) {
  return `${country.name} (+${country.phonecode})`;
}

export function inferCountryFromPhone(phone: string) {
  const trimmed = phone.trim();
  if (!trimmed.startsWith("+")) return undefined;

  const matches = countries.filter((country) =>
    trimmed.startsWith(`+${country.phonecode}`)
  );

  return matches.sort((a, b) => b.phonecode.length - a.phonecode.length)[0];
}

export function buildPhoneValue(country: ICountry | undefined, localNumber: string) {
  const normalizedNumber = localNumber.trim();
  if (!normalizedNumber) return "";
  if (!country) return normalizedNumber;
  return `+${country.phonecode} ${normalizedNumber}`.trim();
}

export function stripPhoneCountryCode(
  phone: string,
  country: ICountry | undefined
) {
  const trimmed = phone.trim();
  if (!trimmed || !country) return trimmed;
  return trimmed.replace(new RegExp(`^\\+${country.phonecode}\\s*`), "");
}

export function getSuggestedCountry() {
  if (typeof navigator === "undefined") return countries.find((country) => country.isoCode === "US");

  const locale = navigator.language || "en-US";
  const region = locale.split("-")[1]?.toUpperCase();

  return (
    countries.find((country) => country.isoCode === region) ||
    countries.find((country) => country.isoCode === "US")
  );
}

export type GeoCountry = ICountry;
export type GeoState = IState;
