import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthToken } from "../auth/authToken";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type Room = { room_id: string; building_id: string }; // attribute names are legacy — both hold name strings directly, not generated IDs
type Classroom = { classroom_id: string; class_name: string };

type FormValues = {
  roomName: string;
  classroomId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  roomName: "",
  classroomId: "",
  dayOfWeek: "MON",
  startTime: "",
  endTime: "",
};

const daysOfWeek = [
  { value: "MON", label: "Monday" },
  { value: "TUE", label: "Tuesday" },
  { value: "WED", label: "Wednesday" },
  { value: "THU", label: "Thursday" },
  { value: "FRI", label: "Friday" },
];

export default function CreateSchedulePage() {
  const navigate = useNavigate();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [rooms, setRooms] = useState<Room[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchOptions() {
      setIsLoadingOptions(true);
      setOptionsError("");
      try {
        const token = getAuthToken();
        const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        const [roomsRes, classroomsRes] = await Promise.all([
          fetch(`${API_URL}/admin/rooms`, { headers: authHeader }),
          fetch(`${API_URL}/admin/classrooms`, { headers: authHeader }),
        ]);

        if (!roomsRes.ok || !classroomsRes.ok) {
          throw new Error("Failed to load rooms or classrooms");
        }

        const roomsData = (await roomsRes.json()) as Room[];
        const classroomsData = (await classroomsRes.json()) as Classroom[];

        if (!cancelled) {
          setRooms(roomsData);
          setClassrooms(classroomsData);
        }
      } catch {
        if (!cancelled) {
          setOptionsError("Couldn't load rooms or classrooms. Try refreshing the page.");
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

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(v: FormValues): FormErrors {
    const next: FormErrors = {};
    if (!v.roomName) next.roomName = "Select a room";
    if (!v.classroomId) next.classroomId = "Select a classroom";
    if (!v.startTime) next.startTime = "Set a start time";
    if (!v.endTime) next.endTime = "Set an end time";
    if (v.startTime && v.endTime && v.startTime >= v.endTime) {
      next.endTime = "End time must be after start time";
    }
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
      const response = await fetch(`${API_URL}/admin/schedule/createSchedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          roomName: values.roomName,
          classroomId: values.classroomId,
          dayOfWeek: values.dayOfWeek,
          startTime: values.startTime,
          endTime: values.endTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.error ?? "Something went wrong creating this schedule block. Try again.");
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
          Create schedule block
        </h1>
      </header>

      <main className="mx-auto max-w-xl px-6 py-8">
        <form
          onSubmit={onSubmit}
          noValidate
          className="border border-[#2A2F3B] bg-[#1B1F29] p-6"
        >
          {optionsError && (
            <p className="mb-4 text-sm text-[#E8756A]">{optionsError}</p>
          )}

          <Field label="Room" error={errors.roomName}>
            <select
              value={values.roomName}
              onChange={(e) => update("roomName", e.target.value)}
              disabled={optionsDisabled}
              className={inputClass(!!errors.roomName)}
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
          </Field>

          <Field label="Classroom" error={errors.classroomId}>
            <select
              value={values.classroomId}
              onChange={(e) => update("classroomId", e.target.value)}
              disabled={optionsDisabled}
              className={inputClass(!!errors.classroomId)}
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
          </Field>

          <Field label="Day of week">
            <select
              value={values.dayOfWeek}
              onChange={(e) => update("dayOfWeek", e.target.value)}
              className={inputClass(false)}
            >
              {daysOfWeek.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <Field label="Start time" error={errors.startTime}>
              <input
                type="time"
                value={values.startTime}
                onChange={(e) => update("startTime", e.target.value)}
                className={inputClass(!!errors.startTime)}
              />
            </Field>
            <Field label="End time" error={errors.endTime}>
              <input
                type="time"
                value={values.endTime}
                onChange={(e) => update("endTime", e.target.value)}
                className={inputClass(!!errors.endTime)}
              />
            </Field>
          </div>

          {submitError && (
            <p className="mb-4 text-sm text-[#E8756A]">{submitError}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting || optionsDisabled}
              className="bg-[#E8A33D] px-4 py-2 text-sm font-medium text-[#12151C] transition-colors hover:bg-[#F0B25A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8A33D] disabled:opacity-60"
            >
              {isSubmitting ? "Creating…" : "Create schedule block"}
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

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-sm text-[#8B93A7]">{label}</label>
      {children}
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