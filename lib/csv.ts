"use client";

import JSZip from "jszip";
import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";

import { dataUrlToBlob, slugifyFilePart } from "@/lib/image";
import type { Person, PersonInput } from "@/types/person";

const PERSON_FIELDS: Array<keyof Person> = [
  "id",
  "name",
  "age",
  "phone",
  "email",
  "company",
  "role",
  "field",
  "country",
  "state",
  "city",
  "description",
  "website",
  "profileImage",
  "businessCardImage",
  "createdAt",
];

export function exportPeopleToCsv(people: Person[]) {
  return Papa.unparse(
    people.map((person) => ({
      ...person,
      age: person.age ?? "",
      createdAt: person.createdAt,
    })),
    { columns: PERSON_FIELDS }
  );
}

export function parsePeopleCsv(file: File) {
  return new Promise<PersonInput[]>((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        try {
          const people = results.data
            .map((row) => normalizeRow(row))
            .filter((person) => Boolean(person.name));

          resolve(people);
        } catch (error) {
          reject(error);
        }
      },
      error(error) {
        reject(error);
      },
    });
  });
}

function normalizeRow(row: Record<string, string>): PersonInput {
  const getValue = (key: keyof Person) => row[key]?.trim() ?? "";
  const ageValue = getValue("age");
  const createdAtValue = getValue("createdAt");

  return {
    id: getValue("id") || uuidv4(),
    name: getValue("name"),
    age: ageValue ? Number(ageValue) : undefined,
    phone: getValue("phone") || undefined,
    email: getValue("email") || undefined,
    company: getValue("company") || undefined,
    role: getValue("role") || undefined,
    field: getValue("field") || undefined,
    country: getValue("country") || undefined,
    state: getValue("state") || undefined,
    city: getValue("city") || undefined,
    description: getValue("description") || undefined,
    website: getValue("website") || undefined,
    profileImage: getValue("profileImage") || undefined,
    businessCardImage: getValue("businessCardImage") || undefined,
    createdAt: createdAtValue ? Number(createdAtValue) : Date.now(),
  } satisfies PersonInput;
}

export async function buildImagesZip(people: Person[]) {
  const zip = new JSZip();

  for (const person of people) {
    const baseName = `${slugifyFilePart(person.name)}-${person.id}`;

    if (person.profileImage?.startsWith("data:")) {
      zip.file(
        `${baseName}/profile.${extensionFromDataUrl(person.profileImage)}`,
        dataUrlToBlob(person.profileImage)
      );
    }

    if (person.businessCardImage?.startsWith("data:")) {
      zip.file(
        `${baseName}/business-card.${extensionFromDataUrl(
          person.businessCardImage
        )}`,
        dataUrlToBlob(person.businessCardImage)
      );
    }
  }

  return zip.generateAsync({ type: "blob" });
}

function extensionFromDataUrl(dataUrl: string) {
  if (dataUrl.startsWith("data:image/png")) return "png";
  if (dataUrl.startsWith("data:image/webp")) return "webp";
  if (dataUrl.startsWith("data:image/gif")) return "gif";
  return "jpg";
}
