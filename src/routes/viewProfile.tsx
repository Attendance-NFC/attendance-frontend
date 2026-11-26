import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../auth/fetchWithAuth";
import { setAuthToken } from "../auth/authToken";
import { getCsrfToken } from "../auth/csrfToken";

type CardStatus = "Active" | "Suspended" | "Expired" | "Revoked";

type Profile = {
  user: {
    user_id: string;
    name: string;
    email: string;
    role: "admin" | "teacher" | "student";
    status: "Active" | "Inactive";
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
  roomAccess: { room_id: string; building_id: string }[];
};

const cardStatusStyles: Record<CardStatus, string> = {
  Active: "border-[#3E7A5C] text-[#7FD1A3]",
  Suspended: "border-[#E8A33D] text-[#E8A33D]",
  Expired: "border-[#8B93A7] text-[#8B93A7]",
  Revoked: "border-[#E8756A] text-[#E8756A]",
};

const dayLabels: Record<string, string> = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
};

export default function viewProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function onSignOut() {
    try {
      const csrfToken = getCsrfToken();
      await fetchWithAuth("/logout", {
        method: "POST",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
      });
    } catch {
      // Even if the request fails, still clear locally and redirect below.
    } finally {
      setAuthToken(null);
      navigate("/login");
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetchWithAuth("/student");

        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        const data = (await response.json()) as Profile;
        if (!cancelled) setProfile(data);
      } catch {
        if (!cancelled) setError("Couldn't load your profile. Try refreshing the page.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, []);

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
          My profile
        </h1>
        <button
          onClick={onSignOut}
          className="text-sm text-[#8B93A7] underline decoration-[#2A2F3B] underline-offset-4 hover:text-[#E8EAEF]"
        >
          Sign out
        </button>
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
                  No card has been issued to you.
                </p>
              )}
            </section>

            <section className="border border-[#2A2F3B] bg-[#1B1F29] p-6">
              <h2
                className="mb-4 text-base font-medium"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Room access
              </h2>
              {profile.roomAccess.length > 0 ? (
                <ul className="divide-y divide-[#2A2F3B]">
                  {profile.roomAccess.map((r) => (
                    <li key={r.room_id} className="py-3 first:pt-0 last:pb-0">
                      <p className="text-sm">{r.room_id}</p>
                      <p className="text-sm text-[#8B93A7]">{r.building_id}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#8B93A7]">
                  No direct room access granted.
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
                  {profile.classrooms.map((c, i) => (
                    <li
                      key={`${c.room_id}|${c.day_of_week}|${c.start_time}|${i}`}
                      className="py-3 first:pt-0 last:pb-0"
                    >
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