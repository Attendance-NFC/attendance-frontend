import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthToken } from "../auth/authToken";
import { fetchWithAuth } from "../auth/fetchWithAuth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type Classroom = { classroom_id: string; class_name: string };
type Student = { user_id: string; name: string; email: string };

export default function EnrollStudentsPage() {
  const navigate = useNavigate();
  const [classroomId, setClassroomId] = useState("");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [classroomError, setClassroomError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchOptions() {
      setIsLoadingOptions(true);
      setOptionsError("");
      try {
        const [classroomsRes, studentsRes] = await Promise.all([
          fetchWithAuth('/admin/classrooms'),
          fetchWithAuth('/admin/students'),
        ]);

        if (!classroomsRes.ok || !studentsRes.ok) {
          throw new Error("Failed to load classrooms or students");
        }

        const classroomsData = (await classroomsRes.json()) as Classroom[];
        const studentsData = (await studentsRes.json()) as Student[];

        if (!cancelled) {
          setClassrooms(classroomsData);
          setStudents(studentsData);
        }
      } catch {
        if (!cancelled) {
          setOptionsError("Couldn't load classrooms or students. Try refreshing the page.");
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

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }, [query, students]);

  function toggleStudent(id: string) {
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
      const response = await fetchWithAuth('/admin/enrollments/createEnrollments', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classroomId,
          studentIds: [...selectedIds],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.error ?? "Something went wrong enrolling these students. Try again.");
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
          Enroll students
        </h1>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        {optionsError && (
          <p className="mb-4 text-sm text-[#E8756A]">{optionsError}</p>
        )}

        <form onSubmit={onSubmit} noValidate>
          <div className="mb-6 border border-[#2A2F3B] bg-[#1B1F29] p-6">
            <label className="mb-1.5 block text-sm text-[#8B93A7]">
              Classroom
            </label>
            <select
              value={classroomId}
              onChange={(e) => setClassroomId(e.target.value)}
              disabled={optionsDisabled}
              className={inputClass(!!classroomError)}
            >
              <option value="">
                {isLoadingOptions ? "Loading classrooms…" : "Select a classroom…"}
              </option>
              {classrooms.map((c) => (
                <option key={c.classroom_id} value={c.classroom_id}>
                  {c.class_name}
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
              disabled={optionsDisabled}
              className={`${inputClass(false)} mb-4`}
            />

            <ul className="max-h-80 divide-y divide-[#2A2F3B] overflow-y-auto border border-[#2A2F3B]">
              {filteredStudents.map((s) => {
                const checked = selectedIds.has(s.user_id);
                return (
                  <li key={s.user_id}>
                    <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-[#12151C]">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleStudent(s.user_id)}
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

              {!isLoadingOptions && filteredStudents.length === 0 && (
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
              disabled={isSubmitting || optionsDisabled}
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