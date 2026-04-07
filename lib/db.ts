"use client";

import { openDB } from "idb";

import type { Person, PersonInput } from "@/types/person";

const DB_NAME = "meetfound-db";
const STORE_NAME = "people";
const DB_VERSION = 1;

let dbPromise: ReturnType<typeof openDB> | null = null;

function getDb() {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser.");
  }

  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("createdAt", "createdAt");
          store.createIndex("name", "name");
        }
      },
    });
  }

  return dbPromise;
}

export async function savePerson(person: Person) {
  const db = await getDb();
  await db.put(STORE_NAME, person);
}

export async function updatePerson(person: Person) {
  await savePerson(person);
}

export async function getAllPeople() {
  const db = await getDb();
  const people = (await db.getAll(STORE_NAME)) as Person[];
  return people.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deletePerson(id: string) {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}

export async function importPeople(people: PersonInput[]) {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, "readwrite");

  for (const person of people) {
    await tx.store.put(person as Person);
  }

  await tx.done;
}
