import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

// Mock data — replace with GET /admin/classrooms and GET /admin/students.
const classrooms = [
  { id: "class_12", name: "Algebra II, 3rd Period" },
  { id: "class_42", name: "Chemistry, 1st Period" },
  { id: "class_19", name: "World History, 5th Period" },
];

const students = [
  { id: "u1", name: "Alex Morgan", email: "alex.morgan@school.edu" },
  { id: "u3", name: "Jordan Lee", email: "jordan.lee@school.edu" },
  { id: "u5", name: "Taylor Reyes", email: "taylor.reyes@school.edu" },
  { id: "u6", name: "Casey Nguyen", email: "casey.nguyen@school.edu" },
  { id: "u8", name: "Morgan Patel", email: "morgan.patel@school.edu" },
  { id: "u10", name: "Riley Kim", email: "riley.kim@school.edu" },
];

export default function EnrollStudents() {
  const navigate = useNavigate();
  const [classroomId, setClassroomId] = useState("");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [classroomError, setClassroomError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }, [query]);

  function toggleStudent(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Stub for now — swap in a real POST /admin/enrollments call (batch write) once the backend is ready.
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError("");

    if (!classroomId) {
      setClassroomError("Select a classroom");
      return;
    }
    setClassroomError("");

    if (selectedIds.size === 0) {
      setSubmitError("Select at least one student to enroll.");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      console.log("enroll students", { classroomId, studentIds: [...selectedIds] });
      navigate("/admin");
    } catch {
      setSubmitError("Something went wrong enrolling these students. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
          Enroll students
        </h1>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <form onSubmit={onSubmit} noValidate>
          <div className="mb-6 border border-[#2A2F3B] bg-[#1B1F29] p-6">
            <label className="mb-1.5 block text-sm text-[#8B93A7]">
              Classroom
            </label>
            <select
              value={classroomId}
              onChange={(e) => setClassroomId(e.target.value)}
              className={inputClass(!!classroomError)}
            >
              <option value="">Select a classroom…</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {classroomError && (
              <p className="mt-1.5 text-sm text-[#E8756A]">{classroomError}</p>
            )}
          </div>

          <div className="border border-[#2A2F3B] bg-[#1B1F29] p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <label className="text-sm text-[#8B93A7]">Students</label>
              <span className="text-sm text-[#8B93A7]">
                {selectedIds.size} selected
              </span>
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email"
              className={`${inputClass(false)} mb-4`}
            />

            <ul className="max-h-80 divide-y divide-[#2A2F3B] overflow-y-auto border border-[#2A2F3B]">
              {filteredStudents.map((s) => {
                const checked = selectedIds.has(s.id);
                return (
                  <li key={s.id}>
                    <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-[#12151C]">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleStudent(s.id)}
                        className="h-4 w-4 accent-[#E8A33D]"
                      />
                      <span className="flex-1">
                        <span className="block text-sm">{s.name}</span>
                        <span className="block text-sm text-[#8B93A7]">
                          {s.email}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}

              {filteredStudents.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-[#8B93A7]">
                  No students match "{query}".
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
              disabled={isSubmitting}
              className="bg-[#E8A33D] px-4 py-2 text-sm font-medium text-[#12151C] transition-colors hover:bg-[#F0B25A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8A33D] disabled:opacity-60"
            >
              {isSubmitting
                ? "Enrolling…"
                : `Enroll ${selectedIds.size || ""} student${selectedIds.size === 1 ? "" : "s"}`}
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