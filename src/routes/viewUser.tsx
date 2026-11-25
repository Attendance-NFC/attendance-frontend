import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchWithAuth } from "../auth/fetchWithAuth";

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
  roomAccess: { room_id: string; building_id: string }[];
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

  // Which room's "Remove" button is currently showing its confirm step.
  const [confirmingRoomId, setConfirmingRoomId] = useState<string | null>(null);
  const [revokingRoomId, setRevokingRoomId] = useState<string | null>(null);
  const [revokeError, setRevokeError] = useState("");

  // Same pattern, for removing a single scheduled class meeting. Keyed by
  // "room_id|day_of_week|start_time" since classroom_id alone isn't unique
  // across a classroom's multiple weekly meetings.
  const [confirmingScheduleKey, setConfirmingScheduleKey] = useState<string | null>(null);
  const [revokingScheduleKey, setRevokingScheduleKey] = useState<string | null>(null);
  const [scheduleRevokeError, setScheduleRevokeError] = useState("");

  async function fetchProfile() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetchWithAuth(`/admin/users/${userId}`);

      if (!response.ok) {
        throw new Error("Failed to load user");
      }

      const data = (await response.json()) as UserProfile;
      setProfile(data);
    } catch {
      setError("Couldn't load this user. Try refreshing the page.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  async function onConfirmRevoke(roomId: string) {
    if (!userId) return;
    setRevokeError("");
    setRevokingRoomId(roomId);
    try {
      const response = await fetchWithAuth(
        `/admin/roomAccess/${roomId}/${userId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to remove access");
      }

      // Refetch rather than just filtering client-side, so the page
      // reflects exactly what the backend now has.
      await fetchProfile();
    } catch (err) {
      setRevokeError((err as Error).message || "Couldn't remove access. Try again.");
    } finally {
      setRevokingRoomId(null);
      setConfirmingRoomId(null);
    }
  }

  async function onConfirmRemoveSchedule(
    roomId: string,
    dayOfWeek: string,
    startTime: string,
    key: string
  ) {
    setScheduleRevokeError("");
    setRevokingScheduleKey(key);
    try {
      const response = await fetchWithAuth(
        `/admin/schedule/${roomId}/${dayOfWeek}/${startTime}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to remove this class meeting");
      }

      await fetchProfile();
    } catch (err) {
      setScheduleRevokeError(
        (err as Error).message || "Couldn't remove this class meeting. Try again."
      );
    } finally {
      setRevokingScheduleKey(null);
      setConfirmingScheduleKey(null);
    }
  }

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
                Room access
              </h2>
              {revokeError && (
                <p className="mb-3 text-sm text-[#E8756A]">{revokeError}</p>
              )}
              {profile.roomAccess.length > 0 ? (
                <ul className="divide-y divide-[#2A2F3B]">
                  {profile.roomAccess.map((r) => {
                    const isConfirming = confirmingRoomId === r.room_id;
                    const isRevoking = revokingRoomId === r.room_id;
                    return (
                      <li
                        key={r.room_id}
                        className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                      >
                        <div>
                          <p className="text-sm">{r.room_id}</p>
                          <p className="text-sm text-[#8B93A7]">{r.building_id}</p>
                        </div>

                        {isConfirming ? (
                          <div className="flex shrink-0 items-center gap-3">
                            <span className="text-sm text-[#8B93A7]">
                              Remove access?
                            </span>
                            <button
                              onClick={() => onConfirmRevoke(r.room_id)}
                              disabled={isRevoking}
                              className="text-sm font-medium text-[#E8756A] hover:text-[#f08b80] disabled:opacity-60"
                            >
                              {isRevoking ? "Removing…" : "Confirm"}
                            </button>
                            <button
                              onClick={() => setConfirmingRoomId(null)}
                              disabled={isRevoking}
                              className="text-sm text-[#8B93A7] hover:text-[#E8EAEF]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmingRoomId(r.room_id)}
                            className="shrink-0 text-sm text-[#E8756A] underline decoration-[#2A2F3B] underline-offset-4 hover:text-[#f08b80]"
                          >
                            Remove
                          </button>
                        )}
                      </li>
                    );
                  })}
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
              {scheduleRevokeError && (
                <p className="mb-3 text-sm text-[#E8756A]">{scheduleRevokeError}</p>
              )}
              {profile.classrooms.length > 0 ? (
                <ul className="divide-y divide-[#2A2F3B]">
                  {profile.classrooms.map((c) => {
                    // Unique per meeting, not per classroom — a class meeting
                    // twice a week produces two rows with two different keys.
                    const key = `${c.room_id}|${c.day_of_week}|${c.start_time}`;
                    const isConfirming = confirmingScheduleKey === key;
                    const isRevoking = revokingScheduleKey === key;

                    return (
                      <li
                        key={key}
                        className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                      >
                        <div>
                          <p className="text-sm">{c.class_name}</p>
                          <p className="text-sm text-[#8B93A7]">
                            {c.room_id} · {dayLabels[c.day_of_week] ?? c.day_of_week}{" "}
                            {c.start_time}–{c.end_time}
                          </p>
                        </div>

                        {isConfirming ? (
                          <div className="flex shrink-0 items-center gap-3">
                            <span className="text-sm text-[#8B93A7]">Remove?</span>
                            <button
                              onClick={() =>
                                onConfirmRemoveSchedule(
                                  c.room_id,
                                  c.day_of_week,
                                  c.start_time,
                                  key
                                )
                              }
                              disabled={isRevoking}
                              className="text-sm font-medium text-[#E8756A] hover:text-[#f08b80] disabled:opacity-60"
                            >
                              {isRevoking ? "Removing…" : "Confirm"}
                            </button>
                            <button
                              onClick={() => setConfirmingScheduleKey(null)}
                              disabled={isRevoking}
                              className="text-sm text-[#8B93A7] hover:text-[#E8EAEF]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmingScheduleKey(key)}
                            className="shrink-0 text-sm text-[#E8756A] underline decoration-[#2A2F3B] underline-offset-4 hover:text-[#f08b80]"
                          >
                            Remove
                          </button>
                        )}
                      </li>
                    );
                  })}
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