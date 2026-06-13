import Link from "next/link";

export function AuthCard({
  title,
  description,
  children,
  footer,
  error,
  message,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  error?: string;
  message?: string;
}) {
  return (
    <section className="mx-auto max-w-lg rounded-2xl border border-line-soft bg-white p-6 shadow-card sm:p-8">
      <p className="text-sm font-black uppercase tracking-wide text-ember">Cuenta gratuita</p>
      <h1 className="mt-2 text-3xl font-black">{title}</h1>
      <p className="mt-3 leading-7 text-slate-600">{description}</p>
      {error ? <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
      {message ? <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{message}</p> : null}
      <div className="mt-6">{children}</div>
      <div className="mt-6 border-t border-line-soft pt-5 text-sm text-slate-600">{footer}</div>
      <Link href="/" className="mt-5 inline-flex text-sm font-bold text-ember hover:underline">
        Continuar como visitante
      </Link>
    </section>
  );
}

export function AuthField({
  label,
  name,
  type = "text",
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <input
        required
        name={name}
        type={type}
        autoComplete={autoComplete}
        className="mt-2 w-full rounded-xl border border-line-soft bg-slate-50 px-4 py-3 outline-none focus:border-tech-cyan focus:ring-2 focus:ring-cyan-100"
      />
    </label>
  );
}

export function AuthSubmit({ children }: { children: React.ReactNode }) {
  return (
    <button className="w-full rounded-xl bg-ember px-5 py-3 font-black text-white hover:bg-ember-dark">
      {children}
    </button>
  );
}
