import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "MeetFound privacy policy and local-data handling details.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-[#0b0b0b] p-6 shadow-[var(--shadow)] sm:p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-accent">
          MeetFound
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-muted">
          Effective Date: 2026
        </p>
        <p className="mt-6 text-base leading-7 text-slate-300">
          MeetFound (&quot;we&quot;, &quot;our&quot;, or &quot;the app&quot;) is developed by Swaraj
          Puppalwar under Lioran Group. This Privacy Policy explains how
          MeetFound handles user data.
        </p>

        <div className="mt-10 space-y-8">
          <Section title="1. Overview">
            <p>
              MeetFound is a fully offline, privacy-first application designed
              to help users store and recall information about people they meet.
            </p>
            <p>
              We are committed to protecting your privacy. We do not collect,
              store, or transmit any personal data to external servers.
            </p>
          </Section>

          <Section title="2. Data Collection">
            <p>MeetFound does not collect any personal data from users.</p>
            <p>All data entered into the app, including:</p>
            <BulletList
              items={[
                "Names",
                "Contact details",
                "Notes",
                "Images such as profile photos and business cards",
              ]}
            />
            <p>is stored locally on your device only.</p>
          </Section>

          <Section title="3. Data Storage">
            <BulletList
              items={[
                "All data is stored using local device storage such as IndexedDB or device storage.",
                "No data is uploaded to the cloud.",
                "No third-party servers are used.",
              ]}
            />
          </Section>

          <Section title="4. Permissions">
            <p className="font-medium text-white">Camera / Photos / Media</p>
            <p>Used only to:</p>
            <BulletList
              items={[
                "Capture or upload profile images",
                "Save business card images",
              ]}
            />
            <p>These files are stored locally and never shared externally.</p>
          </Section>

          <Section title="5. Data Sharing">
            <p>We do not:</p>
            <BulletList
              items={[
                "Sell your data",
                "Share your data",
                "Transfer your data to third parties",
              ]}
            />
            <p>Your data remains fully under your control.</p>
          </Section>

          <Section title="6. Data Export">
            <p>
              The app allows you to export your data such as CSV files or
              images. This action is fully controlled by the user.
            </p>
            <p>
              We are not responsible for how exported data is used outside the
              app.
            </p>
          </Section>

          <Section title="7. Security">
            <p>Since all data is stored locally:</p>
            <BulletList
              items={[
                "You are responsible for securing your device",
                "We recommend using device-level security such as a PIN, fingerprint, or equivalent protection",
              ]}
            />
          </Section>

          <Section title="8. Children&apos;s Privacy">
            <p>
              MeetFound does not knowingly collect any data from children under
              13. Since no data is collected or transmitted, the app is safe for
              general use.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Any changes
              will be reflected with an updated Effective Date.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>If you have any questions, you can contact:</p>
            <div className="mt-3 rounded-2xl border border-white/10 bg-[#101010] p-4 text-slate-300">
              <p className="font-medium text-white">Swaraj Puppalwar</p>
              <p>Lioran Group</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:contact@lioran.group"
                  className="text-accent underline decoration-white/10 underline-offset-4"
                >
                  contact@lioran.group
                </a>
              </p>
            </div>
          </Section>

          <Section title="11. Consent">
            <p>By using MeetFound, you agree to this Privacy Policy.</p>
          </Section>
        </div>

        <div className="mt-10 rounded-[24px] border border-white/10 bg-[#101010] p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-accent">
            Summary
          </p>
          <p className="mt-3 text-base leading-7 text-slate-300">
            MeetFound is built to be private by design. Your data stays on your
            device, always.
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
            href="/terms"
            className="rounded-full border border-white/10 px-4 py-2 text-white transition hover:border-white/20"
          >
            View Terms
          </Link>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <div className="mt-3 space-y-3 text-base leading-7 text-slate-300">
        {children}
      </div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-6">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
