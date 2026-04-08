import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy & Terms",
  description: "MeetFound privacy-first app terms and summary notice.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-[#0b0b0b] p-6 shadow-[var(--shadow)] sm:p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-accent">
          MeetFound
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Privacy & Terms
        </h1>

        <div className="mt-8 space-y-5 text-base leading-7 text-slate-300">
          <p>
            MeetFound is a privacy-first, offline application. We do not
            collect, store, or transmit any personal data to external servers.
          </p>
          <p>
            All information entered into the app, including names, contact
            details, notes, and images, is stored locally on your device and
            remains fully under your control.
          </p>
          <p>
            The app may request access to camera and media storage solely for
            adding profile photos and business card images. This data is never
            shared externally.
          </p>
          <p>
            We do not sell, share, or process user data in any way.
          </p>
          <p>
            Users are responsible for securing their own device and any data
            exported from the app.
          </p>
          <p>
            MeetFound is provided &quot;as is&quot; without warranties of any
            kind. The developer is not liable for any data loss or misuse.
          </p>
          <p>By using this app, you agree to these terms.</p>
        </div>

        <div className="mt-8 rounded-[24px] border border-white/10 bg-[#101010] p-5 text-slate-300">
          <p className="font-medium text-white">Full Privacy Policy</p>
          <p className="mt-2">
            Visit{" "}
            <a
              href="https://meet-found.vercel.app/privacy"
              className="text-accent underline decoration-white/10 underline-offset-4"
            >
              https://meet-found.vercel.app/privacy
            </a>
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link
            href="/"
            className="rounded-full border border-white/10 px-4 py-2 text-white transition hover:border-white/20"
          >
            Back to app
          </Link>
          <Link
            href="/privacy"
            className="rounded-full border border-white/10 px-4 py-2 text-white transition hover:border-white/20"
          >
            View Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}
