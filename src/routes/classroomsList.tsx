import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAuthToken } from "../auth/authToken";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type Classroom = {
  classroom_id: string;
  class_name: string;
  teacher_id: string;
};

export default function ClassroomsListPage() {
  const [query, setQuery] = useState("");
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchClassrooms() {
      setIsLoading(true);
      setError("");
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/admin/classrooms`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load classrooms");
        }

        const data = (await response.json()) as Classroom[];
        if (!cancelled) setClassrooms(data);
      } catch {
        if (!cancelled) setError("Couldn't load classrooms. Try refreshing the page.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchClassrooms();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return classrooms;
    return classrooms.filter(
      (c) =>
        c.class_name.toLowerCase().includes(q) ||
        c.teacher_id.toLowerCase().includes(q)
    );
  }, [query, classrooms]);

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
            Classrooms
          </h1>
        </div>
        <Link
          to="/admin/classrooms/new"
          className="bg-[#E8A33D] px-4 py-2 text-sm font-medium text-[#12151C] transition-colors hover:bg-[#F0B25A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8A33D]"
        >
          Create classroom
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by classroom or teacher ID"
            disabled={isLoading || !!error}
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
                  <th className="px-4 py-3 font-normal">Classroom</th>
                  <th className="px-4 py-3 font-normal">Teacher ID</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.classroom_id}
                    className="border-b border-[#2A2F3B] bg-[#1B1F29] last:border-b-0"
                  >
                    <td className="px-4 py-3">{c.class_name}</td>
                    <td className="px-4 py-3 font-mono text-[#8B93A7]">
                      {c.teacher_id}
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-[#8B93A7]">
                      No classrooms match "{query}".
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