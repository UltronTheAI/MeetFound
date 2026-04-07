# MeetFound

MeetFound is a stateless, client-only Founder Memory CRM built with Next.js App Router, TypeScript, and Tailwind CSS.

It helps users save and remember the people they meet, including notes, company, role, location, profile photo, and business card image. All data stays in the browser through IndexedDB. There is no backend, no API, and no remote database.

## Highlights

- Client-only app with browser persistence
- Founder/contact memory CRM workflow
- Add, edit, delete, and search people
- Mobile-friendly form flow
- Camera capture on mobile for photos and business cards
- Fullscreen image viewer with zoom controls
- Searchable country, state, city, company, role, and field pickers
- CSV import/export and image ZIP export
- Local plan gating for free vs paid builds

## Features

- Add, edit, and delete people
- Save profile photos and business card images
- Search by name, company, role, field, country, state, and city
- Use searchable dropdowns with custom typing support
- Open images in fullscreen and zoom in/out/reset
- Export people to CSV
- Import people from CSV
- Export saved images as ZIP
- Offline-friendly storage with IndexedDB

## Plan System

Plan behavior is controlled locally from [config/plan.ts](/c:/Users/Omen/Downloads/projects/meetfound/config/plan.ts).

Current supported shape:

```ts
export const appPlan = {
  isPaid: false,
} as const;
```

### Free Plan

- Default mode
- Maximum `30` people
- CSV import disabled
- CSV export disabled
- Image ZIP export disabled

### Paid Plan

- Unlimited people
- CSV import enabled
- CSV export enabled
- Image ZIP export enabled

The client cannot toggle the plan from the UI. It is controlled by the app build configuration.

## Tech Stack

- Next.js 16.2.2
- React 19
- TypeScript
- Tailwind CSS 4
- `idb`
- `papaparse`
- `jszip`
- `uuid`
- `country-state-city`
- `lucide-react`
- Capacitor Android integration files are present in the repo

## Storage Model

People are stored in IndexedDB inside the browser. Images are stored as data URLs in the person record.

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

Run lint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

## LAN Development

The current Next dev config allows:

- `192.168.1.2`

This is configured in [next.config.ts](/c:/Users/Omen/Downloads/projects/meetfound/next.config.ts). Restart the dev server after changing `allowedDevOrigins`.

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
config/
  plan.ts
lib/
  csv.ts
  db.ts
  form-options.ts
  image.ts
types/
  person.ts
public/
  smp.jpg
  logo.png
```

## Docs

- Contribution guide: [CONTRIBUTING.md](/c:/Users/Omen/Downloads/projects/meetfound/CONTRIBUTING.md)
- Contributors list: [CONTRIBUTORS.md](/c:/Users/Omen/Downloads/projects/meetfound/CONTRIBUTORS.md)
- License: [LICENSE.md](/c:/Users/Omen/Downloads/projects/meetfound/LICENSE.md)

## License

MeetFound uses a custom license with personal, non-commercial usage terms. Read [LICENSE.md](/c:/Users/Omen/Downloads/projects/meetfound/LICENSE.md) before using, modifying, redistributing, or deploying the software.

## Notes

- This app is intentionally client-only.
- Data is browser/device specific unless exported manually.
- Camera capture is shown on phone-sized screens and hidden on desktop.
- Country names are shown in the country picker, while dialing codes are shown only in the phone-country picker.
- Some Android-generated asset folders may need to be excluded from linting depending on your local workflow.
