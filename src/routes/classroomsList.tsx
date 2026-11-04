import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

type Classroom = {
  id: string;
  name: string;
  roomName: string;
  teacherName: string;
};

// Mock data — in practice this is a join your backend does across
// Classrooms, Schedule (for the room), and Users (for the teacher's name),
// since Classrooms itself only stores teacher_id, and the room comes from
// Schedule via the ClassroomScheduleIndex GSI.
const classrooms: Classroom[] = [
  { id: "class_12", name: "Algebra II, 3rd Period", roomName: "Room 204", teacherName: "Sam Okafor" },
  { id: "class_42", name: "Chemistry, 1st Period", roomName: "Science Lab B", teacherName: "Priya Singh" },
  { id: "class_19", name: "World History, 5th Period", roomName: "Room 118", teacherName: "Jordan Lee" },
  { id: "class_27", name: "Computer Science, 2nd Period", roomName: "Computer Lab", teacherName: "Priya Singh" },
];

export default function ClassroomsList() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return classrooms;
    return classrooms.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.roomName.toLowerCase().includes(q) ||
        c.teacherName.toLowerCase().includes(q)
    );
  }, [query]);

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
            placeholder="Search by classroom, room, or teacher"
            className="w-full max-w-sm border border-[#2A2F3B] bg-[#1B1F29] px-3 py-2 text-sm text-[#E8EAEF] outline-none placeholder:text-[#4A5163] focus-visible:border-[#E8A33D] focus-visible:ring-1 focus-visible:ring-[#E8A33D]"
          />
        </div>

        <div className="overflow-x-auto border border-[#2A2F3B]">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#2A2F3B] bg-[#1B1F29] text-left text-[#8B93A7]">
                <th className="px-4 py-3 font-normal">Classroom</th>
                <th className="px-4 py-3 font-normal">Room</th>
                <th className="px-4 py-3 font-normal">Teacher</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-[#2A2F3B] bg-[#1B1F29] last:border-b-0"
                >
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3 text-[#8B93A7]">{c.roomName}</td>
                  <td className="px-4 py-3 text-[#8B93A7]">{c.teacherName}</td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-[#8B93A7]">
                    No classrooms match "{query}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}