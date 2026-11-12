import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAuthToken } from "../auth/authToken";
import { fetchWithAuth } from "../auth/fetchWithAuth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type CardStatus = "Active" | "Suspended" | "Expired" | "Revoked";

type User = {
  user_id: string;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  card_id: string;
  card_status: CardStatus;
};

const statusStyles: Record<CardStatus, string> = {
  Active: "border-[#3E7A5C] text-[#7FD1A3]",
  Suspended: "border-[#E8A33D] text-[#E8A33D]",
  Expired: "border-[#8B93A7] text-[#8B93A7]",
  Revoked: "border-[#E8756A] text-[#E8756A]",
};

export default function UsersList() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchUsers() {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetchWithAuth('/admin/users');

        if (!response.ok) {
          throw new Error("Failed to load users");
        }

        const data = (await response.json()) as User[];
        if (!cancelled) setUsers(data);
      } catch {
        if (!cancelled) setError("Couldn't load users. Try refreshing the page.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchUsers();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.card_id?.toLowerCase().includes(q)
    );
  }, [query, users]);

  return (
    <div
      className="min-h-screen bg-[#12151C] text-[#E8EAEF]"
      style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
    >
      <header className="flex items-center justify-between border-b border-[#2A2F3B] px-6 py-4">
        <div className="flex items-center gap-3">
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
            Users
          </h1>
        </div>
        <Link
          to="/admin/users/new"
          className="bg-[#E8A33D] px-4 py-2 text-sm font-medium text-[#12151C] transition-colors hover:bg-[#F0B25A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8A33D]"
        >
          Create user
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or card ID"
            className="w-full max-w-sm border border-[#2A2F3B] bg-[#1B1F29] px-3 py-2 text-sm text-[#E8EAEF] outline-none placeholder:text-[#4A5163] focus-visible:border-[#E8A33D] focus-visible:ring-1 focus-visible:ring-[#E8A33D]"
          />
        </div>

        {isLoading && <p className="text-sm text-[#8B93A7]">Loading…</p>}

        {!isLoading && error && (
          <p className="text-sm text-[#E8756A]">{error}</p>
        )}

        {!isLoading && !error && (
          <div className="overflow-x-auto border border-[#2A2F3B]">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#2A2F3B] bg-[#1B1F29] text-left text-[#8B93A7]">
                  <th className="px-4 py-3 font-normal">Name</th>
                  <th className="px-4 py-3 font-normal">Role</th>
                  <th className="px-4 py-3 font-normal">Card ID</th>
                  <th className="px-4 py-3 font-normal">Status</th>
                  <th className="px-4 py-3 font-normal" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.user_id}
                    className="border-b border-[#2A2F3B] bg-[#1B1F29] last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <p>{u.name}</p>
                      <p className="text-[#8B93A7]">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 capitalize text-[#8B93A7]">{u.role}</td>
                    <td className="px-4 py-3 font-mono tracking-wide text-[#8B93A7]">
                      {u.card_id ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {u.card_status ? (
                        <span
                          className={`inline-block border px-2 py-0.5 text-xs ${statusStyles[u.card_status]}`}
                        >
                          {u.card_status}
                        </span>
                      ) : (
                        <span className="text-[#4A5163]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/users/${u.user_id}`}
                        className="text-[#8B93A7] underline decoration-[#2A2F3B] underline-offset-4 hover:text-[#E8EAEF]"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[#8B93A7]">
                      No users match "{query}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}