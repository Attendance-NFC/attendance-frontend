import { Link } from "react-router-dom";
import type { ReactNode } from "react";

// Mock counts — replace with real queries against the Users/Cards tables later.
const stats = [
  { label: "Total users", value: "1,340" },
  { label: "Active cards", value: "1,284" },
  { label: "Suspended cards", value: "19" },
  { label: "Expired or revoked", value: "37" },
];

const navItems: {
  to: string;
  title: string;
  description: string;
}[] = [
  {
    to: "/admin/users",
    title: "Users",
    description: "View and search everyone with a card, and drill into details.",
  },
  {
    to: "/admin/users/new",
    title: "Create user",
    description: "Add a new person and issue them a card.",
  },
];

export default function adminDashboard() {
  return (
    <div
      className="min-h-screen bg-[#12151C] text-[#E8EAEF]"
      style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
    >
      <header className="flex items-center justify-between border-b border-[#2A2F3B] px-6 py-4">
        <h1
          className="text-lg font-medium tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Access Console
        </h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[#8B93A7]">Admin</span>
          <button className="text-[#8B93A7] underline decoration-[#2A2F3B] underline-offset-4 hover:text-[#E8EAEF]">
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Stats row */}
        <section className="mb-8 grid grid-cols-2 gap-px border border-[#2A2F3B] bg-[#2A2F3B] sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#1B1F29] p-5">
              <p
                className="text-2xl font-medium"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {s.value}
              </p>
              <p className="mt-1 text-sm text-[#8B93A7]">{s.label}</p>
            </div>
          ))}
        </section>

        {/* Navigation */}
        <h2 className="mb-4 text-sm text-[#8B93A7]">Manage</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {navItems.map((item) => (
            <NavCard key={item.to} {...item} />
          ))}
        </div>
      </main>
    </div>
  );
}

function NavCard({
  to,
  title,
  description,
}: {
  to: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="group block border border-[#2A2F3B] bg-[#1B1F29] p-6 transition-colors hover:border-[#E8A33D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8A33D]"
    >
      <div className="flex items-center justify-between">
        <h3
          className="font-medium"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {title}
        </h3>
        <ArrowIcon />
      </div>
      <p className="mt-1.5 text-sm text-[#8B93A7]">{description}</p>
    </Link>
  );
}

function ArrowIcon(): ReactNode {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="text-[#4A5163] transition-colors group-hover:text-[#E8A33D]"
    >
      <path
        d="M4 12L12 4M12 4H6M12 4V10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}