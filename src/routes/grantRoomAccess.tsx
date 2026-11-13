import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../auth/fetchWithAuth";

type Room = { room_id: string; building_id: string }; // attribute names are legacy — both hold name strings directly
type User = { user_id: string; name: string; email: string; role: string };

export default function GrantRoomAccess() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [roomError, setRoomError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchOptions() {
      setIsLoadingOptions(true);
      setOptionsError("");
      try {
        const [roomsRes, usersRes] = await Promise.all([
          fetchWithAuth("/admin/rooms"),
          fetchWithAuth("/admin/users"),
        ]);

        if (!roomsRes.ok || !usersRes.ok) {
          throw new Error("Failed to load rooms or users");
        }

        const roomsData = (await roomsRes.json()) as Room[];
        const usersData = (await usersRes.json()) as User[];

        if (!cancelled) {
          setRooms(roomsData);
          setUsers(usersData);
        }
      } catch {
        if (!cancelled) {
          setOptionsError("Couldn't load rooms or users. Try refreshing the page.");
        }
      } finally {
        if (!cancelled) setIsLoadingOptions(false);
      }
    }

    fetchOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [query, users]);

  function toggleUser(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError("");

    if (!roomId) {
      setRoomError("Select a room");
      return;
    }
    setRoomError("");

    if (selectedIds.size === 0) {
      setSubmitError("Select at least one person to grant access to.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth("/admin/roomAccess/createRoomAccess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          userIds: [...selectedIds],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.error ?? "Something went wrong granting access. Try again.");
        return;
      }

      navigate("/admin");
    } catch {
      setSubmitError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const optionsDisabled = isLoadingOptions || !!optionsError;

  return (
    <div
      className="min-h-screen bg-[#12151C] text-[#E8EAEF]"
      style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
    >
      <header className="flex items-center gap-3 border-b border-[#2A2F3B] px-6 py-4">
        <Link
          to="/admin"
          className="text-sm text-[#8B93A7] hover:text-[#E8EAEF]"
          aria-label="Back to admin dashboard"
        >
          ← Back
        </Link>
        <h1
          className="text-lg font-medium tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Grant room access
        </h1>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        {optionsError && (
          <p className="mb-4 text-sm text-[#E8756A]">{optionsError}</p>
        )}

        <form onSubmit={onSubmit} noValidate>
          <div className="mb-6 border border-[#2A2F3B] bg-[#1B1F29] p-6">
            <label className="mb-1.5 block text-sm text-[#8B93A7]">Room</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              disabled={optionsDisabled}
              className={inputClass(!!roomError)}
            >
              <option value="">
                {isLoadingOptions ? "Loading rooms…" : "Select a room…"}
              </option>
              {rooms.map((r) => (
                <option key={r.room_id} value={r.room_id}>
                  {r.room_id} — {r.building_id}
                </option>
              ))}
            </select>
            {roomError && (
              <p className="mt-1.5 text-sm text-[#E8756A]">{roomError}</p>
            )}
            <p className="mt-1.5 text-sm text-[#4A5163]">
              Access lasts indefinitely until revoked — there's no expiry date to set.
            </p>
          </div>

          <div className="border border-[#2A2F3B] bg-[#1B1F29] p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <label className="text-sm text-[#8B93A7]">People</label>
              <span className="text-sm text-[#8B93A7]">
                {selectedIds.size} selected
              </span>
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email"
              disabled={optionsDisabled}
              className={`${inputClass(false)} mb-4`}
            />

            <ul className="max-h-80 divide-y divide-[#2A2F3B] overflow-y-auto border border-[#2A2F3B]">
              {filteredUsers.map((u) => {
                const checked = selectedIds.has(u.user_id);
                return (
                  <li key={u.user_id}>
                    <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-[#12151C]">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleUser(u.user_id)}
                        className="h-4 w-4 accent-[#E8A33D]"
                      />
                      <span className="flex-1">
                        <span className="block text-sm">{u.name}</span>
                        <span className="block text-sm text-[#8B93A7]">
                          {u.email}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm capitalize text-[#4A5163]">
                        {u.role}
                      </span>
                    </label>
                  </li>
                );
              })}

              {!isLoadingOptions && filteredUsers.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-[#8B93A7]">
                  No one matches "{query}".
                </li>
              )}
            </ul>
          </div>

          {submitError && (
            <p className="mt-4 text-sm text-[#E8756A]">{submitError}</p>
          )}

          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting || optionsDisabled}
              className="bg-[#E8A33D] px-4 py-2 text-sm font-medium text-[#12151C] transition-colors hover:bg-[#F0B25A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8A33D] disabled:opacity-60"
            >
              {isSubmitting
                ? "Granting…"
                : `Grant access to ${selectedIds.size || ""} ${selectedIds.size === 1 ? "person" : "people"}`}
            </button>
            <Link to="/admin" className="text-sm text-[#8B93A7] hover:text-[#E8EAEF]">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full border bg-[#12151C] px-3 py-2 text-[#E8EAEF] outline-none placeholder:text-[#4A5163] focus-visible:ring-1 ${
    hasError
      ? "border-[#E8756A] focus-visible:border-[#E8756A] focus-visible:ring-[#E8756A]"
      : "border-[#2A2F3B] focus-visible:border-[#E8A33D] focus-visible:ring-[#E8A33D]"
  }`;
}