# MeetFound

MeetFound is a stateless, client-only Founder Memory CRM built with Next.js App Router, TypeScript, and Tailwind CSS.

It helps you save and recall people you meet, including their contact details, company, role, location, notes, profile photo, and business card image. Everything is stored in the browser using IndexedDB. There is no backend, no API, and no database server.

## Features

- Add, edit, and delete people
- Store profile photos and business card images locally
- Capture images from camera on mobile
- Search by name, company, role, field, country, state, and city
- Searchable option pickers for country, state, city, role, company, and field
- Custom values allowed alongside predefined options
- Fullscreen image viewer with zoom controls for saved photos and cards
- CSV import/export
- ZIP export for saved images
- Mobile-first full-screen form experience
- Offline-friendly browser storage with IndexedDB

## Tech Stack

- Next.js 16.2.2
- React 19
- TypeScript
- Tailwind CSS 4
- `idb` for IndexedDB access
- `papaparse` for CSV import/export
- `jszip` for image ZIP export
- `uuid` for ID generation
- `country-state-city` for offline geo lists
- `lucide-react` for icons

## Local Storage Model

People are stored in IndexedDB inside the browser. Images are stored as data URLs with each person record.

Current saved fields include:

- `name`
- `age`
- `phone`
- `email`
- `company`
- `role`
- `field`
- `country`
- `state`
- `city`
- `description`
- `website`
- `profileImage`
- `businessCardImage`
- `createdAt`

## Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```

## LAN Development

This project allows local development access from:

- `192.168.1.2`

Configured in [next.config.ts](/c:/Users/Omen/Downloads/projects/meetfound/next.config.ts).

If you change `allowedDevOrigins`, restart the dev server.

## Project Structure

```text
app/
  globals.css
  layout.tsx
  page.tsx
components/
  FounderMemoryApp.tsx
  PersonCard.tsx
  PersonForm.tsx
  SearchBar.tsx
lib/
  csv.ts
  db.ts
  form-options.ts
  image.ts
types/
  person.ts
```

## Notes

- This app is intentionally client-only.
- Data is device/browser specific unless exported and imported manually.
- Camera capture is shown on phone-sized screens and hidden on desktop.
- Country names are shown in the country picker, while dialing codes are shown only in the phone-country picker.
