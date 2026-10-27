import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthToken } from "../auth/authToken";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type Teacher = {
  user_id: string;
  name: string;
};

type FormValues = {
  name: string;
  teacherId: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  name: "",
  teacherId: "",
};

export default function CreateClassroomPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);
  const [teachersError, setTeachersError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchTeachers() {
      setIsLoadingTeachers(true);
      setTeachersError("");
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/admin/teachers`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load teachers");
        }

        const data = (await response.json()) as Teacher[];
        if (!cancelled) setTeachers(data);
      } catch {
        if (!cancelled) {
          setTeachersError("Couldn't load the teacher list. Try refreshing the page.");
        }
      } finally {
        if (!cancelled) setIsLoadingTeachers(false);
      }
    }

    fetchTeachers();
    return () => {
      cancelled = true; // avoid setting state if the component unmounts mid-fetch
    };
  }, []);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(v: FormValues): FormErrors {
    const next: FormErrors = {};
    if (!v.name.trim()) next.name = "Enter a classroom name";
    if (!v.teacherId) next.teacherId = "Select a teacher";
    return next;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError("");

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/admin/classrooms/createClassroom`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: values.name,
          teacherId: values.teacherId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.error ?? "Something went wrong creating this classroom. Try again.");
        return;
      }

      navigate("/admin/classrooms");
    } catch {
      setSubmitError("Couldn't reach the server. Check your connection and try again.");
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
          Create classroom
        </h1>
      </header>

      <main className="mx-auto max-w-xl px-6 py-8">
        <form
          onSubmit={onSubmit}
          noValidate
          className="border border-[#2A2F3B] bg-[#1B1F29] p-6"
        >
          <Field label="Classroom name" error={errors.name}>
            <input
              type="text"
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputClass(!!errors.name)}
              placeholder="Algebra II, 3rd Period"
            />
          </Field>

          <Field
            label="Teacher"
            error={errors.teacherId || teachersError}
            hint="Who this classroom belongs to."
          >
            <select
              value={values.teacherId}
              onChange={(e) => update("teacherId", e.target.value)}
              disabled={isLoadingTeachers || !!teachersError}
              className={inputClass(!!errors.teacherId || !!teachersError)}
            >
              <option value="">
                {isLoadingTeachers ? "Loading teachers…" : "Select a teacher…"}
              </option>
              {teachers.map((t) => (
                <option key={t.user_id} value={t.user_id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>

          {submitError && (
            <p className="mb-4 text-sm text-[#E8756A]">{submitError}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#E8A33D] px-4 py-2 text-sm font-medium text-[#12151C] transition-colors hover:bg-[#F0B25A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8A33D] disabled:opacity-60"
            >
              {isSubmitting ? "Creating…" : "Create classroom"}
            </button>
            <Link
              to="/admin"
              className="text-sm text-[#8B93A7] hover:text-[#E8EAEF]"
            >
              Cancel
            </Link>
          </div>
        </form>

        <p className="mt-4 text-sm text-[#4A5163]">
          Room and schedule assignment aren't set up here yet — those are
          currently managed directly in AWS.
        </p>
      </main>
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-sm text-[#8B93A7]">{label}</label>
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-sm text-[#4A5163]">{hint}</p>
      )}
      {error && <p className="mt-1.5 text-sm text-[#E8756A]">{error}</p>}
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