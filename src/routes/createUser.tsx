import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

type Role = "admin" | "staff" | "member";
type CardStatus = "Active" | "Suspended";

type FormValues = {
  name: string;
  email: string;
  role: Role;
  cardId: string;
  cardStatus: CardStatus;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  name: "",
  email: "",
  role: "member",
  cardId: "",
  cardStatus: "Active",
};

export default function createUser() {
  const navigate = useNavigate();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(v: FormValues): FormErrors {
    const next: FormErrors = {};
    if (!v.name.trim()) next.name = "Enter a name";
    if (!v.email.trim()) next.email = "Enter an email";
    else if (!/^\S+@\S+\.\S+$/.test(v.email)) next.email = "Enter a valid email";
    if (!v.cardId.trim()) next.cardId = "Enter a card ID";
    return next;
  }

  // Stub for now — swap in a real POST /admin/users call once the backend is ready.
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError("");

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      console.log("create user", values);
      navigate("/admin/users");
    } catch {
      setSubmitError("Something went wrong creating this user. Try again.");
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
          Create user
        </h1>
      </header>

      <main className="mx-auto max-w-xl px-6 py-8">
        <form
          onSubmit={onSubmit}
          noValidate
          className="border border-[#2A2F3B] bg-[#1B1F29] p-6"
        >
          <fieldset className="mb-6">
            <legend className="mb-4 text-sm text-[#8B93A7]">Person</legend>

            <Field label="Full name" error={errors.name}>
              <input
                type="text"
                value={values.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputClass(!!errors.name)}
                placeholder="Jordan Lee"
              />
            </Field>

            <Field label="Email" error={errors.email}>
              <input
                type="email"
                value={values.email}
                onChange={(e) => update("email", e.target.value)}
                className={inputClass(!!errors.email)}
                placeholder="jordan.lee@school.edu"
              />
            </Field>

            <Field label="Role">
              <select
                value={values.role}
                onChange={(e) => update("role", e.target.value as Role)}
                className={inputClass(false)}
              >
                <option value="member">Member</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
          </fieldset>

          <fieldset className="mb-6">
            <legend className="mb-4 text-sm text-[#8B93A7]">Card</legend>

            <Field
              label="Card ID"
              error={errors.cardId}
              hint="The NFC code read off the physical card."
            >
              <input
                type="text"
                value={values.cardId}
                onChange={(e) => update("cardId", e.target.value)}
                className={`${inputClass(!!errors.cardId)} font-mono tracking-wide`}
                placeholder="A1-4F2A"
              />
            </Field>

            <Field label="Initial status">
              <select
                value={values.cardStatus}
                onChange={(e) => update("cardStatus", e.target.value as CardStatus)}
                className={inputClass(false)}
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </Field>
          </fieldset>

          {submitError && (
            <p className="mb-4 text-sm text-[#E8756A]">{submitError}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#E8A33D] px-4 py-2 text-sm font-medium text-[#12151C] transition-colors hover:bg-[#F0B25A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8A33D] disabled:opacity-60"
            >
              {isSubmitting ? "Creating…" : "Create user"}
            </button>
            <Link
              to="/admin/users"
              className="text-sm text-[#8B93A7] hover:text-[#E8EAEF]"
            >
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