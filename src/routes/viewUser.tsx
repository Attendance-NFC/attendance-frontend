import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAuthToken } from "../auth/authToken";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type CardStatus = "Active" | "Suspended" | "Expired" | "Revoked";

type UserProfile = {
  user: {
    user_id: string;
    name: string;
    email: string;
    role: "admin" | "teacher" | "student";
    status: "active" | "inactive";
  };
  card: {
    card_id: string;
    status: CardStatus;
  } | null;
  classrooms: {
    classroom_id: string;
    class_name: string;
    room_id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
  }[];
};

const dayLabels: Record<string, string> = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
};

const cardStatusStyles: Record<CardStatus, string> = {
  Active: "border-[#3E7A5C] text-[#7FD1A3]",
  Suspended: "border-[#E8A33D] text-[#E8A33D]",
  Expired: "border-[#8B93A7] text-[#8B93A7]",
  Revoked: "border-[#E8756A] text-[#E8756A]",
};

export default function ViewUser() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      setIsLoading(true);
      setError("");
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/admin/users/${userId}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load user");
        }

        const data = (await response.json()) as UserProfile;
        if (!cancelled) setProfile(data);
      } catch {
        if (!cancelled) setError("Couldn't load this user. Try refreshing the page.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    if (userId) fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div
      className="min-h-screen bg-[#12151C] text-[#E8EAEF]"
      style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
    >
      <header className="flex items-center gap-3 border-b border-[#2A2F3B] px-6 py-4">
        <Link
          to="/admin/users"
          className="text-sm text-[#8B93A7] hover:text-[#E8EAEF]"
          aria-label="Back to users"
        >
          ← Back
        </Link>
        <h1
          className="text-lg font-medium tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          User details
        </h1>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        {isLoading && <p className="text-sm text-[#8B93A7]">Loading…</p>}

        {!isLoading && error && (
          <p className="text-sm text-[#E8756A]">{error}</p>
        )}

        {!isLoading && !error && profile && (
          <div className="space-y-6">
            <section className="border border-[#2A2F3B] bg-[#1B1F29] p-6">
              <h2
                className="mb-4 text-base font-medium"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Person
              </h2>
              <dl className="grid grid-cols-2 gap-x-10 gap-y-4 sm:grid-cols-3">
                <Field label="Name" value={profile.user.name} />
                <Field label="Email" value={profile.user.email} />
                <Field label="Role" value={profile.user.role} capitalize />
                <Field label="Status" value={profile.user.status} capitalize />
                <Field label="User ID" value={profile.user.user_id} mono />
              </dl>
            </section>

            <section className="border border-[#2A2F3B] bg-[#1B1F29] p-6">
              <h2
                className="mb-4 text-base font-medium"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Card
              </h2>
              {profile.card ? (
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <dl className="grid grid-cols-2 gap-x-10 gap-y-4">
                    <Field label="Card ID" value={profile.card.card_id} mono />
                  </dl>
                  <span
                    className={`border px-3 py-1 text-sm ${cardStatusStyles[profile.card.status]}`}
                  >
                    {profile.card.status}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-[#8B93A7]">
                  No card has been issued to this user.
                </p>
              )}
            </section>

            <section className="border border-[#2A2F3B] bg-[#1B1F29] p-6">
              <h2
                className="mb-4 text-base font-medium"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Classes
              </h2>
              {profile.classrooms.length > 0 ? (
                <ul className="divide-y divide-[#2A2F3B]">
                  {profile.classrooms.map((c) => (
                    <li key={c.classroom_id} className="py-3 first:pt-0 last:pb-0">
                      <p className="text-sm">{c.class_name}</p>
                      <p className="text-sm text-[#8B93A7]">
                        {c.room_id} · {dayLabels[c.day_of_week] ?? c.day_of_week}{" "}
                        {c.start_time}–{c.end_time}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#8B93A7]">
                  Not enrolled in any classes.
                </p>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  mono = false,
  capitalize = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div>
      <dt className="text-sm text-[#8B93A7]">{label}</dt>
      <dd
        className={`mt-0.5 ${mono ? "font-mono tracking-wide" : ""} ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}